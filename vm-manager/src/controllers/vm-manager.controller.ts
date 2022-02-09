import { Body, Controller, Delete, Get, Param, Post, Query, UseGuards } from "@nestjs/common";
import { VirtInstallService } from "../services/virt-install.service";
import { JwtAuthGuard } from "../guards/jwt-auth.guard";
import {
    CloneVirtualMachineOptions,
    CreateVirtualMachineOptions,
    ResponseFromStdout,
    VmShutDownQueryParams,
    VmToggleParams
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

    @Post("virtual-machines")
    public create(@Body() options: CreateVirtualMachineOptions): Promise<ResponseFromStdout> {
        return this.virtInstallService.createVirtualMachine(options);
    }

    @Post("virtual-machines/clone")
    public clone(@Body() options: CloneVirtualMachineOptions): Promise<ResponseFromStdout> {
        return this.virtCloneService.cloneVirtualMachine(options);
    }

    @Get("virtual-machines")
    public getAll(): Promise<string[]> {
        return this.virshService.listAllVirtualMachines();
    }

    @Get("virtual-machines/:vmName/start")
    public start(@Param() params: VmToggleParams): Promise<ResponseFromStdout> {
        return this.virshService.startVirtualMachine(params.vmName);
    }

    @Get("virtual-machines/:vmName/shutdown")
    public shutdown(@Param() params: VmToggleParams, @Query() query: VmShutDownQueryParams): Promise<ResponseFromStdout> {
        return query.forced && !!+query.forced
            ? this.virshService.forcefullyShutDownVirtualMachine(params.vmName)
            : this.virshService.shutDownVirtualMachine(params.vmName);
    }

    @Delete("virtual-machines/:vmName")
    public destroy(@Param() params: VmToggleParams): Promise<ResponseFromStdout> {
        return this.virshService.destroyVirtualMachine(params.vmName);
    }
}
