import { bootstrapServer } from "@shared/utils";
import { config } from "./config";
import { VmManagerModule } from "./modules/vm-manager.module";
import { readFileSync } from "fs";
import { InternalStaticServerModule } from "./modules/internal-static-server.module";
import { SwaggerConfig } from "@shared/entities";
import * as swaggerDoc from "./swagger.json";
import { OpenAPIObject } from "@nestjs/swagger";

const swaggerConfig: SwaggerConfig = {
    path: "v1/docs",
    title: "VM Manager",
    description: "VM Manager API",
    tag: "VMManager",
    version: "1.0",
    swaggerDoc: swaggerDoc as OpenAPIObject
};

const httpsOptions = config.ssl.enabled ? {
    key: readFileSync(config.ssl.keyPath),
    cert: readFileSync(config.ssl.certPath)
} : undefined;

const startInternalServer = () => {
    bootstrapServer(InternalStaticServerModule, config.internalStaticServerPort)
        .catch(err => console.error("Error occurred when starting the static files internal service:", err));
};

bootstrapServer(VmManagerModule, config.serverPort, httpsOptions, swaggerConfig)
    .then(startInternalServer)
    .catch(err => console.error("Error occurred when starting the vm-manager service:", err));