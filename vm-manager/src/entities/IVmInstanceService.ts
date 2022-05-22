import { VmInstance } from "@shared/db-entities/vm-instance.entity";
import { CreateVmInstanceRequest } from "./vm-manager.entities";
import { SessionUserEntity } from "@shared/entities";

export interface IVmInstanceService {
    getAllIpsInUse(): Promise<string[]>;

    getAllMacAddressesInUse(): Promise<string[]>;

    findById(id: string): Promise<VmInstance>;

    findByName(vmName: string): Promise<VmInstance>;

    create(user: SessionUserEntity, payload: CreateVmInstanceRequest): Promise<VmInstance>;

    deleteById(id: string): Promise<void>;

    deleteByVmName(vmName: string): Promise<void>
}