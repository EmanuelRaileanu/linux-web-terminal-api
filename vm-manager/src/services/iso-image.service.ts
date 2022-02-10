import { Injectable } from "@nestjs/common";
import { access, readdir } from "fs/promises";
import { config } from "../config";
import { IsoImageNotFoundError } from "../errors";
import { IIsoImageService } from "../entities/IIsoImageService";

@Injectable()
export class IsoImageService implements IIsoImageService {
    private static async checkIfImageExistsOnDisk(isoImage: string): Promise<boolean> {
        try {
            await access(`${config.isoImagesDirectoryPath}/${isoImage}`);
            return true;
        } catch (err) {
            return false;
        }
    }

    public async getAvailableIsoImages(): Promise<string[]> {
        const files = await readdir(config.isoImagesDirectoryPath);
        return files.filter(file => file.endsWith(".iso"));
    }

    public async getIsoImageAbsolutePath(isoImage: string): Promise<string> {
        if (!await IsoImageService.checkIfImageExistsOnDisk(isoImage)) {
            throw new IsoImageNotFoundError();
        }
        return `${config.isoImagesUri || config.isoImagesDirectoryPath}/${isoImage}`;
    }
}