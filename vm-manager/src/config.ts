import * as dotenv from "dotenv";

dotenv.config();

export const config = {
    serverPort: +(process.env.VM_MANAGER_SERVER_PORT || 8002),
    authService: {
        url: process.env.AUTH_SERVICE_URL || "http://localhost:8001/api/v1",
        validateTokenPath: process.env.AUTH_SERVICE_VALIDATE_TOKEN_PATH || "/validate-token"
    },
    libVirtDefaultUrl: process.env.LIBVIRT_DEFAULT_URL || "qemu:///system",
    isoImageDirectoryPath: process.env.ISO_IMAGE_DIRECTORY_PATH || "/",
    https: {
        keyPath: process.env.PATH_TO_KEY || "/key.pem",
        certPath: process.env.PATH_TO_CERT || "/cert.pem"
    }
};
