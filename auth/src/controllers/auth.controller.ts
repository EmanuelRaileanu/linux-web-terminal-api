import { Body, Controller, Get, HttpCode, HttpStatus, Post, Request, UseGuards } from "@nestjs/common";
import { AuthService } from "../services/auth.service";
import {
    GetProfileResponse,
    RegisterRequest,
    UserEntityHolder
} from "../entities/auth.entities";
import { LocalAuthGuard } from "../guards/local-auth.guard";
import { JwtResponse } from "../entities/jwt.entities";
import { JwtAuthGuard } from "../guards/jwt-auth.guard";

@Controller("api/v1")
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @HttpCode(HttpStatus.CREATED)
    @Post("register")
    public register(@Body() body: RegisterRequest): Promise<void> {
        return this.authService.register(body);
    }

    @UseGuards(LocalAuthGuard)
    @HttpCode(HttpStatus.OK)
    @Post("login")
    public login(@Request() req: UserEntityHolder): Promise<JwtResponse> {
        return this.authService.login(req.user);
    }

    @UseGuards(JwtAuthGuard)
    @HttpCode(HttpStatus.OK)
    @Post("logout")
    public logout(@Request() req: UserEntityHolder): Promise<void> {
        return this.authService.logout(req.user);
    }

    @UseGuards(JwtAuthGuard)
    @Get("validate-token")
    public getProfile(@Request() req: UserEntityHolder): GetProfileResponse {
        return req.user;
    }
}
