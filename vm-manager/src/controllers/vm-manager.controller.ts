import { Controller, UseGuards } from "@nestjs/common";
import { VmManagerService } from "../services/vm-manager.service";
import { JwtAuthGuard } from "../guards/jwt-auth.guard";

@UseGuards(JwtAuthGuard)
@Controller("api/v1")
export class VmManagerController {
    constructor(private readonly vmManagerService: VmManagerService) {}
}
