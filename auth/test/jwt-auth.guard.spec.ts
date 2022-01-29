import { JwtAuthGuard } from "../src/guards/jwt-auth.guard";
import { Test, TestingModule } from "@nestjs/testing";
import { CACHE_MANAGER, CacheModule } from "@nestjs/common";
import { Cache } from "cache-manager";
import { ValidateUserResponse } from "../src/entities/auth.entities";
import { JwtModule, JwtService } from "@nestjs/jwt";
import { config } from "../src/config";
import { InvalidBearerTokenError, SessionExpiredError } from "../src/errors";
import { JsonWebTokenError } from "jsonwebtoken";

describe(JwtAuthGuard, () => {
    let user: ValidateUserResponse;
    let moduleRef: TestingModule;
    let jwtService: JwtService;
    let cacheManager: Cache;
    let jwtAuthGuard: JwtAuthGuard;
    let token: string;
    const createMockedExecutionContext = (bearerToken: string): any => {
        return {
            getClass: jest.fn(),
            getHandler: jest.fn(),
            switchToHttp: jest.fn(() => ({
                getRequest: jest.fn().mockReturnValue({
                    headers: {
                        authorization: bearerToken
                    }
                })
            }))
        };
    };

    beforeAll(async () => {
        moduleRef = await Test.createTestingModule({
            imports: [
                JwtModule.register({
                    secret: config.jwt.secret,
                    signOptions: { expiresIn: config.jwt.lifespan }
                }),
                CacheModule.register()
            ],
            providers: [JwtAuthGuard]
        }).compile();

        jwtService = moduleRef.get<JwtService>(JwtService);
        cacheManager = moduleRef.get(CACHE_MANAGER);
        jwtAuthGuard = moduleRef.get<JwtAuthGuard>(JwtAuthGuard);
        user = {
            id: "10198d46-8026-48b1-91db-79bea5b7befd",
            username: "death",
            email: "cracked@death.com"
        };
        token = jwtService.sign(user);
    });

    beforeEach(() => {
        return cacheManager.set<string>(user.id, token);
    });

    afterAll(() => {
        return moduleRef.close();
    });

    test("Returns true", () => {
        const executionContext = createMockedExecutionContext("Bearer " + token);
        return expect(jwtAuthGuard.canActivate(executionContext)).resolves.toEqual(true);
    });

    test("Fails with InvalidBearerToken when token is not provided", () => {
        const executionContext = createMockedExecutionContext("");
        return expect(jwtAuthGuard.canActivate(executionContext)).rejects.toThrowError(InvalidBearerTokenError);
    });

    test("Fails with InvalidBearerToken when the 'Bearer' keyword is missing", () => {
        const executionContext = createMockedExecutionContext(token);
        return expect(jwtAuthGuard.canActivate(executionContext)).rejects.toThrowError(InvalidBearerTokenError);
    });

    test("Fails with InvalidBearerToken when the token is invalid ('Bearer' keyword is missing)", () => {
        const executionContext = createMockedExecutionContext("Basic 12345");
        return expect(jwtAuthGuard.canActivate(executionContext)).rejects.toThrowError(InvalidBearerTokenError);
    });

    test("Fails with JsonWebTokenError when the jwt is invalid", () => {
        const executionContext = createMockedExecutionContext("Bearer 12345");
        return expect(jwtAuthGuard.canActivate(executionContext)).rejects.toThrowError(JsonWebTokenError);
    });

    test("Fails with JsonWebTokenError when the jwt is malformed", async () => {
        const executionContext = createMockedExecutionContext("Bearer " + token + "anything");
        return expect(jwtAuthGuard.canActivate(executionContext)).rejects.toThrowError(JsonWebTokenError);
    });

    test("Fails with SessionExpiredError when the token is not found in the redis cache", async () => {
        await cacheManager.del(user.id);
        const executionContext = createMockedExecutionContext("Bearer " + token);
        return expect(jwtAuthGuard.canActivate(executionContext)).rejects.toThrowError(SessionExpiredError);
    });

    test("Fails with SessionExpiredError when the jwt is not the same as the one cached in redis", async () => {
        await cacheManager.del(user.id);
        const fakeUser = {
            id: "de017d18-cc4e-48d2-b5d7-d177f18859fe",
            username: "moonWalker",
            password: "strider"
        };
        const fakeToken = jwtService.sign(fakeUser);
        const executionContext = createMockedExecutionContext("Bearer " + fakeToken);
        return expect(jwtAuthGuard.canActivate(executionContext)).rejects.toThrowError(SessionExpiredError);
    });
});