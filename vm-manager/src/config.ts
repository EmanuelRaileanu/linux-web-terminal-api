import * as dotenv from "dotenv";

dotenv.config();

export const config = {
    serverPort: +(process.env.VM_MANAGER_SERVER_PORT || 8002),
    internalStaticServerPort: +(process.env.INTERNAL_STATIC_SERVER_PORT || 8999),
    authService: {
        url: process.env.AUTH_SERVICE_URL || "http://localhost:8001/api/v1",
        validateTokenPath: process.env.AUTH_SERVICE_VALIDATE_TOKEN_PATH || "/validate-token"
    },
    ssl: {
        enabled: process.env.SSL_ENABLED === "true" || false,
        keyPath: process.env.PATH_TO_KEY || "/key.pem",
        certPath: process.env.PATH_TO_CERT || "/cert.pem"
    },
    db: {
        host: process.env.DB_HOST || "localhost",
        port: +(process.env.DB_PORT || 3306),
        username: process.env.DB_USERNAME || "dev",
        password: process.env.DB_PASSWORD || "emanuel",
        database: process.env.DB_NAME || "linux_web_terminal",
        synchronize: JSON.parse(process.env.SYNC_ON_START || "true")
    },
    testDb: process.env.TEST_DB_NAME || "test",
    isoImagesDirectoryPath: process.env.ISO_IMAGES_DIRECTORY_PATH || "/",
    ksFilesDirectoryPath: process.env.KS_FILES_DIRECTORY_PATH || ".",
    defaultNetworkInterface: process.env.DEFAULT_NETWORK_INTERFACE || "virbr0",
    libVirtUrl: process.env.LIBVIRT_URL || "qemu:///system",
    kvmGateway: process.env.KVM_GATEWAY || "192.168.122.1",
    kvmNetworkName: process.env.KVM_NETWORK_NAME || "default"
};
