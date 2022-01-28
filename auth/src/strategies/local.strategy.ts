import { Strategy } from "passport-local";
import { PassportStrategy } from "@nestjs/passport";
import { Injectable } from "@nestjs/common";
import { AuthService } from "../services/auth.service";
import { ValidateUserResponse } from "../entities/auth.entities";

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
    constructor(private authService: AuthService) {
        super();
    }

    public validate(username: string, password: string): Promise<ValidateUserResponse> {
        return this.authService.validateUser(username, password);
    }
}