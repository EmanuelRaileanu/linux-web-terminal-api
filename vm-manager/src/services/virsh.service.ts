import { Injectable } from "@nestjs/common";
import { ExecService } from "./exec.service";
import {
    VirshForcedShutDownError,
    VirshListAllVirtualMachinesError,
    VirshShutDownError,
    VirshStartError,
    VirshUndefineError
} from "../errors";
import { IVirshService } from "../entities/IVirshService";
import { ResponseFromStdout } from "../entities/vm-manager.entities";
import { formatCommand } from "@shared/utils";

@Injectable()
export class VirshService implements IVirshService {
    constructor(private readonly execService: ExecService) {}

    public async listAllVirtualMachines(): Promise<string[]> {
        const listAllVMsCommand = "virsh list --all --name";
        const { stdout, stderr } = await this.execService.run(listAllVMsCommand);
        if (stderr) {
            throw new VirshListAllVirtualMachinesError(stderr);
        }
        return stdout.split("\n").filter(vm => vm !== "");
    }

    public async startVirtualMachine(vmName: string): Promise<ResponseFromStdout> {
        const startCommand = "virsh start " + vmName;
        const { stdout, stderr } = await this.execService.run(startCommand);
        if (stderr) {
            throw new VirshStartError(stderr);
        }
        return {
            message: "VM started successfully",
            consoleOutput: stdout
        };
    }

    public async shutDownVirtualMachine(vmName: string): Promise<ResponseFromStdout> {
        const shutDownCommand = "virsh shutdown --domain " + vmName;
        const { stdout, stderr } = await this.execService.run(shutDownCommand);
        if (stderr) {
            throw new VirshShutDownError(stderr);
        }
        return {
            message: "VM shut down successfully",
            consoleOutput: stdout
        };
    }

    public async forcefullyShutDownVirtualMachine(vmName: string): Promise<ResponseFromStdout> {
        const forcedShutDownCommand = `virsh destroy --domain ${vmName} --graceful`;
        const { stdout, stderr } = await this.execService.run(forcedShutDownCommand);
        if (stderr) {
            throw new VirshForcedShutDownError(stderr);
        }
        return {
            message: "VM forcefully shut down successfully",
            consoleOutput: stdout
        };
    }

    public async destroyVirtualMachine(vmName: string): Promise<ResponseFromStdout> {
        const destroyVirtualMachineCommand = `virsh undefine \
            --domain ${vmName} \
            --managed-save \
            --remove-all-storage \
            --delete-snapshots \
            --wipe-storage \
            --snapshots-metadata \
            --nvram\
        `;
        const { stdout, stderr } = await this.execService.run(formatCommand(destroyVirtualMachineCommand));
        if (stderr) {
            throw new VirshUndefineError(stderr);
        }
        return {
            message: "VM destroyed successfully",
            consoleOutput: stdout
        };
    }
}