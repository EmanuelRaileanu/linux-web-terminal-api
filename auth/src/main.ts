import { bootstrapServer } from "@shared/utils";
import { config } from "./config";
import { AuthModule } from "./modules/auth.module";
import { SwaggerConfig } from "@shared/entities";
import * as swaggerDoc from "./swagger.json";
import { OpenAPIObject } from "@nestjs/swagger";
import { readFileSync } from "fs";

const swaggerConfig: SwaggerConfig = {
    path: "v1/docs",
    title: "Auth",
    description: "Authentication ssh-service using JWT",
    tag: "AuthAPI",
    version: "1.0",
    swaggerDoc: swaggerDoc as OpenAPIObject
};

const httpsOptions = config.ssl.enabled ? {
    key: readFileSync(config.ssl.keyPath),
    cert: readFileSync(config.ssl.certPath)
} : undefined;

bootstrapServer(AuthModule, config.serverPort, httpsOptions, swaggerConfig)
    .catch(err => console.error("Error occurred when starting the auth service:", err));