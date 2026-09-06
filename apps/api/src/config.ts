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
  N8N_WEBHOOK_URL: process.env.N8N_WEBHOOK_URL || "https://n8n.anagataitsolutions.in/webhook/b2b-events"
};
