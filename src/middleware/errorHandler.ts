import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import jwt from 'jsonwebtoken';

// Custom error classes
export class AppError extends Error {
  public statusCode: number;
  public isOperational: boolean;

  constructor(message: string, statusCode: number = 500, isOperational: boolean = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;

    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  public details: any;

  constructor(message: string, details?: any) {
    super(message, 400);
    this.details = details;
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = 'Authentication failed') {
    super(message, 401);
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string = 'Access denied') {
    super(message, 403);
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = 'Resource not found') {
    super(message, 404);
  }
}

export class ConflictError extends AppError {
  constructor(message: string = 'Resource conflict') {
    super(message, 409);
  }
}

export class DatabaseError extends AppError {
  constructor(message: string = 'Database operation failed') {
    super(message, 500);
  }
}

export class ExternalServiceError extends AppError {
  constructor(message: string = 'External service error') {
    super(message, 502);
  }
}

// Error response interface
interface ErrorResponse {
  success: false;
  error: string;
  details?: any;
  stack?: string;
  requestId?: string;
}

// Error handler middleware
export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  let statusCode = 500;
  let message = 'Internal server error';
  let details: any = undefined;
  let shouldLogStack = false;

  // Handle different error types
  if (error instanceof ZodError) {
    statusCode = 400;
    message = 'Validation failed';
    details = error.errors.map(err => ({
      field: err.path.join('.'),
      message: err.message,
      code: err.code
    }));
  } else if (error instanceof jwt.JsonWebTokenError) {
    statusCode = 401;
    message = 'Invalid token';
  } else if (error instanceof jwt.TokenExpiredError) {
    statusCode = 401;
    message = 'Token expired';
  } else if (error instanceof AppError) {
    statusCode = error.statusCode;
    message = error.message;
    details = (error as any).details;
    shouldLogStack = statusCode >= 500;
  } else {
    // Unknown error
    shouldLogStack = true;
  }

  // Create error response
  const errorResponse: ErrorResponse = {
    success: false,
    error: message,
    ...(details && { details }),
    ...(shouldLogStack && process.env.NODE_ENV === 'development' && { stack: error.stack }),
    ...(req.headers['x-request-id'] && { requestId: req.headers['x-request-id'] as string })
  };

  // Log error details
  const logLevel = statusCode >= 500 ? 'error' : statusCode >= 400 ? 'warn' : 'info';
  const logMessage = `${req.method} ${req.path} - ${statusCode} - ${message}`;

  if (shouldLogStack) {
    console.error(`[${logLevel.toUpperCase()}] ${logMessage}`, {
      error: error.message,
      stack: error.stack,
      requestId: req.headers['x-request-id'],
      userId: (req as any).user?.id,
      body: req.body,
      query: req.query,
      params: req.params
    });
  } else {
    console.warn(`[${logLevel.toUpperCase()}] ${logMessage}`, {
      error: error.message,
      requestId: req.headers['x-request-id'],
      userId: (req as any).user?.id
    });
  }

  res.status(statusCode).json(errorResponse);
};

// Async error wrapper
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// Request ID middleware
export const requestIdMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  const requestId = req.headers['x-request-id'] as string || generateRequestId();
  req.headers['x-request-id'] = requestId;
  res.setHeader('x-request-id', requestId);
  next();
};

// Request logger middleware
export const requestLogger = (req: Request, res: Response, next: NextFunction): void => {
  const startTime = Date.now();
  const requestId = req.headers['x-request-id'] as string;

  // Log request
  console.info(`[REQUEST] ${req.method} ${req.path}`, {
    requestId,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    userId: (req as any).user?.id
  });

  // Capture response
  const originalSend = res.send;
  res.send = function(responseBody) {
    const duration = Date.now() - startTime;

    console.info(`[RESPONSE] ${req.method} ${req.path} - ${res.statusCode}`, {
      requestId,
      duration: `${duration}ms`,
      statusCode: res.statusCode,
      responseSize: Buffer.byteLength(responseBody, 'utf8')
    });

    return originalSend.call(this, responseBody);
  };

  next();
};

// Rate limit exceeded handler
export const rateLimitHandler = (req: Request, res: Response): void => {
  const errorResponse: ErrorResponse = {
    success: false,
    error: 'Too many requests, please try again later',
    requestId: req.headers['x-request-id'] as string
  };

  res.status(429).json(errorResponse);
};

// Generate unique request ID
function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export default {
  errorHandler,
  asyncHandler,
  requestIdMiddleware,
  requestLogger,
  rateLimitHandler,
  AppError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  ConflictError,
  DatabaseError,
  ExternalServiceError
};