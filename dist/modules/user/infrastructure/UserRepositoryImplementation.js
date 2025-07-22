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
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserRepositoryImplementation = void 0;
const postgres_1 = require("@vercel/postgres");
class UserRepositoryImplementation {
    findById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield (0, postgres_1.sql) `SELECT * FROM users WHERE id = ${id}`;
            return result.rows[0];
        });
    }
    findByEmail(email) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield (0, postgres_1.sql) `SELECT * FROM users WHERE email = ${email}`;
            return result.rows[0];
        });
    }
    create(user) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield (0, postgres_1.sql) `INSERT INTO users (name, email, password) VALUES (${user.username}, ${user.email}, ${user.password}) RETURNING *`;
            return result.rows[0];
        });
    }
    findAll() {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield (0, postgres_1.sql) `SELECT name, email FROM users`;
            return result.rows;
        });
    }
    update(user) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield (0, postgres_1.sql) `UPDATE users SET name = ${user.username}, email = ${user.email}, password = ${user.password} WHERE id = ${user.id} RETURNING *`;
            return result.rows[0];
        });
    }
    delete(id) {
        return __awaiter(this, void 0, void 0, function* () {
            yield (0, postgres_1.sql) `DELETE FROM users WHERE id = ${id}`;
        });
    }
}
exports.UserRepositoryImplementation = UserRepositoryImplementation;
