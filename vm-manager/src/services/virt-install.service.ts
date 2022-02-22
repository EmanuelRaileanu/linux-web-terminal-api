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
import { writeFile } from "fs/promises";
import { v4 as uuid } from "uuid";
import { renderFile } from "template-file";
import { TimezoneService } from "./timezone.service";
import { address as getLocalIp } from "ip";
import { join } from "path";
import * as appRoot from "app-root-path";
import { VmInstanceService } from "./vm-instance.service";
import { createUniqueVmName } from "@shared/utils";
import { SessionUserEntity } from "@shared/entities";
import { NetworkService } from "./network.service";
import { VirshService } from "./virsh.service";

@Injectable()
export class VirtInstallService implements IVirtInstallService {
    private static readonly PUBLIC_DIRECTORY_PATH = appRoot + "/public";

    constructor(
        private readonly isoImageService: IsoImageService,
        private readonly timezoneService: TimezoneService,
        private readonly execService: ExecService,
        private readonly vmInstanceService: VmInstanceService,
        private readonly networkService: NetworkService,
        private readonly virshService: VirshService
    ) {}

    private static async createKickStarterFile(options: KickStartFileTemplateParameters): Promise<string> {
        const ksTemplateFilePath = join(config.ksFilesDirectoryPath, options.ksFileName);
        const fileName = uuid() + ".ks";
        const filePath = VirtInstallService.PUBLIC_DIRECTORY_PATH + "/" + fileName;
        await writeFile(filePath, await renderFile(ksTemplateFilePath, options as any));
        return fileName;
    }

    public async createVirtualMachine(user: SessionUserEntity, options: CreateVirtualMachineOptions): Promise<ResponseFromStdout> {
        const os = await this.isoImageService.getIsoImageOsEntry(options.isoImage);
        const macAddress = await this.networkService.createKvmMacAddress();
        const ip = await this.networkService.createIp();

        const kickStarterFileParameters: KickStartFileTemplateParameters = {
            ksFileName: os.ksFileName,
            timezone: await this.timezoneService.validateTimezone(options.timezone),
            username: options.username,
            password: options.password,
            networkInterface: options.networkInterface || config.defaultNetworkInterface,
            ip
        };
        const kickstartFileName = await VirtInstallService.createKickStarterFile(kickStarterFileParameters);
        const kickstartFileUrl = `http://${getLocalIp()}:${config.internalStaticServerPort}/${kickstartFileName}`;
        const vmName = createUniqueVmName(options.name);

        // Assign the static IP before creating the VM because if this call fails, the VM should not be created
        await this.virshService.assignStaticIpAndHostName(macAddress, ip, vmName);

        const virtInstallCommand = `virt-install \
            --name=${vmName} \
            --vcpus=${options.numberOfVirtualCpus} \
            --memory=${options.memory} \
            --os-type=linux \
            --os-variant=${os.osVariant} \
            --virt-type=kvm \
            --disk size=${options.diskSize} \
            --connect=${config.libVirtUrl} \
            --location=${join(config.isoImagesDirectoryPath, os.isoFileName)} \
            --graphics none \
            --network bridge=${options.networkInterface || config.defaultNetworkInterface},mac=${macAddress} \
            --extra-args="ks=${kickstartFileUrl} console=ttyS0 console=ttyS0,115200" \
            --noautoconsole\
        `;
        const { stdout, stderr } = await this.execService.run(virtInstallCommand);
        if (stderr) {
            throw new VirtInstallError(stderr);
        }

        const vmInstanceEntity = await this.vmInstanceService.create(user, {
            name: vmName,
            username: options.username,
            timezone: options.timezone,
            diskSize: options.diskSize,
            memory: options.memory,
            numberOfVirtualCpus: options.numberOfVirtualCpus,
            macAddress: macAddress,
            ip,
            networkInterface: kickStarterFileParameters.networkInterface,
            user_id: user.id,
            operatingSystem: os
        });

        return {
            message: "VM created successfully",
            consoleOutput: stdout,
            entity: vmInstanceEntity
        };
    }
}
