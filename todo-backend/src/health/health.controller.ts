import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { PrismaService } from '../prisma/prisma.service';

@ApiTags('Health')
@Controller('health')
export class HealthController {
<<<<<<< HEAD
  constructor(private prisma: PrismaService) { }
=======
  constructor(private prisma: PrismaService) {}
>>>>>>> 4145321f585625a9ce6a1ccd658b6879607bb25b

  @Get()
  @ApiOperation({ summary: 'Check API and DB health status' })
  @ApiResponse({ status: 200, description: 'Service is healthy' })
  @ApiResponse({ status: 503, description: 'Service is unhealthy' })
  async check() {
    try {
      // Simple DB ping
      await this.prisma.$queryRaw`SELECT 1`;

      return {
        status: 'ok',
        timestamp: new Date().toISOString(),
        services: {
          database: 'up',
          api: 'up',
        },
      };
<<<<<<< HEAD
    } catch (error) {
=======
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
>>>>>>> 4145321f585625a9ce6a1ccd658b6879607bb25b
      return {
        status: 'error',
        timestamp: new Date().toISOString(),
        services: {
          database: 'down',
          api: 'up',
        },
        error:
<<<<<<< HEAD
          process.env.NODE_ENV === 'development' ? error.message : undefined,
=======
          process.env.NODE_ENV === 'development' ? errorMessage : undefined,
>>>>>>> 4145321f585625a9ce6a1ccd658b6879607bb25b
      };
    }
  }

  @Get('ready')
  @ApiOperation({ summary: 'Readiness probe' })
  readiness() {
    // Just returns ok if the app is bootstrapped
    return { status: 'ready' };
  }
}
