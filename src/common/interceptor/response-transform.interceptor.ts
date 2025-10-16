import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class ResponseTransformInterceptor implements NestInterceptor {
  intercept(_ctx: ExecutionContext, next: CallHandler<any>): Observable<any> {
    return next.handle().pipe(
      map((data) => ({
        success: true,
        data,
        message: 'OK',
        errorCode: null,
      })),
    );
  }
}
