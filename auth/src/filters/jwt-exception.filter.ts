import { ArgumentsHost, Catch, ExceptionFilter, HttpStatus } from "@nestjs/common";
import { Response } from "express";
import { JsonWebTokenError } from "jsonwebtoken";

@Catch(JsonWebTokenError)
export class JwtExceptionFilter implements ExceptionFilter {
    catch(exception: JsonWebTokenError, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();

        return response
            .status(HttpStatus.UNAUTHORIZED)
            .json({
                statusCode: HttpStatus.UNAUTHORIZED,
                message: exception.message
            });
    }
}