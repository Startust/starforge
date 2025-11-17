// src/lib/hash.util.ts
import * as crypto from 'crypto';

// PHP: md5(sha1($str).$key)
export function thinkUCenterMd5(str: string, key = 'ThinkUCenter') {
  if (str === '') return '';
  const sha1 = crypto.createHash('sha1').update(str, 'utf8').digest('hex');
  return crypto
    .createHash('md5')
    .update(sha1 + key, 'utf8')
    .digest('hex');
}
