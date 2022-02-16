import { LocalAuthGuard } from "../src/guards/local-auth.guard";
import { Test, TestingModule } from "@nestjs/testing";
import { LocalStrategy } from "../src/strategies/local.strategy";
import { AuthService } from "../src/services/auth.service";
import { UserService } from "../src/services/user.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { User } from "@shared/db-entities/user.entity";
import { config } from "../src/config";
import { PassportModule } from "@nestjs/passport";
import { JwtModule } from "@nestjs/jwt";
import { CacheModule } from "@nestjs/common";
import { UserNotFoundError, WrongPasswordError } from "@shared/errors";
import { getRepository, Repository } from "typeorm";
import * as bcrypt from "bcryptjs";
import { OperatingSystem } from "@shared/db-entities/operating-system.entity";

describe(LocalAuthGuard, () => {
    let user: User;
    let moduleRef: TestingModule;
    let localAuthGuard: LocalAuthGuard;
    let userRepository: Repository<User>;

    const createMockedExecutionContext = (body: any): any => {
        return {
            getClass: jest.fn(),
            getHandler: jest.fn(),
            switchToHttp: jest.fn(() => ({
                getRequest: jest.fn().mockReturnValue({
                    body: body
                }),
                getResponse: jest.fn()
            }))
        };
    };

    beforeAll(async () => {
        moduleRef = await Test.createTestingModule({
            imports: [
                TypeOrmModule.forFeature([User, OperatingSystem]),
                TypeOrmModule.forRoot({
                    type: "mysql",
                    ...config.db,
                    database: config.testDb,
                    autoLoadEntities: true,
                    synchronize: true
                }),
                PassportModule,
                JwtModule.register({
                    secret: config.jwt.secret,
                    signOptions: { expiresIn: config.jwt.lifespan }
                }),
                CacheModule.register()
            ],
            providers: [AuthService, UserService, LocalAuthGuard, LocalStrategy]
        }).compile();

        localAuthGuard = moduleRef.get<LocalAuthGuard>(LocalAuthGuard);
        userRepository = getRepository<User>(User);

        user = {
            id: "b6af7009-04da-4ac8-8cdc-ba13bdeaa803",
            username: "saul",
            email: "saul@goodman.com",
            password: await bcrypt.hash("money", await bcrypt.genSalt()),
            createdAt: new Date(),
            updatedAt: new Date()
        };
        await userRepository.insert(user);
    });

    afterAll(async () => {
        await userRepository.remove(user);
        return moduleRef.close();
    });

    test("Returns true", () => {
        const executionContext = createMockedExecutionContext({ username: user.username, password: "money" });
        return expect(localAuthGuard.canActivate(executionContext)).resolves.toEqual(true);
    });

    test("Returns false when the context is missing a request body", () => {
        const executionContext = createMockedExecutionContext(undefined);
        return expect(localAuthGuard.canActivate(executionContext)).toEqual(false);
    });

    test("Returns false when the username is missing", () => {
        const executionContext = createMockedExecutionContext({ password: user.password });
        return expect(localAuthGuard.canActivate(executionContext)).toEqual(false);
    });

    test("Returns false when the password is missing", () => {
        const executionContext = createMockedExecutionContext({ username: user.username });
        return expect(localAuthGuard.canActivate(executionContext)).toEqual(false);
    });

    test("Fails with UserNotFoundError when the user doesn't exist", () => {
        const executionContext = createMockedExecutionContext({ username: "jesse", password: user.password });
        return expect(localAuthGuard.canActivate(executionContext)).rejects.toThrowError(UserNotFoundError);
    });

    test("Fails with WrongPasswordError when the provided password is incorrect", () => {
        const executionContext = createMockedExecutionContext({ username: user.username, password: "power" });
        return expect(localAuthGuard.canActivate(executionContext)).rejects.toThrowError(WrongPasswordError);
    });
});