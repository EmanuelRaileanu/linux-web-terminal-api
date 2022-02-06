import { CloneVirtualMachineOptions, ResponseFromStdout } from "./vm-manager.entities";

export interface IVirtCloneService {
    cloneVirtualMachine(options: CloneVirtualMachineOptions): Promise<ResponseFromStdout>;
}