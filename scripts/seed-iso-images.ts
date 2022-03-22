import { readFile } from "fs/promises";
import { Connection, createConnection, getRepository } from "typeorm";
import { OperatingSystem } from "@shared/db-entities/operating-system.entity";
import { config } from "../auth/src/config";
import { ENTITIES } from "@shared/db-entities";

interface IsoImageEntry {
    isoFileName: string;
    ksFileName: string;
    osVariant: string;
}

interface JsonSeedFile {
    isoImages: IsoImageEntry[];
}

const createDBConnection = (): Promise<Connection> => {
    return createConnection({
        type: "mysql",
        ...config.db,
        entities: ENTITIES
    });
};

const seedDatabase = async (json: JsonSeedFile): Promise<void> => {
    await createDBConnection();
    const osRepository = getRepository(OperatingSystem);

    for (const isoImage of json.isoImages) {
        await osRepository.insert(isoImage);
    }
};

const run = async () => {
    const rawJsonFile = await readFile("seed-iso.json");
    const json: JsonSeedFile = JSON.parse(rawJsonFile.toString());
    if (!json?.isoImages?.length) {
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