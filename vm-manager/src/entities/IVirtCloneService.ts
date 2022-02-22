import { CloneVirtualMachineOptions, ResponseFromStdout } from "./vm-manager.entities";
import { SessionUserEntity } from "@shared/entities";

export interface IVirtCloneService {
    cloneVirtualMachine(user: SessionUserEntity, options: CloneVirtualMachineOptions): Promise<ResponseFromStdout>;
}