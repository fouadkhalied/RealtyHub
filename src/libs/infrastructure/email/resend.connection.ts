import { Resend } from "resend";
import { ErrorBuilder } from "../../common/errors/errorBuilder";
import { ErrorCode } from "../../common/errors/enums/basic.error.enum";

export class ResendConnection {
  private client: Resend;

  constructor(private readonly apiKey: string) {
    if (!this.apiKey) {
      throw ErrorBuilder.build(
        ErrorCode.SERVICE_UNAVAILABLE,
        "Resend API Key is missing"
      );
    }
    this.client = new Resend(this.apiKey);
  }

  getClient() {
    return this.client;
  }
}
