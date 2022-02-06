import { ValidateUserResponse } from "@shared/entities";
import { RegisterRequest } from "./auth.entities";
import { JwtResponse } from "./jwt.entities";

export interface IAuthService {
    validateUser(userName: string, pass: string): Promise<ValidateUserResponse>;
    register(payload: RegisterRequest): Promise<void>;
    login(user: ValidateUserResponse): Promise<JwtResponse>;
    logout(user: ValidateUserResponse): Promise<void>;
}