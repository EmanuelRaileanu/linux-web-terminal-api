import { readFile } from "fs/promises";
import { Connection, createConnection, getRepository } from "typeorm";
import { OperatingSystem } from "@shared/db-entities/operating-system.entity";
import { config } from "../auth/src/config";
import { User } from "@shared/db-entities/user.entity";

interface IsoImageEntry {
    isoFile: string;
    ksFile: string;
}

interface JsonSeedFile {
    isoImages: IsoImageEntry[];
}

const createDBConnection = (): Promise<Connection> => {
    return createConnection({
        type: "mysql",
        ...config.db,
        entities: [User, OperatingSystem],
        synchronize: true
    });
};

const seedDatabase = async (json: JsonSeedFile): Promise<void> => {
    await createDBConnection();
    const osRepository = getRepository(OperatingSystem);

    for (const isoImage of json.isoImages) {
        await osRepository.insert({
            isoFileName: isoImage.isoFile,
            ksFileName: isoImage.ksFile
        });
    }
};

const run = async () => {
    const rawJsonFile = await readFile("seed-iso.json");
    const json: JsonSeedFile = JSON.parse(rawJsonFile.toString());
    if (!json || !json.isoImages || !json.isoImages.length) {
        return;
    }
    return seedDatabase(json);
};

run()
    .then(() => {
        console.log("Seed ran successfully");
        process.exit(0);
    })
    .catch(err => {
        console.log(err);
        process.exit(1);
    });