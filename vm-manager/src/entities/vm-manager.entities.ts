import { IsDefined, IsNotEmpty, IsNumber, IsOptional, IsString, Matches } from "class-validator";
import { VmInstance } from "@shared/db-entities/vm-instance.entity";
import { OperatingSystem } from "@shared/db-entities/operating-system.entity";

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

export interface CreateVmInstanceRequest {
    name: string;
    username: string;
    timezone: string;
    diskSize: number;
    memory: number;
    numberOfVirtualCpus: number;
    macAddress: string;
    ip: string;
    networkInterface: string;
    user_id: string;
    operatingSystem: OperatingSystem;
}

export interface ResponseFromStdout {
    message: string;
    consoleOutput: string;
    entity?: VmInstance;
}

export interface ExecResponse {
    stdout: string;
    stderr: string;
}

export interface NetworkingParameters {
    networkInterface: string;
    macAddress: string;
    ip: string;
}

export interface KickStartFileTemplateParameters extends NetworkingParameters {
    ksFileName: string;
    timezone: string;
    username: string;
    password: string;
}

export type PromisifiedExecFunction = (command: string) => Promise<ExecResponse>;
