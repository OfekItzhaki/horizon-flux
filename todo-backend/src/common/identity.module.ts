import { Module, Global } from '@nestjs/common';
import { IdentityServiceClient } from './identity-service-client';

@Global()
@Module({
    providers: [IdentityServiceClient],
    exports: [IdentityServiceClient],
})
export class IdentityModule { }
