import { Injectable } from "@nestjs/common";
import { IsoImageNotFoundError } from "../errors";
import { IIsoImageService } from "../entities/IIsoImageService";
import { InjectRepository } from "@nestjs/typeorm";
import { OperatingSystem } from "@shared/db-entities/operating-system.entity";
import { Repository } from "typeorm";

@Injectable()
export class IsoImageService implements IIsoImageService {
    constructor(@InjectRepository(
        OperatingSystem) private readonly osRepository: Repository<OperatingSystem>
    ) {}

    public async getAvailableIsoImages(): Promise<string[]> {
        const operatingSystems = await this.osRepository.find({ select: ["isoFileName"] });
        return operatingSystems.map(os => os.isoFileName);
    }

    public async getIsoImageOsEntry(isoImage: string): Promise<OperatingSystem> {
        const os = await this.findByIsoFileName(isoImage);
        if (!os) {
            throw new IsoImageNotFoundError();
        }
        return os;
    }

    private findByIsoFileName(isoFileName: string): Promise<OperatingSystem | undefined> {
        return this.osRepository.findOne({ isoFileName });
    }
}