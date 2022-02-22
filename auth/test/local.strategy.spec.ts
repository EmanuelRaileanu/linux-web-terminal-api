import { LocalStrategy } from "../src/strategies/local.strategy";
import { Test, TestingModule } from "@nestjs/testing";
import { AuthService } from "../src/services/auth.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { User } from "@shared/db-entities/user.entity";
import { config } from "../src/config";
import { getRepository, Repository } from "typeorm";
import * as bcrypt from "bcryptjs";
import { CacheModule } from "@nestjs/common";
import { UserService } from "../src/services/user.service";
import { JwtModule } from "@nestjs/jwt";
import { UserNotFoundError, WrongPasswordError } from "@shared/errors";
import { ValidateUserResponse } from "@shared/entities";
import { ENTITIES } from "@shared/db-entities";

describe(LocalStrategy, () => {
    let user: User;
    let moduleRef: TestingModule;
    let localStrategy: LocalStrategy;
    let userRepository: Repository<User>;

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
                JwtModule.register({
                    secret: config.jwt.secret,
                    signOptions: { expiresIn: config.jwt.lifespan }
                }),
                CacheModule.register()
            ],
            providers: [AuthService, UserService, LocalStrategy]
        }).compile();

        localStrategy = moduleRef.get<LocalStrategy>(LocalStrategy);
        userRepository = getRepository<User>(User);

        user = {
            id: "f7b8a91a-107f-4be6-8d0c-21a4b1094f0a",
            username: "Username123",
            email: "user@dream.com",
            password: await bcrypt.hash("trivial", await bcrypt.genSalt()),
            createdAt: new Date(),
            updatedAt: new Date()
        };
        await userRepository.insert(user);
    });

    afterAll(async () => {
        await userRepository.remove(user);
        return moduleRef.close();
    });

    test("Validation successful", () => {
        const expectedResponse: ValidateUserResponse = {
            id: user.id,
            username: user.username,
            email: user.email
        };
        return expect(localStrategy.validate(user.username, "trivial")).resolves.toEqual(expectedResponse);
    });

    test("Validation fails with UserNotFoundError when providing the wrong username", () => {
        return expect(localStrategy.validate("fakeUsername", "trivial")).rejects.toThrowError(UserNotFoundError);
    });

    test("Validation fails with WrongPasswordError when providing the wrong password", () => {
        return expect(localStrategy.validate(user.username, "ezPassword")).rejects.toThrowError(WrongPasswordError);
    });
});