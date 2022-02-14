import { bootstrapServer } from "@shared/utils";
import { config } from "./config";
import { AppModule } from "./app.module";
import { readFileSync } from "fs";

const httpsOptions = config.ssl.enabled ? {
    key: readFileSync(config.ssl.keyPath),
    cert: readFileSync(config.ssl.certPath)
} : undefined;

bootstrapServer(AppModule, config.serverPort, httpsOptions)
    .catch(err => console.error("Error occurred when starting the api service:", err));