import { OperatingSystem } from "@shared/db-entities/operating-system.entity";

export interface IIsoImageService {
    getAvailableIsoImages(): Promise<string[]>;

    getIsoImageOsEntry(isoImage: string): Promise<OperatingSystem>;
}