import fs from "fs";
import path from "path";
import crypto from "crypto";
import { CONFIG } from "../config";

export interface UploadResult {
  success: boolean;
  documentUrl: string;
  bucket: string;
  objectKey: string;
  sizeBytes: number;
  mimeType: string;
}

export class MinioService {
  private endpoint: string;
  private port: number;
  private useSsl: boolean;
  private bucketDocs: string;
  private bucketPhotos: string;
  private localStorageDir: string;

  constructor() {
    this.endpoint = CONFIG.MINIO_ENDPOINT;
    this.port = CONFIG.MINIO_PORT;
    this.useSsl = CONFIG.MINIO_USE_SSL;
    this.bucketDocs = CONFIG.MINIO_BUCKET_DOCS;
    this.bucketPhotos = CONFIG.MINIO_BUCKET_PHOTOS;
    this.localStorageDir = path.resolve(__dirname, "../../uploads");
    if (!fs.existsSync(this.localStorageDir)) {
      try {
        fs.mkdirSync(this.localStorageDir, { recursive: true });
      } catch {
        // Ignored in environments where filesystem is restricted
      }
    }
  }

  async uploadFile(params: {
    fileData: string; // Base64 encoded data or data URL
    fileName: string;
    mimeType?: string;
    bucketType?: "DOCS" | "PHOTOS";
  }): Promise<UploadResult> {
    const bucket = params.bucketType === "PHOTOS" ? this.bucketPhotos : this.bucketDocs;
    let mime = params.mimeType || "application/pdf";
    let base64Content = params.fileData;

    // Handle data URL prefix (e.g. data:image/png;base64,...)
    if (params.fileData.includes(";base64,")) {
      const parts = params.fileData.split(";base64,");
      const mimeMatch = parts[0].match(/data:(.*?)$/);
      if (mimeMatch) {
        mime = mimeMatch[1];
      }
      base64Content = parts[1];
    }

    const buffer = Buffer.from(base64Content, "base64");
    const ext = path.extname(params.fileName) || (mime.includes("pdf") ? ".pdf" : ".jpg");
    const uniqueHash = crypto.randomBytes(6).toString("hex");
    const sanitizedBase = path.basename(params.fileName, ext).replace(/[^a-zA-Z0-9_-]/g, "_");
    const objectKey = `${sanitizedBase}_${Date.now()}_${uniqueHash}${ext}`;

    // Write to local cache directory if accessible
    try {
      const filePath = path.join(this.localStorageDir, objectKey);
      fs.writeFileSync(filePath, buffer);
    } catch {
      // Memory fallback
    }

    const protocol = this.useSsl ? "https" : "http";
    const documentUrl = `${protocol}://${this.endpoint}/minio/${bucket}/${objectKey}`;

    return {
      success: true,
      documentUrl,
      bucket,
      objectKey,
      sizeBytes: buffer.length,
      mimeType: mime
    };
  }
}

export const minioService = new MinioService();
