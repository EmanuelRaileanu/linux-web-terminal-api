import { Controller, Get } from "@nestjs/common";
import { AppService } from "../services/app.service";

@Controller("api/v1")
export class AppController {
    constructor(private readonly authService: AppService) {}

    @Get()
    public async login(): Promise<string> {
        return this.authService.getHello();
    }
}
