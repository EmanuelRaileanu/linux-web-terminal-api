import { bootstrapServer } from "@utils";
import { config } from "./config";
import { AuthModule } from "./modules/auth.module";
import { SwaggerConfig } from "../../shared/entities";
import * as swaggerDoc from "./swagger.json";
import { OpenAPIObject } from "@nestjs/swagger";

const swaggerConfig: SwaggerConfig = {
    path: "api/v1/docs",
    title: "Auth",
    description: "Authentication api using JWT",
    tag: "AuthAPI",
    version: "1.0",
    swaggerDoc: swaggerDoc as OpenAPIObject
};

bootstrapServer(AuthModule, config.serverPort, swaggerConfig)
    .catch((err) => console.error("Error occurred when starting api service:", err));