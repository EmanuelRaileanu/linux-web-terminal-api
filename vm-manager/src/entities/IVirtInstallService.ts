import { CreateVirtualMachineOptions, ResponseFromStdout } from "./vm-manager.entities";

export interface IVirtInstallService {
    createVirtualMachine(options: CreateVirtualMachineOptions): Promise<ResponseFromStdout>;
}