import { ExtractJwt, Strategy } from "passport-jwt";
import { PassportStrategy } from "@nestjs/passport";
import { Injectable } from "@nestjs/common";
import { config } from "../config";
import { ValidateUserResponse } from "../entities/auth.entities";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor() {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: config.jwt.secret
        });
    }

    public validate(payload: ValidateUserResponse): ValidateUserResponse {
        return payload;
    }
}