import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse();
    const req = ctx.getRequest();

    const isHttp = exception instanceof HttpException;
    const status = isHttp ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;

    let message = 'Request failed';
    let errorCode: string | null = 'UNKNOWN_ERROR';

    if (isHttp) {
      const payload = (exception as HttpException).getResponse() as any;
      // 支持两种：字符串或对象
      message = typeof payload === 'string' ? payload : (payload?.message ?? message);
      errorCode = payload?.errorCode ?? errorCode;
    } else {
      // 非 HttpException，避免泄漏实现细节
      message = 'Internal server error';
      errorCode = 'INTERNAL_ERROR';
      // 这里可按需记录 exception 到日志/监控
    }

    // 输出真实的异常信息到控制台，方便调试
    if (!isHttp || status === HttpStatus.INTERNAL_SERVER_ERROR) {
      console.error(exception);
    }

    res.status(status).json({
      success: false,
      data: null,
      message,
      errorCode,
      path: req.url,
      timestamp: new Date().toISOString(),
    });
  }
}
