import { plainToInstance, Transform } from 'class-transformer';

/**
 * 通用 transformer：处理 query 中的对象数组（字符串或结构体）
 */
export function TransformJsonArray<T>(cls?: new () => T) {
  return Transform(({ value }) => {
    let result: any[] = [];

    if (!value) return [];

    if (Array.isArray(value)) {
      result = value
        .map((v) => {
          try {
            return typeof v === 'string' ? (JSON.parse(v) as T) : (v as T);
          } catch {
            return null;
          }
        })
        .filter(Boolean);
    } else if (typeof value === 'string') {
      try {
        const parsed = JSON.parse(value) as T;
        result = Array.isArray(parsed) ? parsed : [parsed];
      } catch {
        return [];
      }
    } else if (typeof value === 'object') {
      result = [value];
    }

    return cls ? plainToInstance(cls, result) : (result as T[]);
  });
}
