// server/middleware.ts
import { Request, Response, NextFunction } from 'express';
import config from './config';

// Request logging
export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    const status = res.statusCode;
    const color = status >= 400 ? '\x1b[31m' : '\x1b[32m';
    const reset = '\x1b[0m';
    
    console.log(
      `${color}[${status}]${reset} ${req.method} ${req.path} - ${duration}ms`
    );
  });
  next();
};

// Error handler
export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const status = err.status || 500;
  const message = err.message || 'Internal server error';

  console.error(`\n❌ Error [${status}]:`, {
    message,
    path: req.path,
    method: req.method,
    timestamp: new Date().toISOString(),
  });

  if (config.nodeEnv === 'development') {
    console.error('Stack:', err.stack);
  }

  res.status(status).json({
    error: message,
    status,
    timestamp: new Date().toISOString(),
    ...(config.nodeEnv === 'development' && { stack: err.stack }),
  });
};

// Request body validation
export const validateRequestBody = (req: Request, res: Response, next: NextFunction) => {
  if (!req.body || Object.keys(req.body).length === 0) {
    // Some endpoints don't require a body
    if (!['GET', 'HEAD', 'DELETE'].includes(req.method)) {
      console.warn(`⚠️  Empty body for ${req.method} ${req.path}`);
    }
  }
  next();
};

// CORS preflight
export const corsPreFlight = (req: Request, res: Response, next: NextFunction) => {
  if (req.method === 'OPTIONS') {
    res.header('Access-Control-Allow-Origin', config.cors.origin);
    res.header('Access-Control-Allow-Methods', config.cors.methods.join(', '));
    res.header('Access-Control-Allow-Headers', config.cors.allowedHeaders.join(', '));
    res.header('Access-Control-Allow-Credentials', 'true');
    return res.sendStatus(200);
  }
  next();
};

// Rate limiting (basic implementation)
const rateLimitStore = new Map<string, Array<number>>();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const MAX_REQUESTS = 100; // per minute

export const rateLimit = (req: Request, res: Response, next: NextFunction) => {
  const ip = req.ip || 'unknown';
  const now = Date.now();

  if (!rateLimitStore.has(ip)) {
    rateLimitStore.set(ip, []);
  }

  const requests = rateLimitStore.get(ip)!;
  const recentRequests = requests.filter(
    (timestamp) => now - timestamp < RATE_LIMIT_WINDOW
  );

  if (recentRequests.length >= MAX_REQUESTS) {
    return res.status(429).json({
      error: 'Too many requests',
      retryAfter: RATE_LIMIT_WINDOW / 1000,
    });
  }

  recentRequests.push(now);
  rateLimitStore.set(ip, recentRequests);

  // Cleanup old entries
  if (requests.length > 1000) {
    rateLimitStore.set(ip, recentRequests);
  }

  next();
};

// Health check endpoint middleware
export const healthCheck = (req: Request, res: Response, next: NextFunction) => {
  if (req.path === '/api/health' || req.path === '/api/health/detailed') {
    // Skip other middlewares for health check
    res.set('X-Response-Time', `${Date.now()}ms`);
  }
  next();
};
