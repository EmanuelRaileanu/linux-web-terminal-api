import {
    BadRequestException,
    ConflictException,
    ForbiddenException,
    NotFoundException,
    UnauthorizedException
} from "@nestjs/common";
import { UserConflictReasons } from "./entities/auth.entities";

export class UserNotFoundError extends NotFoundException {
    constructor() {
        super("User not found");
    }
}

export class PasswordsDoNotMatchError extends BadRequestException {
    constructor() {
        super("Passwords do not match");
    }
}

export class WrongPasswordError extends ForbiddenException {
    constructor() {
        super("Wrong password");
    }
}

export class UserAlreadyExistsError extends ConflictException {
    constructor(reason: UserConflictReasons = UserConflictReasons.username) {
        super("A user with this " + reason + " already exists");
    }
}

export class InvalidBearerTokenError extends UnauthorizedException {
    constructor() {
        super("The provided bearer token is invalid");
    }
}

export class SessionExpiredError extends UnauthorizedException {
    constructor() {
        super("Session expired");
    }
}
