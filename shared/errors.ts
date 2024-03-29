import {
    BadRequestException,
    ConflictException,
    ForbiddenException,
    NotFoundException,
    UnauthorizedException
} from "@nestjs/common";

export enum UserConflictReasons {
    username = "username",
    email = "email"
}

export class UserNotFoundError extends NotFoundException {
    constructor(message?: string) {
        super(message || "User not found");
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
