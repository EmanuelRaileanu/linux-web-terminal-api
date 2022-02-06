import { ExecResponse } from "./vm-manager.entities";

export interface IExecService {
    run(command: string): Promise<ExecResponse>;
}