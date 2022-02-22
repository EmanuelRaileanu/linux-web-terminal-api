import { AuthService } from "../src/services/auth.service";
import { User } from "@shared/db-entities/user.entity";
import { getRepository, Repository } from "typeorm";
import { JwtModule, JwtService } from "@nestjs/jwt";
import { Test, TestingModule } from "@nestjs/testing";
import { TypeOrmModule } from "@nestjs/typeorm";
import { config } from "../src/config";
import { PassportModule } from "@nestjs/passport";
import { CacheModule } from "@nestjs/common";
import { UserService } from "../src/services/user.service";
import { LocalStrategy } from "../src/strategies/local.strategy";
import { JwtStrategy } from "../src/strategies/jwt.strategy";
import * as bcrypt from "bcryptjs";
import { AuthController } from "../src/controllers/auth.controller";
import { RegisterRequest, UserEntityHolder } from "../src/entities/auth.entities";
import { JwtResponse } from "../src/entities/jwt.entities";
import { PasswordsDoNotMatchError, UserAlreadyExistsError } from "@shared/errors";
import { ENTITIES } from "@shared/db-entities";

describe(AuthController, () => {
    let users: User[];
    let userRepository: Repository<User>;
    let authController: AuthController;
    let jwtService: JwtService;
    let moduleRef: TestingModule;

    beforeAll(async () => {
        moduleRef = await Test.createTestingModule({
            imports: [
                TypeOrmModule.forFeature(ENTITIES),
                TypeOrmModule.forRoot({
                    type: "mysql",
                    ...config.db,
                    database: config.testDb,
                    entities: ENTITIES
                }),
                PassportModule,
                JwtModule.register({
                    secret: config.jwt.secret,
                    signOptions: { expiresIn: config.jwt.lifespan }
                }),
                CacheModule.register()
            ],
            controllers: [AuthController],
            providers: [AuthService, UserService, LocalStrategy, JwtStrategy]
        }).compile();

        authController = moduleRef.get<AuthController>(AuthController);
        userRepository = getRepository<User>(User);
        jwtService = moduleRef.get<JwtService>(JwtService);

        users = [
            {
                id: "89e5513c-e455-4561-8717-dda74601e6f0",
                username: "rick",
                email: "rick@roll.com",
                password: await bcrypt.hash("password", await bcrypt.genSalt()),
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                id: "b3dcf1c5-4de8-41e9-b5ce-d882858e9940",
                username: "karen",
                email: "karen@email.com",
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

    test("Register successfully", async () => {
        const registerRequest: RegisterRequest = {
            username: "Galactus123",
            email: "classified@world.com",
            password: "password",
            confirmedPassword: "password"
        };
        await expect(authController.register(registerRequest)).resolves.toEqual(undefined);
        const createdUser = await userRepository.findOne({ username: registerRequest.username });
        users.push(createdUser as User);
        expect(registerRequest.username).toEqual(createdUser?.username);
        expect(registerRequest.email).toEqual(createdUser?.email);
        return expect(bcrypt.compare(registerRequest.password, createdUser?.password as string)).resolves.toEqual(true);
    });

    test("Register fails with UserAlreadyExistsError when providing a username that is already in use", () => {
        const registerRequest: RegisterRequest = {
            username: "rick",
            email: "classified@world.com",
            password: "password",
            confirmedPassword: "password"
        };
        return expect(authController.register(registerRequest)).rejects.toThrowError(UserAlreadyExistsError);
    });

    test("Register fails with UserAlreadyExistsError when providing an email that is already in use", () => {
        const registerRequest: RegisterRequest = {
            username: "kara",
            email: "rick@roll.com",
            password: "password",
            confirmedPassword: "password"
        };
        return expect(authController.register(registerRequest)).rejects.toThrowError(UserAlreadyExistsError);
    });

    test("Register fails with PasswordsDoNotMatchError when password is different from confirmedPassword", () => {
        const registerRequest: RegisterRequest = {
            username: "kara",
            email: "kara@email.com",
            password: "password",
            confirmedPassword: "inception"
        };
        return expect(authController.register(registerRequest)).rejects.toThrowError(PasswordsDoNotMatchError);
    });

    test("Login successfully", () => {
        const userEntityHolder: UserEntityHolder = {
            user: {
                id: users[0].id,
                email: users[0].email,
                username: users[0].username
            }
        };
        const expectedResponse: JwtResponse = {
            token: jwtService.sign(userEntityHolder.user)
        };
        return expect(authController.login(userEntityHolder)).resolves.toEqual(expectedResponse);
    });

    test("Logout successfully", () => {
        const userEntityHolder: UserEntityHolder = {
            user: {
                id: users[0].id,
                email: users[0].email,
                username: users[0].username
            }
        };
        return expect(authController.logout(userEntityHolder)).resolves.toEqual(undefined);
    });

    test("Validate token - returns currently logged in user", () => {
        const userEntityHolder: UserEntityHolder = {
            user: {
                id: users[0].id,
                email: users[0].email,
                username: users[0].username,
                iat: Date.now(),
                exp: Date.now() + config.jwt.lifespan * 1000
            }
        };
        return expect(authController.validateToken(userEntityHolder)).toEqual(userEntityHolder.user);
    });
});