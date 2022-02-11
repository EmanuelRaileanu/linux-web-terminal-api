import { exec } from "child_process";
import { promisify } from "util";
import { IExecService } from "../entities/IExecService";
import { ExecResponse, PromisifiedExecFunction } from "../entities/vm-manager.entities";
import { Injectable } from "@nestjs/common";

@Injectable()
export class ExecService implements IExecService {
    private readonly promisifiedExec: PromisifiedExecFunction;

    constructor() {
        this.promisifiedExec = promisify<PromisifiedExecFunction>(exec);
    }

    public async run(command: string): Promise<ExecResponse> {
        let result: ExecResponse;
        try {
            result = await this.promisifiedExec(command);
        } catch (err) {
            result = { stderr: err.stderr, stdout: "" };
        }
        return result;
    }
}