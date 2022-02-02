import { Injectable } from "@nestjs/common";
import { ExecutorService } from "./executor.service";

@Injectable()
export class VmManagerService {
    constructor(private readonly executorService: ExecutorService) {}
}
