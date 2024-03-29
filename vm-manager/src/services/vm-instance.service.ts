import { Injectable } from "@nestjs/common";
import { IVmInstanceService } from "../entities/IVmInstanceService";
import { VmInstance } from "@shared/db-entities/vm-instance.entity";
import { CreateVmInstanceRequest } from "../entities/vm-manager.entities";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { SessionUserEntity } from "@shared/entities";
import { User } from "@shared/db-entities/user.entity";
import { UserNotFoundError } from "@shared/errors";
import { VmInstanceNotFoundError } from "../errors";

@Injectable()
export class VmInstanceService implements IVmInstanceService {
    constructor(
        @InjectRepository(VmInstance) private readonly vmInstanceRepository: Repository<VmInstance>,
        @InjectRepository(User) private readonly userRepository: Repository<User>
    ) {}

    public getAllMacAddressesInUse(): Promise<string[]> {
        return this.extractColumn("macAddress");
    }

    public getAllIpsInUse(): Promise<string[]> {
        return this.extractColumn("ip");
    }

    public findAllForUser(user: SessionUserEntity): Promise<VmInstance[]> {
        return this.vmInstanceRepository.find({ where: { user: user }, relations: ["user", "operatingSystem"] });
    }

    public async findById(id: string): Promise<VmInstance> {
        const vmInstance = await this.vmInstanceRepository.findOne(id, { relations: ["user", "operatingSystem"] });
        if (!vmInstance) {
            throw new VmInstanceNotFoundError();
        }
        return vmInstance;
    }

    public async findByName(vmName: string): Promise<VmInstance> {
        const vmInstance = await this.vmInstanceRepository.findOne(
            { name: vmName },
            { relations: ["user", "operatingSystem"] }
        );
        if (!vmInstance) {
            throw new VmInstanceNotFoundError();
        }
        return vmInstance;
    }

    public async create(user: SessionUserEntity, payload: CreateVmInstanceRequest): Promise<VmInstance> {
        const vmInstanceEntity = await this.vmInstanceRepository.create(payload);
        vmInstanceEntity.user = await this.findSessionUser(user);
        return this.vmInstanceRepository.save(vmInstanceEntity);
    }

    public async deleteById(id: string): Promise<void> {
        await this.vmInstanceRepository.delete(id);
    }

    public async deleteByVmName(vmName: string): Promise<void> {
        await this.vmInstanceRepository.delete({ name: vmName });
    }

    private async extractColumn(column: keyof VmInstance): Promise<string[]> {
        const vmInstances = await this.vmInstanceRepository.find({ select: [column] });
        return vmInstances.map(vmi => vmi[column] as string);
    }

    private async findSessionUser(user: SessionUserEntity): Promise<User> {
        const userEntity = await this.userRepository.findOne(user.id);
        if (!userEntity) {
            throw new UserNotFoundError("Session user entity not found");
        }
        return userEntity;
    }
}