import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { SupabaseAuthService, AuthUser } from './supabase-auth.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(@Inject(SupabaseAuthService) private readonly supabaseAuth: SupabaseAuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const authHeader = request.headers.authorization;
    const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;

    if (!token) {
      throw new UnauthorizedException('Missing or invalid Authorization header');
    }

    const user = await this.supabaseAuth.validateAccessToken(token);
    if (!user) {
      throw new UnauthorizedException('Invalid or expired token');
    }

    (request as Request & { user: AuthUser }).user = user;
    return true;
  }
}
