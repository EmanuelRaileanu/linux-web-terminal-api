import { ConflictException, InternalServerErrorException, NotFoundException } from "@nestjs/common";

export class IsoImageNotFoundError extends NotFoundException {
    constructor() {
        super("Iso image not found on disk");
    }
}

export class VirtInstallError extends InternalServerErrorException {
    constructor(errorMessage: string) {
        super("virt-install: " + errorMessage);
    }
}

export class VirtCloneError extends InternalServerErrorException {
    constructor(errorMessage: string) {
        super("virt-clone: " + errorMessage);
    }
}

class VirshError extends InternalServerErrorException {
    constructor(subCommand: string, errorMessage: string) {
        super(`virsh ${subCommand}: ${errorMessage}`);
    }
}

export class VirshListAllVirtualMachinesError extends VirshError {
    constructor(errorMessage: string) {
        super("list", errorMessage);
    }
}

export class VirshStartError extends VirshError {
    constructor(errorMessage: string) {
        super("start", errorMessage);
    }
}

export class VirshShutDownError extends VirshError {
    constructor(errorMessage: string) {
        super("shutdown", errorMessage);
    }
}

export class VirshForcedShutDownError extends VirshError {
    constructor(errorMessage: string) {
        super("destroy", errorMessage);
    }
}

export class VirshUndefineError extends VirshError {
    constructor(errorMessage: string) {
        super("undefine", errorMessage);
    }
}

export class TimezoneServiceError extends InternalServerErrorException {
    constructor(errorMessage: string) {
        super("timedatectl error: " + errorMessage);
    }
}

export class TimezoneNotFoundError extends NotFoundException {
    constructor(timezone: string) {
        super(`Timezone ${timezone} wasn't found on the system`);
    }
}

export class TimezoneMatchesMultipleItems extends ConflictException {
    constructor(timezone: string, foundTimezones: string[]) {
        super(`${timezone} matches multiple items: ${foundTimezones}`);
    }
}
