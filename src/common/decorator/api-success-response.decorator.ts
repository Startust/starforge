import { applyDecorators, Type } from '@nestjs/common';
import { ApiExtraModels, ApiOkResponse, getSchemaPath } from '@nestjs/swagger';
import { SchemaObject } from '@nestjs/swagger/dist/interfaces/open-api-spec.interface';

interface SwaggerResponseOptions {
  description?: string;
  model?: Type<unknown>; // 用 DTO class
  isArray?: boolean;
  schema?: SchemaObject; // 手写 schema
}

export function ApiSuccessResponse(options: SwaggerResponseOptions) {
  const { description = '统一响应结构', model, schema, isArray = false } = options;

  const dataSchema = model
    ? isArray
      ? { type: 'array', items: { $ref: getSchemaPath(model) } }
      : { $ref: getSchemaPath(model) }
    : schema;

  if (!dataSchema) {
    throw new Error('Must provide `model` or `schema`.');
  }

  const decorators: (MethodDecorator & ClassDecorator)[] = [];

  if (model) {
    decorators.push(ApiExtraModels(model));
  }

  decorators.push(
    ApiOkResponse({
      description,
      schema: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          message: { type: 'string', example: 'OK' },
          errorCode: { type: 'string', nullable: true, example: null },
          data: dataSchema,
        },
      },
    }),
  );

  return applyDecorators(...decorators);
}
