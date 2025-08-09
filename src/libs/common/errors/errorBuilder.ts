import { ApiResponseInterface } from "../apiResponse/interfaces/apiResponse.interface";
import { ErrorCode } from "./enums/basic.error.enum";
import { ERROR_STATUS_MAP } from "./mapper/mapperErrorEnum";

export class ErrorBuilder {
  static build<T>(
    code: ErrorCode,
    message: string,
    details?: any
  ): ApiResponseInterface<T> {
    return {
      success: false,
      error: {
        code,
        message,
        details: {
          httpStatus: ERROR_STATUS_MAP[code],
          ...details
        }
      }
    };
  }
}