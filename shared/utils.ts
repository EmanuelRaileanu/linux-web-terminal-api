import { NestFactory } from "@nestjs/core";
import * as morgan from "morgan";
import { INestApplication, ValidationPipe } from "@nestjs/common";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { SwaggerConfig } from "./entities";

const setupSwagger = (app: INestApplication, swaggerConfig: SwaggerConfig) => {
    if (!swaggerConfig.swaggerDoc) {
        const config = new DocumentBuilder()
            .setTitle(swaggerConfig.title)
            .setDescription(swaggerConfig.description)
            .setVersion(swaggerConfig.version)
            .addTag(swaggerConfig.tag)
            .build();
        const document = SwaggerModule.createDocument(app, config);
        SwaggerModule.setup(swaggerConfig.path, app, document);
    } else {
        SwaggerModule.setup(swaggerConfig.path, app, swaggerConfig.swaggerDoc);
    }
    app.use(morgan("tiny"));
};

export const bootstrapServer = async (module: any, port: number, swaggerConfig?: SwaggerConfig) => {
    const app = await NestFactory.create(module);

    if (swaggerConfig) {
        setupSwagger(app, swaggerConfig);
    }

    app.useGlobalPipes(new ValidationPipe());
    await app.listen(port);
    console.log("Server listening on port " + port);
};