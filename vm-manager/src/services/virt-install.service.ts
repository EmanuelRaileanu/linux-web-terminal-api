import { Injectable } from "@nestjs/common";
import { CreateVirtualMachineOptions, ResponseFromStdout } from "../entities/vm-manager.entities";
import { config } from "../config";
import { IsoImageService } from "./iso-image.service";
import { VirtInstallError } from "../errors";
import { IVirtInstallService } from "../entities/IVirtInstallService";
import { ExecService } from "./exec.service";

@Injectable()
export class VirtInstallService implements IVirtInstallService {
    constructor(
        private readonly isoImageService: IsoImageService,
        private readonly execService: ExecService
    ) {}

    public async createVirtualMachine(options: CreateVirtualMachineOptions): Promise<ResponseFromStdout> {
        const virtInstallCommand = `virt-install
            --name=${options.name}
            --vcpus=${options.numberOfVirtualCpus}
            --memory=${options.memory}
            --os-type=linux
            --os-variant=${options.osVariant}
            --virt-type=kvm
            --disk size=${options.diskSize}
            --connect=${config.libVirtDefaultUrl}
            --cdrom=${await this.isoImageService.getIsoImageAbsolutePath(options.isoImage)},bus=virtio,format=raw,cache=none,io=native
            --graphics none
            --network bridge=${options.networkBridgeInterfaceName || "default"}
        `;
        const { stdout, stderr } = await this.execService.run(virtInstallCommand.trim());
        if (stderr) {
            throw new VirtInstallError(stderr);
        }
        return {
            message: "VM created successfully",
            consoleOutput: stdout
        };
    }
}
