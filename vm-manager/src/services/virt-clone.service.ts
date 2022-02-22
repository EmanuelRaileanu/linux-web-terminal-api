import { Injectable } from "@nestjs/common";
import { CloneVirtualMachineOptions, ResponseFromStdout } from "../entities/vm-manager.entities";
import { VirtCloneError, VmInstanceNotFoundError } from "../errors";
import { ExecService } from "./exec.service";
import { IVirtCloneService } from "../entities/IVirtCloneService";
import { VmInstanceService } from "./vm-instance.service";
import { SessionUserEntity } from "@shared/entities";
import { VmInstance } from "@shared/db-entities/vm-instance.entity";

@Injectable()
export class VirtCloneService implements IVirtCloneService {
    constructor(
        private readonly execService: ExecService,
        private readonly vmInstanceService: VmInstanceService
    ) {}

    public async cloneVirtualMachine(user: SessionUserEntity, options: CloneVirtualMachineOptions): Promise<ResponseFromStdout> {
        const virtCloneCommand = `virt-clone \
            --original=${options.originalVMName} \
            --name=${options.name} \
            --auto-clone
        `;
        const { stdout, stderr } = await this.execService.run(virtCloneCommand);
        if (stderr) {
            throw new VirtCloneError(stderr);
        }
        const originalVmInstanceEntity = await this.findOriginalVirtualMachine(options.originalVMName) as any;
        delete originalVmInstanceEntity.id;
        delete originalVmInstanceEntity.createdAt;
        delete originalVmInstanceEntity.updatedAt;
        return {
            message: "VM cloned successfully",
            consoleOutput: stdout,
            entity: await this.vmInstanceService.create(user, originalVmInstanceEntity)
        };
    }

    private async findOriginalVirtualMachine(originalVmName: string): Promise<VmInstance> {
        const vmInstanceEntity = await this.vmInstanceService.findByName(originalVmName);
        if (!vmInstanceEntity) {
            throw new VmInstanceNotFoundError();
        }
        return vmInstanceEntity;
    }
}
