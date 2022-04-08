import { Body, Controller, Delete, Get, Param, Post, Query, Request, UseGuards } from "@nestjs/common";
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
import { TimezoneService } from "../services/timezone.service";
import { UserEntityHolder } from "../../../auth/src/entities/auth.entities";
import { PermissionsGuard } from "../guards/permissions.guard";
import { VmInstance } from "@shared/db-entities/vm-instance.entity";
import { VmInstanceService } from "../services/vm-instance.service";
import { User } from "@shared/db-entities/user.entity";

@UseGuards(JwtAuthGuard)
@Controller("api/v1")
export class VmManagerController {
    constructor(
        private readonly virtInstallService: VirtInstallService,
        private readonly vmInstanceService: VmInstanceService,
        private readonly virtCloneService: VirtCloneService,
        private readonly isoImageService: IsoImageService,
        private readonly timezoneService: TimezoneService,
        private readonly virshService: VirshService,
    ) {}

    @Get("iso-images")
    public getAvailableIsoImages(): Promise<string[]> {
        return this.isoImageService.getAvailableIsoImages();
    }

    @Get("timezones")
    public getAllTimezones(): Promise<string[]> {
        return this.timezoneService.getAllTimezones();
    }

    @Get("virtual-machines")
    public getUserVirtualMachines(@Request() req: UserEntityHolder): Promise<VmInstance[]> {
        return this.vmInstanceService.findAllForUser(req.user as User);
    }

    @Post("virtual-machines")
    public create(@Request() req: UserEntityHolder, @Body() options: CreateVirtualMachineOptions): Promise<ResponseFromStdout> {
        return this.virtInstallService.createVirtualMachine(req.user, options);
    }

    @UseGuards(PermissionsGuard)
    @Post("virtual-machines/clone")
    public clone(@Request() req: UserEntityHolder, @Body() options: CloneVirtualMachineOptions): Promise<ResponseFromStdout> {
        return this.virtCloneService.cloneVirtualMachine(req.user, options);
    }

    @Get("virtual-machines")
    public getAll(): Promise<string[]> {
        return this.virshService.listAllVirtualMachines();
    }

    @UseGuards(PermissionsGuard)
    @Get("virtual-machines/:vmName/start")
    public start(@Param() params: VmToggleParams): Promise<ResponseFromStdout> {
        return this.virshService.startVirtualMachine(params.vmName);
    }

    @UseGuards(PermissionsGuard)
    @Get("virtual-machines/:vmName/shutdown")
    public shutdown(@Param() params: VmToggleParams, @Query() query: VmShutDownQueryParams): Promise<ResponseFromStdout> {
        return query.forced && !!+query.forced
            ? this.virshService.forcefullyShutDownVirtualMachine(params.vmName)
            : this.virshService.shutDownVirtualMachine(params.vmName);
    }

    @UseGuards(PermissionsGuard)
    @Delete("virtual-machines/:vmName")
    public destroy(@Param() params: VmToggleParams): Promise<ResponseFromStdout> {
        return this.virshService.destroyVirtualMachine(params.vmName);
    }
}
