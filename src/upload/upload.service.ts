import {
  HeadObjectCommand,
  HeadObjectCommandOutput,
  PutObjectCommand,
  S3Client,
  S3ServiceException,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { basename } from 'node:path';
import { v4 as uuidV4 } from 'uuid';

import { S3_CLIENT } from '../aws/aws.module';
import { CreatePresignDto } from './dto/create-presign.dto';
import { RemoteFileMeta } from './type/upload.type';

@Injectable()
export class UploadService {
  private readonly bucketName: string;
  private readonly region: string;
  private readonly rootPrefix: string;

  constructor(
    @Inject(S3_CLIENT) private readonly s3: S3Client,
    private readonly config: ConfigService,
  ) {
    const region = this.config.get<string>('AWS_REGION');
    const bucketName = this.config.get<string>('S3_BUCKET_NAME');
    const rootPrefix = this.config.get<string>('UPLOAD_ROOT_PREFIX') || 'uploads';

    if (!region || !bucketName) {
      throw new Error('AWS bucket settings are missing');
    }

    this.bucketName = bucketName;
    this.region = region;
    this.rootPrefix = rootPrefix;
  }

  /** 仅做 key 片段级别的安全清洗：允许 Unicode，去掉前导点、替换 / 与 NUL，统一 NFC */
  private sanitizeKeyComponent(name: string): string {
    return name
      .normalize('NFC') // 统一 Unicode 规范
      .replace(/^\.+/, '') // 去掉前导的一个或多个点
      .replace(/[/\0]/g, '_') // 替换 `/` 与 NUL 字符
      .slice(0, 100); // 最多 100 字符，避免超长 key
  }

  /** 仅保留文件名 + 扩展名的安全字符 */
  private sanitizeAsciiFileName(name: string): string {
    const base = basename(name).replace(/^\.+/, '');
    return base.replace(/[^a-zA-Z0-9_.-]/g, '_').substring(0, 100);
  }

  /** 根据 fileName / contentType 推断扩展名 */
  private inferExt(fileName?: string, contentType?: string): string {
    if (fileName && fileName.includes('.')) {
      const extFromName = fileName.split('.').pop();
      if (extFromName) return extFromName.toLowerCase();
    }
    if (contentType && contentType.includes('/')) {
      const extFromType = contentType.split('/')[1];
      if (extFromType) return extFromType.toLowerCase();
    }
    return 'bin';
  }

  /** 目前只用root */
  private buildPrefix(): string {
    return `${this.rootPrefix}`;
  }

  private buildOriginalKey(fileName?: string, contentType?: string) {
    // ✅ 允许中文（仅做最小化安全清洗）
    const safeName = fileName ? this.sanitizeKeyComponent(fileName) : uuidV4();
    const ext = this.inferExt(fileName, contentType);
    const baseName = safeName.includes('.') ? safeName.replace(/\.[^.]+$/, '') : safeName;
    const prefix = this.buildPrefix();
    return {
      key: `${prefix}/${baseName}.${ext}`,
      prefix,
      baseName,
      ext,
    };
  }

  private buildSuffixedKey(
    prefix: string,
    baseName: string,
    ext: string,
    sha256Hex?: string,
  ): string {
    const suffix =
      sha256Hex && /^[a-f0-9]{64}$/i.test(sha256Hex)
        ? sha256Hex.slice(0, 8).toLowerCase()
        : uuidV4().slice(0, 8);
    return `${prefix}/${baseName}-${suffix}.${ext}`;
  }

  private isS3NotFound(err: unknown): boolean {
    if (err instanceof S3ServiceException) {
      return err.$metadata?.httpStatusCode === 404;
    }
    if (typeof err === 'object' && err !== null) {
      const meta = (err as { $metadata?: { httpStatusCode?: number } }).$metadata;
      return meta?.httpStatusCode === 404;
    }
    return false;
  }

  // + 新增：构造 Content-Disposition，兼容非 ASCII
  private buildContentDisposition(
    originalFileName: string | undefined,
    opts: { inline?: boolean } = {},
  ): string | undefined {
    if (!originalFileName) return undefined;
    const inline = opts.inline ?? true;
    // ✅ 回退用 ASCII（不影响主显示）
    const asciiFallback = this.sanitizeAsciiFileName(originalFileName);

    // ✅ 主显示用 RFC 5987（UTF-8''）
    const utf8Encoded = encodeURIComponent(originalFileName.normalize('NFC')).replace(/\*/g, '%2A');

    const dispType = inline ? 'inline' : 'attachment';
    // filename（ASCII 回退） + filename*（UTF-8 真正生效）
    return `${dispType}; filename="${asciiFallback}"; filename*=UTF-8''${utf8Encoded}`;
  }

  /** 前端用户：获取预签名 URL（原名优先、同名同内容复用、同名不同内容改后缀） */
  async generatePublicPresign(dto: CreatePresignDto): Promise<{
    uploadUrl: string | null;
    key: string;
    publicUrl: string;
    exists: boolean;
    reused: boolean;
    requiredHeaders?: Record<string, string>;
  }> {
    const { contentType, fileName, sha256Hex } = dto;

    if (!fileName && !contentType) {
      throw new Error('Either fileName or contentType is required');
    }

    // 1) 原名 key
    const {
      key: originalKey,
      prefix,
      baseName,
      ext,
    } = this.buildOriginalKey(fileName, contentType);
    let finalKey = originalKey;

    // 2) 查原名是否已存在
    let headExisting: HeadObjectCommandOutput | null = null;
    try {
      headExisting = await this.s3.send(
        new HeadObjectCommand({ Bucket: this.bucketName, Key: originalKey }),
      );

      // 已存在
      if (sha256Hex) {
        const existingSha256 = headExisting.Metadata?.['sha256'];
        if (existingSha256 && existingSha256.toLowerCase() === sha256Hex.toLowerCase()) {
          // 同名同内容：复用（不需要上传）
          return {
            uploadUrl: null,
            key: originalKey,
            publicUrl: this.publicUrlOf(originalKey),
            exists: true,
            reused: true,
          };
        }
      }

      // 同名不同内容 → 带后缀
      finalKey = this.buildSuffixedKey(prefix, baseName, ext, sha256Hex);

      // 3) 保底防撞：后缀版也存在则再追加 4 位随机
      try {
        await this.s3.send(new HeadObjectCommand({ Bucket: this.bucketName, Key: finalKey }));
        const dot = finalKey.lastIndexOf('.');
        finalKey = `${finalKey.slice(0, dot)}-${uuidV4().slice(0, 4)}${finalKey.slice(dot)}`;
      } catch (e) {
        if (!this.isS3NotFound(e)) throw e;
      }
    } catch (e) {
      if (!this.isS3NotFound(e)) {
        throw e; // 非 404 直接抛错
      }
      // 原名不存在 → 用原名（finalKey 已是 originalKey）
    }

    // 计算 Content-Disposition
    const contentDisposition = this.buildContentDisposition(fileName, { inline: true });

    // 4) 生成预签名 PUT（写入 metadata.sha256，便于以后复用判断）
    const cmd = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: finalKey,
      ContentType: contentType || undefined,
      ContentDisposition: contentDisposition,
      Metadata: sha256Hex ? { sha256: sha256Hex.toLowerCase() } : undefined,
      // 若未来启用强校验：
      // ChecksumSHA256: sha256Hex ? hexToBase64(sha256Hex) : undefined,
      // ContentDisposition: fileName ? `inline; filename="${this.sanitizeFileName(fileName)}"` : undefined,
      // ServerSideEncryption: 'AES256',
    });

    const uploadUrl = await getSignedUrl(this.s3, cmd, { expiresIn: 600 });

    // 建议把需要的请求头也返回（前端原样透传即可）
    const requiredHeaders: Record<string, string> = {};
    if (contentDisposition) requiredHeaders['Content-Disposition'] = contentDisposition;
    // 若启用 ChecksumSHA256：requiredHeaders['x-amz-checksum-sha256'] = hexToBase64(sha256Hex)

    return {
      uploadUrl,
      key: finalKey,
      publicUrl: this.publicUrlOf(finalKey),
      exists: false,
      reused: false,
      requiredHeaders,
    };
  }

  private publicUrlOf(key: string): string {
    // 对每个 path 段做 encodeURIComponent，保留斜杠
    const encodedPath = key.split('/').map(encodeURIComponent).join('/');
    return `https://${this.bucketName}.s3.${this.region}.amazonaws.com/${encodedPath}`;
  }

  private extractKeyFromUrl(url: string): string {
    // https://shaking-tools.s3.us-east-1.amazonaws.com/uploads/xxx.webp
    const u = new URL(url);
    const path = u.pathname.replace(/^\/+/, ''); // 去掉前导 /
    return decodeURIComponent(path);
  }

  async getMetaByUrl(url?: string, key?: string): Promise<RemoteFileMeta> {
    if (!url && !key) {
      throw new BadRequestException({
        message: 'Either url or key must be provided',
        errorCode: 'MISSING_PARAMETERS',
      });
    }

    if (key) {
      return this.getObjectMetaByKey(key);
    }

    return this.getObjectMetaByUrl(url!);
  }

  async getObjectMetaByUrl(url: string): Promise<RemoteFileMeta> {
    const key = this.extractKeyFromUrl(url);
    return this.getObjectMetaByKey(key);
  }

  async getObjectMetaByKey(key: string): Promise<RemoteFileMeta> {
    const res = await this.s3.send(
      new HeadObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      }),
    );

    const disposition = res.ContentDisposition;
    let filename: string | undefined;

    if (disposition) {
      const match = disposition.match(/filename="(.+?)"/);
      if (match?.[1]) {
        filename = match[1];
      }
    }

    if (!filename) {
      filename = basename(key);
    }

    return {
      filename,
      size: res.ContentLength ?? undefined,
      contentType: res.ContentType ?? undefined,
    };
  }
}
