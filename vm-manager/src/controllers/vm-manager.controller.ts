import { Body, Controller, Get, Post, UseGuards } from "@nestjs/common";
import { VirtInstallService } from "../services/virt-install.service";
import { JwtAuthGuard } from "../guards/jwt-auth.guard";
import {
    CloneVirtualMachineOptions,
    CreateVirtualMachineOptions,
    ResponseFromStdout
} from "../entities/vm-manager.entities";
import { VirtCloneService } from "../services/virt-clone.service";
import { VirshService } from "../services/virsh.service";
import { IsoImageService } from "../services/iso-image.service";

@UseGuards(JwtAuthGuard)
@Controller("api/v1")
export class VmManagerController {
    constructor(
        private readonly virtInstallService: VirtInstallService,
        private readonly virtCloneService: VirtCloneService,
        private readonly isoImageService: IsoImageService,
        private readonly virshService: VirshService
    ) {}

    @Get("iso-images")
    public getAvailableIsoImages(): Promise<string[]> {
        return this.isoImageService.getAvailableIsoImages();
    }

    @Post("create-vm")
    public createVirtualMachine(@Body() options: CreateVirtualMachineOptions): Promise<ResponseFromStdout> {
        return this.virtInstallService.createVirtualMachine(options);
    }

    @Post("clone-vm")
    public cloneVirtualMachine(@Body() options: CloneVirtualMachineOptions): Promise<ResponseFromStdout> {
        return this.virtCloneService.cloneVirtualMachine(options);
    }

    @Get("vm-list")
    public getAllVirtualMachines(): Promise<string[]> {
        return this.virshService.listAllVirtualMachines();
    }

    // TODO: implement the routes for the rest of the VirshService methods
}
