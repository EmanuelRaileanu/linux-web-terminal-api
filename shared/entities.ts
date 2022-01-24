import { OpenAPIObject } from "@nestjs/swagger";

export interface SwaggerConfig {
    title: string;
    description: string;
    version: string;
    tag: string;
    path: string;
    swaggerDoc?: OpenAPIObject;
}