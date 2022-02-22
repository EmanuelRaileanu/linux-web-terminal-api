import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from "@nestjs/common";
import { Request } from "express";
import { UserEntityHolder } from "../../../auth/src/entities/auth.entities";


@Injectable()
export class PermissionsGuard implements CanActivate {

    public async canActivate(context: ExecutionContext): Promise<boolean> {
        const request: Request & UserEntityHolder = context.switchToHttp().getRequest();
        const user = request.user;
        const vmName = request.params?.vmName || request.body?.vmName;
        if (!user.vmInstances || !user.vmInstances.includes(vmName)) {
            throw new ForbiddenException();
        }
        return true;
    }
}