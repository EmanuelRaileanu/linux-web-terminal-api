import { ExecutionContext, Injectable } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { Observable } from "rxjs";

@Injectable()
export class LocalAuthGuard extends AuthGuard("local") {

    public canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
        const requestBody = context.switchToHttp().getRequest().body;
        if (!requestBody?.username || !requestBody?.password) {
            return false;
        }
        return super.canActivate(context);
    }
}