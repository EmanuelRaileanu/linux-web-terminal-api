import { User } from "./db/user.entity";
import { CreateUserRequest } from "./auth.entities";
import { SessionUserEntity } from "@shared/entities";
import { ChangeEmailRequest, ChangePasswordRequest, ChangeUsernameRequest } from "./user.entities";

export interface IUserService {
    findById(id: string): Promise<User | undefined>;
    findByUsername(username: string): Promise<User | undefined>;
    findByEmail(email: string): Promise<User | undefined>;
    create(payload: CreateUserRequest): Promise<User>;
    deleteById(id: string): Promise<void>;
    changeUsername(user: SessionUserEntity, changeUsernameRequest: ChangeUsernameRequest): Promise<void>;
    changeEmail(user: SessionUserEntity, changeEmailRequest: ChangeEmailRequest): Promise<void>;
    changePassword(user: SessionUserEntity, changePasswordRequest: ChangePasswordRequest): Promise<void>;

}