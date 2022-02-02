import { CACHE_MANAGER, ExecutionContext, Inject, Injectable } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { Request } from "express";
import { SessionUserEntity } from "@shared/entities";
import { Cache } from "cache-manager";
import { SessionExpiredError } from "@shared/errors";
import { JwtService } from "@nestjs/jwt";
import { validateBearerToken } from "@shared/utils";

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
        const jwt = validateBearerToken(bearerToken);

        const user = this.jwtService.verify<SessionUserEntity>(jwt);
        const cachedToken = await this.cacheManager.get<string>(user.id);
        if (!cachedToken || cachedToken !== jwt) {
            throw new SessionExpiredError();
        }

        request.user = user;

        return true;
    }
}
