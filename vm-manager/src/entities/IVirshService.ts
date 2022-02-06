import { ResponseFromStdout } from "./vm-manager.entities";

export interface IVirshService {
    listAllVirtualMachines(): Promise<string[]>;
    startVirtualMachine(vmName: string): Promise<ResponseFromStdout>;
    shutDownVirtualMachine(vmName: string): Promise<ResponseFromStdout>;
    forcefullyShutDownVirtualMachine(vmName: string): Promise<ResponseFromStdout>;
    destroyVirtualMachine(vmName: string): Promise<ResponseFromStdout>;
}