import { EmailService } from "../../../libs/application/services/email.service";
import { UserApplicationService } from "../application/userApplicationService";
import { UserController } from "../contollers/UserController";

const apiKey: string = process.env.EMAIL_API_KEY!;
const sender:string = process.env.SENDER_EMAIL!;


export function createUserController(): UserController {
    const emailService = new EmailService(apiKey,sender)
    const userService = new UserApplicationService(emailService);
    return new UserController(userService);
}