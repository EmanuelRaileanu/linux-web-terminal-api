import { Strategy } from "passport-local";
import { PassportStrategy } from "@nestjs/passport";
import { Injectable } from "@nestjs/common";
import { AuthService } from "../services/auth.service";
import { ValidateUserResponse } from "../entities/auth.entities";
import { UserNotFoundError } from "../errors";

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
    constructor(private authService: AuthService) {
        super();
    }

    public async validate(username: string, password: string): Promise<ValidateUserResponse> {
        const user = await this.authService.validateUser(username, password);
        if (!user) {
            throw new UserNotFoundError();
        }
        return user;
    }
}