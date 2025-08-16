import crypto from "crypto";
import { ResendConnection } from "../../infrastructure/email/resend.connection";
import { ErrorBuilder } from "../../common/errors/errorBuilder";
import { ErrorCode } from "../../common/errors/enums/basic.error.enum";
import { ApiResponseInterface } from "../../common/apiResponse/interfaces/apiResponse.interface";
import { ContactMessageDto } from "../../../modules/user/domain/entites/UserContactInfo";
import { buildContactEmailHtml } from "../../infrastructure/email/formats/contactFormat";
import { ResponseBuilder } from "../../common/apiResponse/apiResponseBuilder";

export class EmailService {
  private readonly resendClient;
  private recipentEmail: string;

  constructor(apiKey: string, recipentEmail: string) {
    this.recipentEmail = recipentEmail;
    if (!recipentEmail) {
      throw ErrorBuilder.build(
        ErrorCode.MISSING_REQUIRED_FIELD,
        "Recipient email is missing"
      );
    }

    const connection = new ResendConnection(apiKey);
    this.resendClient = connection.getClient();
  }

  async sendPayloadToEmail(
    payload: ContactMessageDto
  ): Promise<ApiResponseInterface<void>> {
    try {
      const format = buildContactEmailHtml(payload);

      const { error } = await this.resendClient.emails.send({
        from: "Real Estate <onboarding@resend.dev>", // must be verified domain or default
        to: this.recipentEmail,
        subject: "Contact message",
        html: format,
      });

      if (error) {
        ErrorBuilder.build(
          ErrorCode.FAILED_TO_SEND_EMAIL,
          error.message,
        )
      }

      return ResponseBuilder.success(
        undefined,
        "Contact form sent successfully"
      );
    } catch (err: any) {
      return ErrorBuilder.build(
        ErrorCode.SERVICE_UNAVAILABLE,
        "Failed to send contact email",
        { OriginalError: err.message || err }
      );
    }
  }

  // --- OTP Utils (optional) ---
  generateOTP(): string {
    try {
      const otpBuffer = crypto.randomBytes(6);
      return Array.from(otpBuffer)
        .map((b) => (b % 10).toString())
        .join("")
        .slice(0, 6);
    } catch {
      return String(Date.now() % 1_000_000).padStart(6, "0");
    }
  }

  verifyOTP(
    providedOTP: string,
    cacheOtp: string
  ): ApiResponseInterface<boolean> {
    const providedBuffer = Buffer.from(providedOTP);
    const cacheBuffer = Buffer.from(cacheOtp);

    if (
      providedBuffer.length !== cacheBuffer.length ||
      !crypto.timingSafeEqual(providedBuffer, cacheBuffer)
    ) {
      return ErrorBuilder.build(
        ErrorCode.INVALID_INPUT,
        "Wrong OTP verification"
      );
    }

    return {
      success: true,
      message: "OTP verified successfully",
      data: true,
    };
  }
}
