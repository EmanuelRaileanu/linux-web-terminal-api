import { OpenAPIObject } from "@nestjs/swagger";

export interface SwaggerConfig {
    title: string;
    description: string;
    version: string;
    tag: string;
    path: string;
    swaggerDoc?: OpenAPIObject;
}

export interface ValidateUserResponse {
    id: string;
    username: string;
    email: string;
    vmInstances?: string[];
}

export interface SessionUserEntity extends ValidateUserResponse {
    iat?: number;
    exp?: number;
}

export interface UserEntityHolder {
    user: SessionUserEntity;
}
