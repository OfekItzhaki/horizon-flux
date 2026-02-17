import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from '../email/email.service';
import { User, Prisma } from '@prisma/client';
import { TodoListsService } from '../todo-lists/todo-lists.service';

type UserWithRelations = Prisma.UserGetPayload<{
  include: {
    lists: {
      include: {
        tasks: true;
      };
    };
    shares: {
      include: {
        toDoList: {
          include: {
            tasks: true;
          };
        };
      };
    };
  };
}>;

type SanitizedUser = Omit<User, 'passwordHash' | 'emailVerificationOtp'>;

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    private prisma: PrismaService,
    private emailService: EmailService,
    private todoListsService: TodoListsService,
  ) { }

  private sanitizeUser<
    T extends {
      passwordHash?: string | null;
      emailVerificationOtp?: string | null;
    },
  >(user: T | null): Omit<T, 'passwordHash' | 'emailVerificationOtp'> | null {
    if (!user) {
      return null;
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { passwordHash, emailVerificationOtp, ...rest } = user;
    return rest;
  }

  async findByEmail(email: string): Promise<User | null> {
    try {
      this.logger.log(`Finding user by email: ${email}`);
      const user = await this.prisma.user.findFirst({
        where: {
          email,
          deletedAt: null,
        },
      });
      this.logger.log(`User found: ${user ? user.id : 'null'}`);
      return user;
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      this.logger.error(`Error finding user by email=${email}: ${err.message}`, err.stack);
      throw error;
    }
  }

  async findById(id: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: {
        id,
        deletedAt: null,
      },
    });
  }

  async getAllUsers(requestingUserId: string): Promise<SanitizedUser[]> {
    const user = await this.getUser(requestingUserId, requestingUserId);
    return user ? [user] : [];
  }

  async getUser(
    id: string,
    requestingUserId: string,
  ): Promise<Omit<UserWithRelations, 'passwordHash' | 'emailVerificationOtp'>> {
    if (id !== requestingUserId) {
      throw new ForbiddenException('You can only access your own profile');
    }

    const user = await this.prisma.user.findFirst({
      where: {
        id,
        deletedAt: null,
      },
      include: {
        lists: {
          where: {
            deletedAt: null,
          },
          include: {
            tasks: {
              where: {
                deletedAt: null,
              },
            },
          },
        },
        shares: {
          include: {
            toDoList: {
              include: {
                tasks: {
                  where: {
                    deletedAt: null,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    // Filter out shares with deleted toDoList and their deleted tasks
    const sanitized: UserWithRelations = {
      ...user,
      shares: user.shares
        .filter((share) => share.toDoList && share.toDoList.deletedAt === null)
        .map((share) => ({
          ...share,
          toDoList: {
            ...share.toDoList,
            tasks: share.toDoList.tasks.filter((task) => task.deletedAt === null),
          },
        })),
    };

    const result = this.sanitizeUser(sanitized);
    if (!result) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return result;
  }

  async upsertUserFromJwt(payload: { sub: string; email: string; name?: string }): Promise<User> {
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
    });

    if (user) {
      return user;
    }

    // Provision new user
    const newUser = await this.prisma.user.create({
      data: {
        id: payload.sub,
        email: payload.email,
        name: payload.name || payload.email.split('@')[0],
        emailVerified: true, // Trusted from IdP
      },
    });

    await this.todoListsService.seedDefaultLists(newUser.id);
    return newUser;
  }

  async updateUser(
    id: string,
    data: UpdateUserDto,
    requestingUserId: string,
  ): Promise<SanitizedUser> {
    await this.getUser(id, requestingUserId); // This will throw if user doesn't exist or unauthorized

    const updateData: Prisma.UserUpdateInput = {};
    if (data.email !== undefined) updateData.email = data.email;
    if (data.name !== undefined) updateData.name = data.name;
    if (data.profilePicture !== undefined) updateData.profilePicture = data.profilePicture;
    if (data.notificationFrequency !== undefined) {
      updateData.notificationFrequency = data.notificationFrequency;
    }
    if (data.trashRetentionDays !== undefined) {
      updateData.trashRetentionDays = data.trashRetentionDays;
    }

    const user = await this.prisma.user.update({
      where: { id },
      data: updateData,
    });

    const sanitized = this.sanitizeUser(user);
    if (!sanitized) {
      throw new Error('Failed to update user');
    }
    return sanitized;
  }

  async deleteUser(id: string, requestingUserId: string): Promise<SanitizedUser> {
    await this.getUser(id, requestingUserId); // This will throw if user doesn't exist

    const user = await this.prisma.user.update({
      where: { id },
      data: {
        deletedAt: new Date(),
      },
    });

    const sanitized = this.sanitizeUser(user);
    if (!sanitized) {
      throw new Error('Failed to delete user');
    }
    return sanitized;
  }
}
