import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { WsException } from '@nestjs/websockets';
<<<<<<< HEAD
import { Socket } from 'socket.io';
=======
>>>>>>> 4145321f585625a9ce6a1ccd658b6879607bb25b

@Injectable()
export class WsJwtGuard implements CanActivate {
  private logger = new Logger('WsJwtGuard');

  constructor(private readonly jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
<<<<<<< HEAD
      const client: Socket = context.switchToWs().getClient<Socket>();
      const token =
        client.handshake.auth.token ||
        client.handshake.headers.authorization?.split(' ')[1];
=======
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const client: any = context.switchToWs().getClient();
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      const handshake = client.handshake as unknown as {
        auth: { token?: string };
        headers: { authorization?: string };
      };

      const token =
        handshake.auth.token ||
        (typeof handshake.headers.authorization === 'string'
          ? handshake.headers.authorization.split(' ')[1]
          : undefined);
>>>>>>> 4145321f585625a9ce6a1ccd658b6879607bb25b

      if (!token) {
        throw new WsException('No token provided');
      }

<<<<<<< HEAD
      const payload = this.jwtService.verify(token);
      client.data.user = payload;

      return true;
    } catch (err) {
      this.logger.error(`WS Authentication failed: ${err.message}`);
=======
      const payload: unknown = await this.jwtService.verifyAsync(token);

      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      const clientData = client.data as unknown as { user?: unknown };
      clientData.user = payload;

      return true;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      this.logger.error(`WS Authentication failed: ${errorMessage}`);
>>>>>>> 4145321f585625a9ce6a1ccd658b6879607bb25b
      throw new WsException('Unauthorized access');
    }
  }
}
