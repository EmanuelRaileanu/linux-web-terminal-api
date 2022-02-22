import { CreateVirtualMachineOptions, ResponseFromStdout } from "./vm-manager.entities";
import { SessionUserEntity } from "@shared/entities";

export interface IVirtInstallService {
    createVirtualMachine(user: SessionUserEntity, options: CreateVirtualMachineOptions): Promise<ResponseFromStdout>;
}