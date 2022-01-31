import { ArgumentsHost, Catch, ExceptionFilter } from "@nestjs/common";
import { Response } from "express";
import { JsonWebTokenError } from "jsonwebtoken";

@Catch(JsonWebTokenError)
export class JwtExceptionFilter implements ExceptionFilter {
    catch(exception: JsonWebTokenError, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();

        return response
            .status(401)
            .json({
                statusCode: 401,
                message: exception.message
            });
    }
}