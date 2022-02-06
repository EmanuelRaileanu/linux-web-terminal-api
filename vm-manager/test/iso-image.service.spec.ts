import { IsoImageService } from "../src/services/iso-image.service";
import { unlink, writeFile } from "fs/promises";
import { config } from "../src/config";
import { IsoImageNotFoundError } from "../src/errors";

describe(IsoImageService, () => {
    let isoImageService: IsoImageService;
    let isoImages: string[];

    beforeAll(async () => {
        process.chdir(__dirname);
        config.isoImageDirectoryPath = __dirname;
        isoImageService = new IsoImageService();
        isoImages = ["image1.iso", "image2.iso"];
        return Promise.all(isoImages.map(image => writeFile(image, "")));
    });

    afterAll(() => {
        return Promise.all(isoImages.map(image => unlink(image)));
    });

    test("Getting available iso images", () => {
        return expect(isoImageService.getAvailableIsoImages()).resolves.toEqual(isoImages);
    });

    test("Getting the absolute path of an iso image", () => {
        const promise = isoImageService.getIsoImageAbsolutePath(isoImages[0]);
        return expect(promise).resolves.toEqual(__dirname + "/" + isoImages[0]);
    });

    test("Getting the absolute path of an iso image fails with IsoImageNotFoundError what the file doesn't exist", () => {
        const promise = isoImageService.getIsoImageAbsolutePath("image3.iso");
        return expect(promise).rejects.toThrowError(IsoImageNotFoundError);
    });
});