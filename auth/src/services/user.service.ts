import { CACHE_MANAGER, Inject, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { User } from "@shared/db-entities/user.entity";
import { CreateUserRequest } from "../entities/auth.entities";
import { ChangeEmailRequest, ChangePasswordRequest, ChangeUsernameRequest } from "../entities/user.entities";
import {
    PasswordsDoNotMatchError,
    UserAlreadyExistsError,
    UserConflictReasons,
    UserNotFoundError,
    WrongPasswordError
} from "@shared/errors";
import * as bcrypt from "bcryptjs";
import { Cache } from "cache-manager";
import { SessionUserEntity, ValidateUserResponse } from "@shared/entities";
import { IUserService } from "../entities/IUserService";
import { config } from "../config";
import { JwtService } from "@nestjs/jwt";
import { JwtResponse } from "../entities/jwt.entities";

@Injectable()
export class UserService implements IUserService {
    constructor(
        @InjectRepository(User) private readonly userRepository: Repository<User>,
        @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
        private readonly jwtService: JwtService
    ) {}

    public findById(id: string): Promise<User | undefined> {
        return this.userRepository.findOne(id);
    }

    public findByUsername(username: string, relations?: string[]): Promise<User | undefined> {
        return this.userRepository.findOne({ username }, { relations });
    }

    public findByEmail(email: string, relations?: string[]): Promise<User | undefined> {
        return this.userRepository.findOne({ email }, { relations });
    }

    public async create(payload: CreateUserRequest): Promise<User> {
        return this.userRepository.save(this.userRepository.create(payload));
    }

    public async deleteById(id: string): Promise<void> {
        await this.userRepository.delete(id);
    }

    public async changeUsername(user: SessionUserEntity, changeUsernameRequest: ChangeUsernameRequest): Promise<JwtResponse> {
        const { newUsername, password } = changeUsernameRequest;
        await this.validateUserPassword(user.id, password);
        const existingUser = await this.findByUsername(newUsername);
        if (existingUser) {
            throw new UserAlreadyExistsError(UserConflictReasons.username);
        }
        await this.userRepository.update({ id: user.id }, { username: newUsername });
        await this.cacheManager.del(user.id);
        return this.createJWT({
            id: user.id,
            username: newUsername,
            email: user.email,
            vmInstances: user.vmInstances
        });
    }

    public async changeEmail(user: SessionUserEntity, changeEmailRequest: ChangeEmailRequest): Promise<JwtResponse> {
        const { newEmail, password } = changeEmailRequest;
        await this.validateUserPassword(user.id, password);
        const existingUser = await this.findByEmail(newEmail, ["vmInstances"]);
        if (existingUser) {
            throw new UserAlreadyExistsError(UserConflictReasons.email);
        }
        await this.userRepository.update({ id: user.id }, { email: newEmail });
        await this.cacheManager.del(user.id);
        return this.createJWT({
            id: user.id,
            username: user.username,
            email: newEmail,
            vmInstances: user.vmInstances
        });
    }

    public async changePassword(user: SessionUserEntity, changePasswordRequest: ChangePasswordRequest): Promise<JwtResponse> {
        const { currentPassword, newPassword, confirmedNewPassword } = changePasswordRequest;
        await this.validateUserPassword(user.id, currentPassword);
        if (newPassword !== confirmedNewPassword) {
            throw new PasswordsDoNotMatchError();
        }
        await this.userRepository.update({ id: user.id }, {
            password: await bcrypt.hash(newPassword, await bcrypt.genSalt())
        });
        await this.cacheManager.del(user.id);
        return this.createJWT({
            id: user.id,
            username: user.username,
            email: user.email,
            vmInstances: user.vmInstances
        });
    }

    private async validateUserPassword(userId: string, password: string): Promise<void> {
        const user = await this.findById(userId);
        if (!user) {
            throw new UserNotFoundError();
        }
        if (!await bcrypt.compare(password, user.password)) {
            throw new WrongPasswordError();
        }
    }

    private async createJWT(user: ValidateUserResponse) {
        const token = this.jwtService.sign(user);
        await this.cacheManager.set<string>(user.id, token, { ttl: config.jwt.lifespan });
        return { token };
    }
}