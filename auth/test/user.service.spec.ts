import { UserService } from "../src/services/user.service";
import { getRepository, QueryFailedError, Repository } from "typeorm";
import { User } from "../src/entities/db/user.entity";
import { Test, TestingModule } from "@nestjs/testing";
import { TypeOrmModule } from "@nestjs/typeorm";
import { config } from "../src/config";

describe(UserService, () => {
    let users: User[];
    let userRepository: Repository<User>;
    let userService: UserService;
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
                })
            ],
            providers: [UserService]
        }).compile();

        userService = moduleRef.get<UserService>(UserService);

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
        return moduleRef.close();
    });

    test("Fetch user by id", () => {
        return expect(userService.findById(users[0].id)).resolves.toEqual(users[0]);
    });

    test("Fetch user by id when user doesn't exist", () => {
        return expect(userService.findById("81e92e0e-2d51-426f-9887-846e9e3d486a")).resolves.toEqual(undefined);
    });

    test("Fetch user by username", () => {
        return expect(userService.findByUsername("john")).resolves.toEqual(users[0]);
    });

    test("Fetch user by username when user doesn't exist", () => {
        return expect(userService.findById("greg")).resolves.toEqual(undefined);
    });

    test("Fetch user by email", () => {
        return expect(userService.findByEmail("john@email.com")).resolves.toEqual(users[0]);
    });

    test("Fetch user by email when user doesn't exist", () => {
        return expect(userService.findById("email@nsa.com")).resolves.toEqual(undefined);
    });

    test("Add user", async () => {
        const user = {
            username: "bruce",
            email: "wayne@enterprise.com",
            password: "darkKnight"
        };
        const createdUser = await userService.create(user);
        return expect(userService.findByUsername(user.username)).resolves.toEqual(createdUser);
    });

    test("Add an user with the same email as an already existing one", () => {
        const user = {
            username: "vlad",
            email: "john@email.com",
            password: "bat"
        };
        return expect(userService.create(user)).rejects.toThrowError(QueryFailedError);
    });

    test("Add an user with the same username as an already existing one", () => {
        const user = {
            username: "john",
            email: "barrel@email.com",
            password: "forest"
        };
        return expect(userService.create(user)).rejects.toThrowError(QueryFailedError);
    });

    test("Delete user by id", async () => {
        const id = users[1].id;
        await userService.deleteById(id);
        return expect(userService.findById(id)).resolves.toEqual(undefined);
    });

    test("Delete user by id when user is not found", () => {
        return expect(userService.deleteById("8814aa9c-7d83-426b-b059-7ca128dbd81a")).resolves.toEqual(undefined);
    });
});