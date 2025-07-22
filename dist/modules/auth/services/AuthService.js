"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = require("../../user/domain/entites/User");
class AuthService {
    constructor(userRepository) {
        this.userRepository = userRepository;
    }
    signup(name, email, password) {
        return __awaiter(this, void 0, void 0, function* () {
            const userExists = yield this.userRepository.findByEmail(email);
            if (userExists) {
                return { token: null, message: "User already exists" };
            }
            const hashedPassword = yield bcryptjs_1.default.hash(password, 10);
            const user = yield this.userRepository.create(new User_1.User({
                username: name,
                email,
                password: hashedPassword,
            }));
            const { token, message } = yield this.login(user.email, user.password);
            return { token, message };
        });
    }
    login(email, password) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield this.userRepository.findByEmail(email);
            if (!user) {
                return { token: null, message: "User not found" };
            }
            const passwordIsValid = yield bcryptjs_1.default.compare(password, user.password);
            if (!passwordIsValid) {
                return { token: null, message: "Invalid password" };
            }
            if (!process.env.JWT_SECRET) {
                return { token: null, message: "JWT_SECRET is not set in environment variables" };
            }
            const token = jsonwebtoken_1.default.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, {
                expiresIn: '1h',
            });
            return { token, message: "Login successful" };
        });
    }
}
exports.AuthService = AuthService;
