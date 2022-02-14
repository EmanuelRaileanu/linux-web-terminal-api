import { Injectable } from "@nestjs/common";
import {
    CreateVirtualMachineOptions,
    KickStartFileTemplateParameters,
    ResponseFromStdout
} from "../entities/vm-manager.entities";
import { config } from "../config";
import { IsoImageService } from "./iso-image.service";
import { VirtInstallError } from "../errors";
import { IVirtInstallService } from "../entities/IVirtInstallService";
import { ExecService } from "./exec.service";
import { formatCommand } from "@shared/utils";
import { writeFile, unlink } from "fs/promises";
import { v4 as uuid } from "uuid";
import { renderFile } from "template-file";
import { TimezoneService } from "./timezone.service";
import * as ip from "ip";

@Injectable()
export class VirtInstallService implements IVirtInstallService {
    private static readonly PUBLIC_DIRECTORY_PATH = __dirname + "/../../../../public";

    constructor(
        private readonly isoImageService: IsoImageService,
        private readonly timezoneService: TimezoneService,
        private readonly execService: ExecService
    ) {}

    private static async createKickstartFile(options: KickStartFileTemplateParameters): Promise<string> {
        const templateFilePath = __dirname + "/../os-install-template.ks";
        const fileName = uuid() + ".ks";
        await writeFile(this.PUBLIC_DIRECTORY_PATH + "/" + fileName, await renderFile(templateFilePath, options as any));
        const schema = config.ssl.enabled ? "http://" : "https://";
        return `${schema}${ip.address()}${config.internalStaticServerPort}/${fileName}`;
    }

    public async createVirtualMachine(options: CreateVirtualMachineOptions): Promise<ResponseFromStdout> {
        const kickStarterFileParameters = {
            networkInterface: options.networkInterface || config.defaultNetworkInterface,
            timezone: await this.timezoneService.validateTimezone(options.timezone),
            username: options.username,
            password: options.password
        };
        const kickstartFileUrl = await VirtInstallService.createKickstartFile(kickStarterFileParameters);
        const virtInstallCommand = `virt-install \
            --name=${options.name} \
            --vcpus=${options.numberOfVirtualCpus} \
            --memory=${options.memory} \
            --os-type=linux \
            --os-variant=${options.osVariant} \
            --virt-type=kvm \
            --disk size=${options.diskSize} \
            --connect=${config.libVirtUrl} \
            --location=${await this.isoImageService.getIsoImageAbsolutePath(options.isoImage)} \
            --graphics none \
            --network bridge=${options.networkInterface || config.defaultNetworkInterface} \
            --extra-args="ks=${kickstartFileUrl} console=ttyS0 console=ttyS0,115200" \
            --noautoconsole\
        `;
        const { stdout, stderr } = await this.execService.run(formatCommand(virtInstallCommand));
        if (stderr) {
            throw new VirtInstallError(stderr);
        }
        unlink(VirtInstallService.PUBLIC_DIRECTORY_PATH).catch(err => console.log("Unlink error:", err));
        // TODO: The local ip of the vm needs to be returned as well
        return {
            message: "VM created successfully",
            consoleOutput: stdout
        };
    }
}
