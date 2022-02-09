import { Injectable } from "@nestjs/common";
import { CloneVirtualMachineOptions, ResponseFromStdout } from "../entities/vm-manager.entities";
import { VirtCloneError } from "../errors";
import { ExecService } from "./exec.service";
import { IVirtCloneService } from "../entities/IVirtCloneService";
import { formatCommand } from "@shared/utils";

@Injectable()
export class VirtCloneService implements IVirtCloneService {
    constructor(
        private readonly execService: ExecService
    ) {}

    public async cloneVirtualMachine(options: CloneVirtualMachineOptions): Promise<ResponseFromStdout> {
        const virtCloneCommand = `virt-clone
            --original=${options.originalVMName}
            --name=${options.name}
            --file=${options.pathToOriginalVMVirtualHardDisks}
        `;
        const { stdout, stderr } = await this.execService.run(formatCommand(virtCloneCommand));
        if (stderr) {
            throw new VirtCloneError(stderr);
        }
        return {
            message: "VM cloned successfully",
            consoleOutput: stdout
        };
    }
}
