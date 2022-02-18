import { Injectable } from "@nestjs/common";
import { CloneVirtualMachineOptions, ResponseFromStdout } from "../entities/vm-manager.entities";
import { VirtCloneError } from "../errors";
import { ExecService } from "./exec.service";
import { IVirtCloneService } from "../entities/IVirtCloneService";

@Injectable()
export class VirtCloneService implements IVirtCloneService {
    constructor(
        private readonly execService: ExecService
    ) {}

    public async cloneVirtualMachine(options: CloneVirtualMachineOptions): Promise<ResponseFromStdout> {
        const virtCloneCommand = `virt-clone \
            --original=${options.originalVMName} \
            --name=${options.name} \
            --auto-clone
        `;
        const { stdout, stderr } = await this.execService.run(virtCloneCommand);
        if (stderr) {
            throw new VirtCloneError(stderr);
        }
        return {
            message: "VM cloned successfully",
            consoleOutput: stdout
        };
    }
}
