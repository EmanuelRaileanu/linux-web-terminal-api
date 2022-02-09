import { bootstrapServer } from "@shared/utils";
import { config } from "./config";
import { AppModule } from "./app.module";
import fs from "fs";

const httpsOptions = config.ssl.enabled ? {
    key: fs.readFileSync(config.ssl.keyPath),
    cert: fs.readFileSync(config.ssl.certPath)
} : undefined;

bootstrapServer(AppModule, config.serverPort, httpsOptions)
    .catch((err) => console.error("Error occurred when starting api service:", err));