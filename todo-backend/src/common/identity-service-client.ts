import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

export interface RemoteUser {
  id: string;
  email: string;
  name?: string;
  profilePicture?: string;
}

@Injectable()
export class IdentityServiceClient {
  private readonly logger = new Logger(IdentityServiceClient.name);
  private readonly baseUrl: string;

  constructor(private configService: ConfigService) {
    this.baseUrl =
      this.configService.get<string>('IDENTITY_SERVICE_URL') || 'http://localhost:3001';
  }

  async findUserByEmail(email: string): Promise<RemoteUser | null> {
    try {
      const response = await axios.get(`${this.baseUrl}/users/search`, {
        params: { email },
      });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        return null;
      }
      this.logger.error(`Error fetching user by email ${email}: ${error}`);
      throw error;
    }
  }

  async findUserById(id: string): Promise<RemoteUser | null> {
    try {
      const response = await axios.get(`${this.baseUrl}/users/${id}`);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        return null;
      }
      this.logger.error(`Error fetching user by id ${id}: ${error}`);
      throw error;
    }
  }
}
