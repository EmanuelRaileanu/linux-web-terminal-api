import { bootstrapServer } from "@shared/utils";
import { config } from "./config";
import { AppModule } from "./app.module";
import fs from "fs";

const httpsOptions = {
    key: fs.readFileSync(config.https.keyPath),
    cert: fs.readFileSync(config.https.certPath)
};

bootstrapServer(AppModule, config.serverPort, httpsOptions)
    .catch((err) => console.error("Error occurred when starting api service:", err));