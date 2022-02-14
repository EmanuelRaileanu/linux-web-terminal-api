import { bootstrapServer } from "@shared/utils";
import { config } from "./config";
import { VmManagerModule } from "./modules/vm-manager.module";
import { readFileSync } from "fs";
import { InternalStaticServerModule } from "./modules/internal-static-server.module";

const httpsOptions = config.ssl.enabled ? {
    key: readFileSync(config.ssl.keyPath),
    cert: readFileSync(config.ssl.certPath)
} : undefined;

const startInternalServer = () => {
    bootstrapServer(InternalStaticServerModule, config.internalStaticServerPort, httpsOptions)
        .catch(err => console.error("Error occurred when starting the static files internal service:", err));
};

bootstrapServer(VmManagerModule, config.serverPort, httpsOptions)
    .then(startInternalServer)
    .catch(err => console.error("Error occurred when starting the vm-manager service:", err));