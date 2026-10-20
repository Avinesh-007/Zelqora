import { Router, Request, Response } from 'express';
import { checkDatabaseHealth } from '../db/database.js';
import { GeminiService } from '../services/gemini.service.js';
import { ENV } from '../config/env.js';

const router = Router();

router.get('/health', (req: Request, res: Response) => {
  const dbHealth = checkDatabaseHealth();
  const geminiConfigured = GeminiService.isConfigured();

  const isHealthy = dbHealth.healthy;

  res.status(isHealthy ? 200 : 503).json({
    status: isHealthy ? 'healthy' : 'degraded',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    uptime_seconds: Math.floor(process.uptime()),
    database: {
      connected: dbHealth.healthy,
      migrations_applied: dbHealth.migrationCount ?? 0,
      error: dbHealth.error
    },
    ai_engine: {
      provider: 'Google Gemini',
      sdk: '@google/genai',
      model: ENV.GEMINI_MODEL,
      api_key_configured: geminiConfigured,
      mode: geminiConfigured ? 'gemini_live' : 'local_diagnostic_engine'
    },
    monetization: {
      ads_enabled: ENV.ADS_ENABLED,
      adsense_client_id_configured: Boolean(ENV.ADSENSE_CLIENT_ID)
    }
  });
});

export default router;
