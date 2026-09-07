import dotenv from "dotenv";
dotenv.config();

export const CONFIG = {
  PORT: parseInt(process.env.PORT || "4000", 10),
  NODE_ENV: process.env.NODE_ENV || "development",
  JWT_SECRET: process.env.JWT_SECRET || "super_secret_jwt_aggregator_key_2026",
  DATABASE_URL: process.env.DATABASE_URL || "postgresql://postgres:postgres@localhost:5432/b2b_aggregator",
  EVOLUTION_API_URL: process.env.EVOLUTION_API_URL || "https://evo.anagataitsolutions.in",
  EVOLUTION_API_KEY: process.env.EVOLUTION_API_KEY || "IefwSiekrTOn92twVtnlLcl3WEKiC8pz",
  EVOLUTION_INSTANCE_NAME: process.env.EVOLUTION_INSTANCE_NAME || "n8n",
  N8N_WEBHOOK_URL: process.env.N8N_WEBHOOK_URL || "https://n8n.anagataitsolutions.in/webhook/b2b-events",
  BUILD_HASH: process.env.BUILD_HASH || process.env.GIT_COMMIT || "c4d7f8a9e21b",
  BUILD_TIMESTAMP: process.env.BUILD_TIMESTAMP || "2026-09-07T06:44:04Z",
  APP_VERSION: process.env.APP_VERSION || "2.1.0",
  APK_DOWNLOAD_URL: process.env.APK_DOWNLOAD_URL || "https://b2b.anagataitsolutions.in/downloads/b2b-sales-aggregator.apk",
  MINIO_ENDPOINT: process.env.MINIO_ENDPOINT || "server.anagataitsolutions.in",
  MINIO_PORT: parseInt(process.env.MINIO_PORT || "9000", 10),
  MINIO_USE_SSL: process.env.MINIO_USE_SSL === "true" || true,
  MINIO_ACCESS_KEY: process.env.MINIO_ACCESS_KEY || "minio_admin",
  MINIO_SECRET_KEY: process.env.MINIO_SECRET_KEY || "minio_secret_2026",
  MINIO_BUCKET_DOCS: process.env.MINIO_BUCKET_DOCS || "b2b-kyc-documents",
  MINIO_BUCKET_PHOTOS: process.env.MINIO_BUCKET_PHOTOS || "b2b-shop-photos"
};
