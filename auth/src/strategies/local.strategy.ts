import { Strategy } from "passport-local";
import { PassportStrategy } from "@nestjs/passport";
import { Injectable } from "@nestjs/common";
import { AuthService } from "../services/auth.service";
import { ValidateUserResponse } from "@shared/entities";

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
    constructor(private readonly authService: AuthService) {
        super();
    }

    public validate(username: string, password: string): Promise<ValidateUserResponse> {
        return this.authService.validateUser(username, password);
    }
}