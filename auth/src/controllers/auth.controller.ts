import { Body, Controller, Get, HttpCode, HttpStatus, Post, Request, UseGuards } from "@nestjs/common";
import { AuthService } from "../services/auth.service";
import {
    GetProfileResponse, RegisterRequest,
    UserEntityHolder,
    ValidateUserRequest
} from "../entities/user.entities";
import { LocalAuthGuard } from "../guards/local-auth.guard";
import { JwtResponse } from "../entities/jwt.entities";
import { JwtAuthGuard } from "../guards/jwt-auth.guard";

@Controller("api/v1")
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @HttpCode(HttpStatus.CREATED)
    @Post("register")
    public async register(@Body() body: RegisterRequest) {
        return this.authService.register(body);
    }

    @UseGuards(LocalAuthGuard)
    @Post("login")
    public async login(@Request() req: ValidateUserRequest & UserEntityHolder): Promise<JwtResponse> {
        return this.authService.login(req.user);
    }

    @UseGuards(JwtAuthGuard)
    @Get("profile")
    public getProfile(@Request() req: UserEntityHolder): GetProfileResponse {
        return req.user;
    }
}
