import * as dotenv from "dotenv";

dotenv.config();

export const config = {
    serverPort: +(process.env.VM_MANAGER_SERVER_PORT || 8002),
    internalStaticServerPort: +(process.env.INTERNAL_STATIC_SERVER_PORT || 8999),
    authService: {
        url: process.env.AUTH_SERVICE_URL || "http://localhost:8001/api/v1",
        validateTokenPath: process.env.AUTH_SERVICE_VALIDATE_TOKEN_PATH || "/validate-token"
    },
    defaultNetworkInterface: process.env.DEFAULT_NETWORK_INTERFACE || "virbr0",
    libVirtUrl: process.env.LIBVIRT_URL || "qemu:///system",
    isoImagesDirectoryPath: process.env.ISO_IMAGES_DIRECTORY_PATH || "/",
    ssl: {
        enabled: process.env.SSL_ENABLED === "true" || false,
        keyPath: process.env.PATH_TO_KEY || "/key.pem",
        certPath: process.env.PATH_TO_CERT || "/cert.pem"
    }
};
