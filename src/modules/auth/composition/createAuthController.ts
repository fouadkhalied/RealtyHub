import { UserRepositoryImplementation } from "../../user/infrastructure/UserRepositoryImplementation";
import { AuthController } from "../presentation/authController";
import { AuthService } from "../services/AuthService";

export function createAuthController(): AuthController {
  const userRepo = new UserRepositoryImplementation();

  const authDomainService = new AuthService(userRepo);

  return new AuthController(authDomainService);
}