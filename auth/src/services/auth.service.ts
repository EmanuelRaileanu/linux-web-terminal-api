import { CACHE_MANAGER, Inject, Injectable } from "@nestjs/common";
import { Cache } from "cache-manager";
import { UserService } from "./user.service";
import { RegisterRequest } from "../entities/auth.entities";
import { JwtService } from "@nestjs/jwt";
import { JwtResponse } from "../entities/jwt.entities";
import {
    PasswordsDoNotMatchError,
    UserAlreadyExistsError,
    UserConflictReasons,
    UserNotFoundError,
    WrongPasswordError
} from "@shared/errors";
import * as bcrypt from "bcryptjs";
import { config } from "../config";
import { ValidateUserResponse } from "@shared/entities";
import { IAuthService } from "../entities/IAuthService";

@Injectable()
export class AuthService implements IAuthService {
    constructor(
        @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
        private readonly userService: UserService,
        private readonly jwtService: JwtService
    ) {}

    public async validateUser(userName: string, pass: string): Promise<ValidateUserResponse> {
        const user = await this.userService.findByUsername(userName, ["vmInstances"]);
        if (!user) {
            throw new UserNotFoundError();
        }
        if (!await bcrypt.compare(pass, user.password)) {
            throw new WrongPasswordError();
        }
        const { id, username, email, vmInstances } = user;
        return { id, username, email, vmInstances: vmInstances?.map(vmi => vmi.name) };
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
        const token = this.jwtService.sign(user);
        await this.cacheManager.set<string>(user.id, token, { ttl: config.jwt.lifespan });
        return { token };
    }

    public async logout(user: ValidateUserResponse): Promise<void> {
        await this.cacheManager.del(user.id);
    }
}
