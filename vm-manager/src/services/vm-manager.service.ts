import { Injectable } from "@nestjs/common";

@Injectable()
export class VmManagerService {
    public createVirtualMachine() {
        return "127.0.0.1";
    }

    public destroyVirtualMachine() {
        return "destroyed";
    }
}
