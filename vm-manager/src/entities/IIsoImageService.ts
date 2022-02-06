export interface IIsoImageService {
    getAvailableIsoImages(): Promise<string[]>;
    getIsoImageAbsolutePath(isoImage: string): Promise<string>
}