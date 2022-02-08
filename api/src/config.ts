import * as dotenv from "dotenv";

dotenv.config();

export const config = {
    serverPort: +(process.env.API_SERVER_PORT || 8000),
    https: {
        keyPath: process.env.PATH_TO_KEY || "/key.pem",
        certPath: process.env.PATH_TO_CERT || "/cert.pem"
    }
};
