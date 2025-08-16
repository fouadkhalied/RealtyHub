import { Request, Response } from "express";
import { ErrorCode } from "../../../libs/common/errors/enums/basic.error.enum";
import { ErrorBuilder } from "../../../libs/common/errors/errorBuilder";
import { ERROR_STATUS_MAP } from "../../../libs/common/errors/mapper/mapperErrorEnum";
import { UserApplicationService } from "../application/userApplicationService";
import { ContactMessageDto } from "../domain/entites/UserContactInfo";

export class UserController {
    constructor(
        private readonly userApplicationService: UserApplicationService
    ) {}

    // ============= User CRUD OPERATIONS =============

    async sendPayloadByEmail(req: Request, res: Response): Promise<void> {
        try {
          const payload = req.body as ContactMessageDto;
      
          const serviceResponse = await this.userApplicationService.sendPayloadToEmail(
            payload
          );
      
          if (serviceResponse.success) {
            res.status(201).json(serviceResponse);
        } else {
            const statusCode = serviceResponse.error?.details?.httpStatus || 500;
            res.status(statusCode).json(serviceResponse);
        }
      
        } catch (error) {
          console.error("Error in sendPayloadByEmail:", error);
          const err = ErrorBuilder.build(
            ErrorCode.INTERNAL_SERVER_ERROR,
            "Failed to send contact message"
          );
          res.status(ERROR_STATUS_MAP[ErrorCode.INTERNAL_SERVER_ERROR]).json(err);
        }
      }
}