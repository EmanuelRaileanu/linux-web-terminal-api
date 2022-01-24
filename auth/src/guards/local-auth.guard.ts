import { ExecutionContext, Injectable } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { Observable } from "rxjs";
import { ValidationError } from "../errors";

@Injectable()
export class LocalAuthGuard extends AuthGuard("local") {

    public canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
        const requestBody = context.switchToHttp().getRequest().body;
        if (!requestBody.username) {
            throw new ValidationError("username");
        }
        if (!requestBody.password) {
            throw new ValidationError("password");
        }
        return super.canActivate(context);
    }
}