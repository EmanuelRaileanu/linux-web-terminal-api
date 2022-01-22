import { NestFactory } from "@nestjs/core";
import * as morgan from "morgan";

export const bootstrapServer = async (module: any, port: number) => {
    const app = await NestFactory.create(module);
    app.use(morgan("tiny"));
    await app.listen(port);
    console.log("Server listening on port " + port);
};