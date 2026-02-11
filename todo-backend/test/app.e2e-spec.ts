import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { EmailService } from '../src/email/email.service';
import { MailerService } from '@nestjs-modules/mailer';

describe('AppController (e2e)', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(EmailService)
      .useValue({
        sendVerificationEmail: jest.fn().mockResolvedValue(undefined),
      })
      .overrideProvider(MailerService)
      .useValue({ sendMail: jest.fn().mockResolvedValue(true) })
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    // No user cleanup needed for basic app health check
  });

  afterAll(async () => {
    await app.close();
  });

  it('/ (GET)', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect((res) => {
<<<<<<< HEAD
        expect(res.text).toContain('Horizon Tasks API');
=======
        expect(res.text).toContain('Horizon Flux API');
>>>>>>> 4145321f585625a9ce6a1ccd658b6879607bb25b
      });
  });
});
