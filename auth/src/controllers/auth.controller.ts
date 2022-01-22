import { Controller, Get } from "@nestjs/common";
import { AuthService } from "../services/auth.service";

@Controller("api/v1")
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @Get("login")
    public async login(): Promise<string> {
        return this.authService.getHello();
    }
}
