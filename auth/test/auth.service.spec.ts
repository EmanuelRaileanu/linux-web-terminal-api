import { AuthService } from "../src/services/auth.service";
import { User } from "../src/entities/db/user.entity";
import { getConnection, getRepository, Repository } from "typeorm";
import { UserService } from "../src/services/user.service";
import { Test, TestingModule } from "@nestjs/testing";
import { TypeOrmModule } from "@nestjs/typeorm";
import { config } from "../src/config";
import { JwtModule } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";
import { LocalStrategy } from "../src/strategies/local.strategy";
import { JwtStrategy } from "../src/strategies/jwt.strategy";

describe(AuthService, () => {
    let users: User[];
    let userRepository: Repository<User>;
    let authService: UserService;
    let moduleRef: TestingModule;

    beforeAll(async () => {
        moduleRef = await Test.createTestingModule({
            imports: [
                TypeOrmModule.forFeature([User]),
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
                })
            ],
            providers: [AuthService, UserService, LocalStrategy, JwtStrategy]
        }).compile();

        authService = moduleRef.get<UserService>(UserService);

        userRepository = getRepository<User>(User);
        await userRepository.clear();
        users = [
            {
                id: "1ff9185d-0cfd-4df9-a9b7-f7255b43f971",
                username: "john",
                email: "john@email.com",
                password: "password",
                createdAt: new Date,
                updatedAt: new Date()
            },
            {
                id: "9787ea52-56bf-4896-82dd-6a198ccea54e",
                username: "mary",
                email: "mary@email.com",
                password: "joker",
                createdAt: new Date,
                updatedAt: new Date()
            }
        ];
        await userRepository.insert(users);
    });

    afterAll(async () => {
        await userRepository.clear();
        return getConnection().close();
    });

    test("First", () => {
        return expect(1).toEqual(1);
    });
});