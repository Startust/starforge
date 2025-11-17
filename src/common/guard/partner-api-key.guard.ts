import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Request, Response } from 'express';
import { Observable } from 'rxjs';

function parseKeys(env = process.env.PARTNER_API_KEYS || '') {
  // 形如 "keyA:read,report;keyB:admin"
  return env
    .split(';')
    .filter(Boolean)
    .map((pair) => {
      const [k, scopes] = pair.split(':');
      return { key: k.trim(), scopes: (scopes || '').split(',').filter(Boolean) };
    });
}

@Injectable()
export class PartnerApiKeyGuard implements CanActivate {
  private keys: { key: string; scopes: string[] }[];
  constructor(private readonly config: ConfigService) {
    const apiKeys = this.config.get<string>('PARTNER_API_KEYS');
    if (!apiKeys) {
      throw new Error('PARTNER_API_KEYS must be set in config');
    }
    this.keys = parseKeys(apiKeys);
  }

  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    const req = context.switchToHttp().getRequest<Request>();
    const res = context.switchToHttp().getResponse<Response>();

    const headerKey =
      req.header('x-api-key') || req.header('authorization')?.replace(/^ApiKey\s+/i, '');
    const queryKey = req.query['api_token'] as string | undefined;

    const supplied = headerKey || queryKey;
    if (!supplied) throw new UnauthorizedException('Missing API key');

    const match = this.keys.find((k) => k.key === supplied);
    if (!match) throw new UnauthorizedException('Invalid API key');

    // 兼容期：如果走 query，回一个弃用提示
    if (queryKey)
      res.setHeader('X-Deprecated', 'Please use x-api-key header instead of api_token query');

    (req as any).caller = { apiKey: supplied, scopes: match.scopes };

    return true;
  }
}
