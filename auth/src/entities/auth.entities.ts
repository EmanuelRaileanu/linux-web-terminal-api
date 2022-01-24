import { IsEmail, IsNotEmpty } from "class-validator";


export class CreateUserRequest {
    @IsNotEmpty()
    username: string;

    @IsEmail()
    email: string;

    @IsNotEmpty()
    password: string;
}

export class RegisterRequest extends CreateUserRequest {
    @IsNotEmpty()
    confirmedPassword: string;
}

export interface ValidateUserResponse {
    id: string;
    username: string;
    email: string;
}

export interface SessionUserEntity extends ValidateUserResponse {
    iat: number;
    exp: number;
}

export type GetProfileResponse = SessionUserEntity;

export interface UserEntityHolder {
    user: SessionUserEntity;
}

export enum UserConflictReasons {
    username = "username",
    email = "email"
}
