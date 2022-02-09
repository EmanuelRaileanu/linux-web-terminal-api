import { bootstrapServer } from "@shared/utils";
import { config } from "./config";
import { VmManagerModule } from "./vm-manager.module";
import { readFileSync } from "fs";

const httpsOptions = config.ssl.enabled ? {
    key: readFileSync(config.ssl.keyPath),
    cert: readFileSync(config.ssl.certPath)
} : undefined;

bootstrapServer(VmManagerModule, config.serverPort, httpsOptions)
    .catch((err) => console.error("Error occurred when starting api service:", err));