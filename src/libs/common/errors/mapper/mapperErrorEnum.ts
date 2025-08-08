import { ErrorCode } from "../enums/basic.error.enum";

export const ERROR_STATUS_MAP: Record<ErrorCode, number> = {
    [ErrorCode.VALIDATION_ERROR]: 400,
    [ErrorCode.MISSING_REQUIRED_FIELD]: 400,
    [ErrorCode.INVALID_FORMAT]: 400,
  
    [ErrorCode.UNAUTHORIZED]: 401,
    [ErrorCode.FORBIDDEN]: 403,
  
    [ErrorCode.RESOURCE_NOT_FOUND]: 404,
    [ErrorCode.POST_NOT_FOUND]: 404,
    [ErrorCode.USER_NOT_FOUND]: 404,
  
    [ErrorCode.DUPLICATE_ENTRY]: 409,
    [ErrorCode.CONFLICT]: 409,
  
    [ErrorCode.PAYLOAD_TOO_LARGE]: 413,
    [ErrorCode.UNSUPPORTED_MEDIA_TYPE]: 415,
    [ErrorCode.RATE_LIMIT_EXCEEDED]: 429,
  
    [ErrorCode.INTERNAL_SERVER_ERROR]: 500,
    [ErrorCode.SERVICE_UNAVAILABLE]: 503,
    [ErrorCode.DATABASE_ERROR]: 500,
    [ErrorCode.TIMEOUT_ERROR]: 504
  };