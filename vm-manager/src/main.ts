import { bootstrapServer } from "@shared/utils";
import { config } from "./config";
import { VmManagerModule } from "./vm-manager.module";
import fs from "fs";

const httpsOptions = {
    key: fs.readFileSync(config.https.keyPath),
    cert: fs.readFileSync(config.https.certPath)
};

bootstrapServer(VmManagerModule, config.serverPort, httpsOptions)
    .catch((err) => console.error("Error occurred when starting api service:", err));