import { HttpException, HttpStatus } from '@nestjs/common';

export interface StandardResponse<T> {
  success: boolean; // Indicates if the request was successful
  data: T | null; // The data returned from the request, null if not applicable
  message: string; // A message providing additional information about the request
  errorCode: string | null; // An error code, null if no error occurred
}

export function success<T>(data: T, message = 'OK') {
  return {
    success: true,
    data,
    message,
    errorCode: null,
  };
}

export function failure(message: string, errorCode = 'UNKNOWN_ERROR') {
  return {
    success: false,
    data: null,
    message,
    errorCode,
  };
}

export function exception(
  errorCode: string,
  statusCode: HttpStatus = HttpStatus.BAD_REQUEST,
  message = 'Request failed',
): never {
  throw new HttpException(
    {
      success: false,
      data: null,
      message,
      errorCode,
    },
    statusCode,
  );
}
