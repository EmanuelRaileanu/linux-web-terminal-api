import * as dotenv from "dotenv";

dotenv.config();

export const config = {
    serverPort: +(process.env.VM_MANAGER_SERVER_PORT || 8002),
    authService: {
        url: process.env.AUTH_SERVICE_URL || "http://localhost:8001/api/v1",
        validateTokenPath: process.env.AUTH_SERVICE_VALIDATE_TOKEN_PATH || "/validate-token"
    },
    defaultNetworkInterface: process.env.DEFAULT_NETWORK_INTERFACE || "eth0",
    libVirtDefaultUrl: process.env.LIBVIRT_DEFAULT_URL || "qemu:///system",
    isoImagesUri: process.env.ISO_IMAGES_HOST || undefined,
    isoImagesDirectoryPath: process.env.ISO_IMAGES_DIRECTORY_PATH || "/",
    ssl: {
        enabled: process.env.SSL_ENABLED === "true" || false,
        keyPath: process.env.PATH_TO_KEY || "/key.pem",
        certPath: process.env.PATH_TO_CERT || "/cert.pem"
    }
};
