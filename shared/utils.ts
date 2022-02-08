import { NestFactory } from "@nestjs/core";
import * as morgan from "morgan";
import { INestApplication, ValidationPipe } from "@nestjs/common";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { SwaggerConfig } from "./entities";
import {
    registerDecorator,
    ValidationArguments,
    ValidationOptions,
    ValidatorConstraint,
    ValidatorConstraintInterface
} from "class-validator";
import { ClassConstructor } from "class-transformer";
import { InvalidBearerTokenError } from "@shared/errors";
import { HttpsOptions } from "@nestjs/common/interfaces/external/https-options.interface";
import * as dotenv from "dotenv";

export const validateBearerToken = (bearerToken: string | undefined) => {
    if (!bearerToken) {
        throw new InvalidBearerTokenError();
    }
    const splitToken = bearerToken.split(" ");
    if (splitToken.length < 2) {
        throw new InvalidBearerTokenError();
    }
    if (splitToken[0].toLowerCase() !== "bearer") {
        throw new InvalidBearerTokenError();
    }
    return splitToken[1];
};

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

export const bootstrapServer = async (module: any, port: number, httpsOptions?: HttpsOptions, swaggerConfig?: SwaggerConfig) => {
    dotenv.config();
    const app = await NestFactory.create(module, { httpsOptions });

    if (swaggerConfig) {
        setupSwagger(app, swaggerConfig);
    }

    app.useGlobalPipes(new ValidationPipe());
    await app.listen(port);
    console.log("Server listening on port " + port);
};

export const Match = <T>(
    type: ClassConstructor<T>,
    property: (o: T) => any,
    validationOptions?: ValidationOptions
) => {
    return (object: any, propertyName: string) => {
        registerDecorator({
            target: object.constructor,
            propertyName,
            options: validationOptions,
            constraints: [property],
            validator: MatchConstraint
        });
    };
};

@ValidatorConstraint({ name: "Match" })
export class MatchConstraint implements ValidatorConstraintInterface {
    public validate(value: any, args: ValidationArguments) {
        const [fn] = args.constraints;
        return fn(args.object) === value;
    }

    public defaultMessage(args: ValidationArguments) {
        const [constraintProperty]: (() => any)[] = args.constraints;
        return `${constraintProperty} should be equal to ${args.property}`;
    }
}

export const NotMatch = <T>(
    type: ClassConstructor<T>,
    property: (o: T) => any,
    validationOptions?: ValidationOptions
) => {
    return (object: any, propertyName: string) => {
        registerDecorator({
            target: object.constructor,
            propertyName,
            options: validationOptions,
            constraints: [property],
            validator: NotMatchConstraint
        });
    };
};

@ValidatorConstraint({ name: "NotMatch" })
export class NotMatchConstraint implements ValidatorConstraintInterface {
    public validate(value: any, args: ValidationArguments) {
        const [fn] = args.constraints;
        return fn(args.object) !== value;
    }

    public defaultMessage(args: ValidationArguments) {
        const [constraintProperty]: (() => any)[] = args.constraints;
        return `${constraintProperty} should not be equal to ${args.property}`;
    }
}
