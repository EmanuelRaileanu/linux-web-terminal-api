import { Injectable } from "@nestjs/common";
import { UserService } from "./user.service";
import { RegisterRequest, UserConflictReasons, ValidateUserResponse } from "../entities/auth.entities";
import { JwtService } from "@nestjs/jwt";
import { JwtResponse } from "../entities/jwt.entities";
import { PasswordsDoNotMatchError, UserAlreadyExistsError, UserNotFoundError, WrongPasswordError } from "../errors";
import * as bcrypt from "bcryptjs";

@Injectable()
export class AuthService {
    constructor(
        private readonly userService: UserService,
        private readonly jwtService: JwtService
    ) {}

    public async validateUser(userName: string, pass: string): Promise<ValidateUserResponse> {
        const user = await this.userService.findByUsername(userName);
        if (!user) {
            throw new UserNotFoundError();
        }
        if (!await bcrypt.compare(pass, user.password)) {
            throw new WrongPasswordError();
        }
        const { id, username, email } = user;
        return { id, username, email };
    }

    public async register(payload: RegisterRequest): Promise<void> {
        const { password, confirmedPassword, username, email } = payload;
        if (await this.userService.findByUsername(username)) {
            throw new UserAlreadyExistsError(UserConflictReasons.username);
        }
        if (await this.userService.findByEmail(email)) {
            throw new UserAlreadyExistsError(UserConflictReasons.email);
        }
        if (password !== confirmedPassword) {
            throw new PasswordsDoNotMatchError();
        }
        await this.userService.create({
            username,
            email,
            password: await bcrypt.hash(password, await bcrypt.genSalt())
        });
    }

    public async login(user: ValidateUserResponse): Promise<JwtResponse> {
        return {
            token: this.jwtService.sign(user)
        };
    }
}
