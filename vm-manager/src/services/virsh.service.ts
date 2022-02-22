import { Injectable } from "@nestjs/common";
import { ExecService } from "./exec.service";
import {
    VirshForcedShutDownError,
    VirshListAllVirtualMachinesError, VirshNetUpdateError,
    VirshShutDownError,
    VirshStartError,
    VirshUndefineError
} from "../errors";
import { IVirshService } from "../entities/IVirshService";
import { ResponseFromStdout } from "../entities/vm-manager.entities";
import { VmInstanceService } from "./vm-instance.service";
import { config } from "../config";

@Injectable()
export class VirshService implements IVirshService {
    constructor(
        private readonly execService: ExecService,
        private readonly vmInstanceService: VmInstanceService
    ) {}

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
        const destroyVirtualMachineCommand = `virsh undefine ${vmName} --remove-all-storage`;
        const { stdout, stderr } = await this.execService.run(destroyVirtualMachineCommand);
        if (stderr) {
            throw new VirshUndefineError(stderr);
        }
        await this.vmInstanceService.deleteByVmName(vmName);
        return {
            message: "VM destroyed successfully",
            consoleOutput: stdout
        };
    }

    public async assignStaticIpAndHostName(mac: string, ip: string, hostName: string): Promise<ResponseFromStdout> {
        const xml = `<host mac='${mac}' name="${hostName}" ip='${ip}'/>`;
        const netUpdateCommand = `virsh net-update \
            --network ${config.kvmNetworkName} \
            --command add-last \
            --section ip-dhcp-host
            --xml "${xml}" \
            --live \
            --config\
        `;
        const { stdout, stderr } = await this.execService.run(netUpdateCommand);
        if (stderr) {
            throw new VirshNetUpdateError(stderr);
        }
        return {
            message: "Static ip assigned successfully",
            consoleOutput: stdout
        };
    }
}