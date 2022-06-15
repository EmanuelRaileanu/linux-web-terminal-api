import { Body, Controller, HttpCode, HttpStatus, Post, Request, UseFilters, UseGuards } from "@nestjs/common";
import { UserService } from "../services/user.service";
import { ChangeEmailRequest, ChangePasswordRequest, ChangeUsernameRequest } from "../entities/user.entities";
import { JwtAuthGuard } from "../guards/jwt-auth.guard";
import { JwtExceptionFilter } from "../filters/jwt-exception.filter";
import { UserEntityHolder } from "@shared/entities";
import { JwtResponse } from "../entities/jwt.entities";

@UseFilters(JwtExceptionFilter)
@UseGuards(JwtAuthGuard)
@Controller("api/v1/users")
export class UserController {
    constructor(private readonly userService: UserService) {}

    @HttpCode(HttpStatus.OK)
    @Post("change-username")
    public changeUsername(@Request() req: UserEntityHolder, @Body() body: ChangeUsernameRequest): Promise<JwtResponse> {
        return this.userService.changeUsername(req.user, body);
    }

    @HttpCode(HttpStatus.OK)
    @Post("change-email")
    public changeEmail(@Request() req: UserEntityHolder, @Body() body: ChangeEmailRequest): Promise<JwtResponse> {
        return this.userService.changeEmail(req.user, body);
    }

    @HttpCode(HttpStatus.OK)
    @Post("change-password")
    public changePassword(@Request() req: UserEntityHolder, @Body() body: ChangePasswordRequest): Promise<JwtResponse> {
        return this.userService.changePassword(req.user, body);
    }
}