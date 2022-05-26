import { IsEmail, IsNotEmpty, IsString, MaxLength, MinLength } from "class-validator";
import { Match } from "@shared/utils";
import { SessionUserEntity } from "@shared/entities";

export class CreateUserRequest {
    @IsNotEmpty()
    @IsString()
    @MinLength(6)
    @MaxLength(20)
    username: string;

    @IsEmail()
    @IsString()
    email: string;

    @IsNotEmpty()
    @IsString()
    @MinLength(10)
    @MaxLength(50)
    password: string;
}

export class RegisterRequest extends CreateUserRequest {
    @IsNotEmpty()
    @IsString()
    @MinLength(10)
    @MaxLength(50)
    @Match(
        RegisterRequest,
        o => o.password,
        { message: "passwords do not match" }
    )
    confirmedPassword: string;
}

export type GetProfileResponse = SessionUserEntity;
