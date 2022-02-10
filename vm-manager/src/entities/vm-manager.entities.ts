import { IsDefined, IsNotEmpty, IsNumber, IsOptional, IsString, Matches } from "class-validator";

export class CreateVirtualMachineOptions {
    @IsNotEmpty()
    @IsString()
    name: string;

    @IsNotEmpty()
    @IsString()
    username: string;

    @IsNotEmpty()
    @IsString()
    password: string;

    @IsNotEmpty()
    @IsString()
    timezone: string;

    @IsDefined()
    @IsNumber()
    numberOfVirtualCpus: number;

    @IsDefined()
    @IsNumber()
    memory: number;

    @IsString()
    @IsNotEmpty()
    osVariant: string;

    @IsDefined()
    @IsNumber()
    diskSize: number;

    @IsNotEmpty()
    @IsString()
    @Matches(/[\w#.\-_@$%]+\.iso$/, { message: "Invalid iso image extension. Expected: .iso" })
    isoImage: string;

    @IsOptional()
    @IsString()
    networkInterface?: string;
}

export class CloneVirtualMachineOptions {
    @IsNotEmpty()
    @IsString()
    originalVMName: string;

    @IsNotEmpty()
    @IsString()
    name: string;

    @IsNotEmpty()
    @IsString()
    pathToOriginalVMVirtualHardDisks: string;
}

export class VmToggleParams {
    @IsNotEmpty()
    @IsString()
    vmName: string;
}

export class VmShutDownQueryParams {
    @IsOptional()
    @IsString()
    forced?: string;
}

export interface ResponseFromStdout {
    message: string;
    consoleOutput: string;
}

export interface ExecResponse {
    stdout: string;
    stderr: string;
}

export interface KickStartFileTemplateParameters {
    networkInterface: string;
    timezone: string;
    username: string;
    password: string;
}

export type PromisifiedExecFunction = (command: string) => Promise<ExecResponse>;
