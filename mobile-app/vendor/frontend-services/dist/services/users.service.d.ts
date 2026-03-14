import { User, CreateUserDto, UpdateUserDto } from '../types';
export declare class UsersService {
    /**
     * Register a new user
     */
    create(data: CreateUserDto): Promise<User>;
    /**
     * Get current authenticated user
     */
    getCurrent(): Promise<User>;
    /**
     * Get user by ID
     */
    getById(id: string): Promise<User>;
    /**
     * Update user profile
     */
    update(id: string, data: UpdateUserDto): Promise<User>;
    /**
     * Soft delete user account
     */
    delete(id: string): Promise<User>;
    /**
     * Upload profile picture
     */
    uploadAvatar(id: string, file: File): Promise<User>;
}
export declare const usersService: UsersService;
