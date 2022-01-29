import { IsEmail, IsNotEmpty, IsString, MaxLength, MinLength } from "class-validator";
import { Match, NotMatch } from "@utils";

export class ChangeUsernameRequest {
    @IsNotEmpty()
    @IsString()
    @MinLength(6)
    @MaxLength(20)
    newUsername: string;

    @IsNotEmpty()
    @IsString()
    @MinLength(10)
    @MaxLength(50)
    password: string;
}

export class ChangeEmailRequest {
    @IsNotEmpty()
    @IsString()
    @IsEmail()
    newEmail: string;

    @IsNotEmpty()
    @IsString()
    @MinLength(10)
    @MaxLength(50)
    password: string;
}

export class ChangePasswordRequest {
    @IsNotEmpty()
    @IsString()
    @MinLength(10)
    @MaxLength(50)
    currentPassword: string;

    @IsNotEmpty()
    @IsString()
    @MinLength(10)
    @MaxLength(50)
    @NotMatch(
        ChangePasswordRequest,
            o => o.currentPassword,
        { message: "your new password must not be the same as the current one" }
    )
    newPassword: string;

    @IsNotEmpty()
    @IsString()
    @MinLength(10)
    @MaxLength(50)
    @Match(
        ChangePasswordRequest,
        o => o.newPassword,
        { message: "passwords do not match" }
    )
    confirmedNewPassword: string;
}