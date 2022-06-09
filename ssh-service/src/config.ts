import * as dotenv from "dotenv";

dotenv.config();

export const config = {
    serverPort: +(process.env.API_SERVER_PORT || 9000),
    hostMachine: {
        host: process.env.HOST_MACHINE_IP || "192.168.1.210",
        username: process.env.HOST_MACHINE_USERNAME || "emanuel",
        password: process.env.HOST_MACHINE_PASSWORD || "password"
    },
    ssl: {
        enabled: process.env.SSL_ENABLED === "true" || false,
        keyPath: process.env.PATH_TO_KEY || "/key.pem",
        certPath: process.env.PATH_TO_CERT || "/cert.pem"
    }
};
