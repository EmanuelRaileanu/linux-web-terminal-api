import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { HttpService } from "@nestjs/axios";
import { validateBearerToken } from "@shared/utils";
import { Request } from "express";
import { SessionUserEntity } from "@shared/entities";
import { config } from "../config";

@Injectable()
export class JwtAuthGuard implements CanActivate {
    private static readonly AUTH_SERVICE_VALIDATE_TOKEN_URL = config.authService.url + config.authService.validateTokenPath;

    constructor(private readonly httpService: HttpService) {}

    public async canActivate(context: ExecutionContext): Promise<boolean> {
        const request: Request = context.switchToHttp().getRequest();
        const bearerToken = request.headers.authorization;
        const jwt = validateBearerToken(bearerToken);

        request.user = await this.httpService.get<SessionUserEntity>(
            JwtAuthGuard.AUTH_SERVICE_VALIDATE_TOKEN_URL,
            {
                headers: {
                    authorization: "Bearer " + jwt
                }
            }
        );

        return true;
    }
}