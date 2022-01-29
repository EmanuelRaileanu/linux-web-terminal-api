import { CACHE_MANAGER, ExecutionContext, Inject, Injectable } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { Request } from "express";
import { SessionUserEntity } from "../entities/auth.entities";
import { Cache } from "cache-manager";
import { InvalidBearerTokenError, SessionExpiredError } from "../errors";
import { JwtService } from "@nestjs/jwt";

@Injectable()
export class JwtAuthGuard extends AuthGuard("jwt") {

    constructor(
        @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
        private readonly jwtService: JwtService
    ) {
        super();
    }

    public async canActivate(context: ExecutionContext): Promise<boolean> {
        const request: Request = context.switchToHttp().getRequest();

        const bearerToken = request.headers.authorization;
        if (!bearerToken) {
            throw new InvalidBearerTokenError();
        }
        const splitToken = bearerToken.split(" ");
        if (splitToken.length < 2) {
            throw new InvalidBearerTokenError();
        }
        if (splitToken[0].toLowerCase() !== "bearer") {
            throw new InvalidBearerTokenError();
        }

        const user = this.jwtService.verify<SessionUserEntity>(splitToken[1]);
        const cachedToken = await this.cacheManager.get<string>(user.id);
        if (!cachedToken || cachedToken !== splitToken[1]) {
            throw new SessionExpiredError();
        }

        request.user = user;

        return true;
    }
}
