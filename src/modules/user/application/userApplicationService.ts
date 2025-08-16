import { EmailService } from "../../../libs/application/services/email.service";
import { ResponseBuilder } from "../../../libs/common/apiResponse/apiResponseBuilder";
import { ApiResponseInterface } from "../../../libs/common/apiResponse/interfaces/apiResponse.interface";
import { ErrorCode } from "../../../libs/common/errors/enums/basic.error.enum";
import { ErrorBuilder } from "../../../libs/common/errors/errorBuilder";
import { ContactMessageDto } from "../domain/entites/UserContactInfo";
import { contactMessageSchema } from "./validatoin/contactInfoValidation";

export class UserApplicationService {
  constructor(
    private readonly emailService: EmailService
  ) {}

  async sendPayloadToEmail(
    payload: ContactMessageDto
  ): Promise<ApiResponseInterface<void>> {
    try {
      
      const { error } = contactMessageSchema.validate(payload, { abortEarly: false });
      if (error) {
        return ErrorBuilder.build(
          ErrorCode.VALIDATION_ERROR,
          "Contact form validation failed",
          { details: error.details.map(e => e.message) }
        );
      }

      const emailResult  = await this.emailService.sendPayloadToEmail(payload)

      if (!emailResult .success) {
        return emailResult 
      }

      return ResponseBuilder.success(
        undefined,
        "Contact form sent successfully"
      );
    } catch (err) {
      return ErrorBuilder.build(
        ErrorCode.SERVICE_UNAVAILABLE,
        "Failed to send contact form email",
        { originalError: err }
      );
    }
  }
}
