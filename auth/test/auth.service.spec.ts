import { AuthService } from "../src/services/auth.service";
import { User } from "@shared/db-entities/user.entity";
import { getRepository, Repository } from "typeorm";
import { UserService } from "../src/services/user.service";
import { Test, TestingModule } from "@nestjs/testing";
import { TypeOrmModule } from "@nestjs/typeorm";
import { config } from "../src/config";
import { JwtModule, JwtService } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";
import { LocalStrategy } from "../src/strategies/local.strategy";
import { JwtStrategy } from "../src/strategies/jwt.strategy";
import * as bcrypt from "bcryptjs";
import { PasswordsDoNotMatchError, UserAlreadyExistsError, UserNotFoundError, WrongPasswordError } from "@shared/errors";
import { RegisterRequest } from "../src/entities/auth.entities";
import { CacheModule } from "@nestjs/common";
import { ValidateUserResponse } from "@shared/entities";
import { OperatingSystem } from "@shared/db-entities/operating-system.entity";

describe(AuthService, () => {
    let users: User[];
    let userRepository: Repository<User>;
    let authService: AuthService;
    let jwtService: JwtService;
    let moduleRef: TestingModule;

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
            providers: [AuthService, UserService, LocalStrategy, JwtStrategy]
        }).compile();

        authService = moduleRef.get<AuthService>(AuthService);
        jwtService = moduleRef.get<JwtService>(JwtService);

        userRepository = getRepository<User>(User);
        users = [
            {
                id: "1ff9185d-0cfd-4df9-a9b7-f7255b43f971",
                username: "john",
                email: "john@email.com",
                password: await bcrypt.hash("password", await bcrypt.genSalt()),
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                id: "9787ea52-56bf-4896-82dd-6a198ccea54e",
                username: "mary",
                email: "mary@email.com",
                password: await bcrypt.hash("joker", await bcrypt.genSalt()),
                createdAt: new Date(),
                updatedAt: new Date()
            }
        ];
        await userRepository.insert(users);
    });

    afterAll(async () => {
        await userRepository.remove(users);
        return moduleRef.close();
    });

    test("Validate user successfully", () => {
        return expect(authService.validateUser(users[0].username, "password"))
            .resolves.toEqual({
                id: users[0].id,
                username: users[0].username,
                email: users[0].email
            });
    });

    test("Validate user fails with UserNotFoundError", () => {
        return expect(authService.validateUser("batman", "dark"))
            .rejects.toThrowError(UserNotFoundError);
    });

    test("Validate user fails with WrongPasswordError", () => {
        return expect(authService.validateUser(users[0].username, "wrongPassword"))
            .rejects.toThrowError(WrongPasswordError);
    });

    test("Register successfully", async () => {
        const registerRequest: RegisterRequest = {
            username: "TheDarkKnight",
            email: "bruce@wayne.com",
            password: "alfred",
            confirmedPassword: "alfred"
        };
        await expect(authService.register(registerRequest)).resolves.toEqual(undefined);
        const createdUser = await userRepository.findOne({ username: registerRequest.username });
        users.push(createdUser as User);
        expect(registerRequest.username).toEqual(createdUser?.username);
        expect(registerRequest.email).toEqual(createdUser?.email);
    });

    test("Register fails with UserAlreadyExistsError when the username is already in use", () => {
        const registerRequest: RegisterRequest = {
            username: "john",
            email: "bruce@wayne.com",
            password: "alfred",
            confirmedPassword: "alfred"
        };
        return expect(authService.register(registerRequest)).rejects.toThrowError(UserAlreadyExistsError);
    });

    test("Register fails with UserAlreadyExistsError when the email is already in use", () => {
        const registerRequest: RegisterRequest = {
            username: "bill",
            email: "john@email.com",
            password: "password",
            confirmedPassword: "password"
        };
        return expect(authService.register(registerRequest)).rejects.toThrowError(UserAlreadyExistsError);
    });

    test("Register fails with PasswordsDoNotMatchError", () => {
        const registerRequest: RegisterRequest = {
            username: "bill",
            email: "bill@email.com",
            password: "password",
            confirmedPassword: "password123"
        };
        return expect(authService.register(registerRequest)).rejects.toThrowError(PasswordsDoNotMatchError);
    });

    test("Login successful", () => {
        const payload: ValidateUserResponse = {
            id: "e2f3f081-395d-459d-85a4-5bb7b75d803b",
            username: "Tom",
            email: "tom@earth.com"
        };
        return expect(authService.login(payload)).resolves.toEqual({ token: jwtService.sign(payload) });
    });

    test("Logout successful", () => {
        const payload: ValidateUserResponse = {
            id: "e2f3f081-395d-459d-85a4-5bb7b75d803b",
            username: "Tom",
            email: "tom@earth.com"
        };
       return expect(authService.logout(payload)).resolves.toEqual(undefined);
    });
});
