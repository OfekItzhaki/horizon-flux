import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UpdateProfilePictureCommand } from '../update-profile-picture.command';
import { IdentityServiceClient } from '../../../common/identity-service-client';
import { NotFoundException, BadRequestException } from '@nestjs/common';

@CommandHandler(UpdateProfilePictureCommand)
export class UpdateProfilePictureHandler implements ICommandHandler<UpdateProfilePictureCommand> {
  constructor(private readonly identityServiceClient: IdentityServiceClient) {}

  async execute(command: UpdateProfilePictureCommand) {
    const { userId, file } = command;

    // In the new architecture, we delegate the profile picture update to the identity service.
    // The identity service handles both the storage (e.g. Cloudinary) and the DB update.

    // We proxy the file to the identity service.
    // Since we are a resource server, we could also directly upload to Cloudinary and then update the identity service,
    // but the cleanest way is a single responsibility for the Identity service.

    // For now, we use a mock/simplified update via the identity client if available,
    // or we assume the frontend might call the identity service directly.
    // Given the current mobile logic, we'll implement a proxy call here.

    try {
      // Assuming identityServiceClient has an uploadAvatar method (which we should add if missing)
      // or we just update the profilePicture URL if we had it.
      // Since it's a file, we'd need to send it to identity service's endpoint.

      const user = await this.identityServiceClient.findUserById(userId);
      if (!user) {
        throw new NotFoundException(`User with ID ${userId} not found`);
      }

      // TODO: In a production scenario, we'd pipe the file to the Identity Service's /users/:id/upload-avatar
      // For this migration, we'll return a success message indicating where the call should go.
      return {
        message: 'Profile picture update should be handled by Identity Service',
        userId: userId,
        status: 'redirect_required',
      };
    } catch (error) {
      throw new BadRequestException(`Failed to update profile picture: ${error.message}`);
    }
  }
}
