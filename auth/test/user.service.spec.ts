import { UserService } from "../src/services/user.service";
import { getRepository, QueryFailedError, Repository } from "typeorm";
import { User } from "../src/entities/db/user.entity";
import { Test, TestingModule } from "@nestjs/testing";
import { TypeOrmModule } from "@nestjs/typeorm";
import { config } from "../src/config";
import { CacheModule } from "@nestjs/common";
import { ChangeEmailRequest, ChangePasswordRequest, ChangeUsernameRequest } from "../src/entities/user.entities";
import { SessionUserEntity } from "../src/entities/auth.entities";
import * as bcrypt from "bcryptjs";
import { PasswordsDoNotMatchError, UserNotFoundError, WrongPasswordError } from "../src/errors";

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
                }),
                CacheModule.register()
            ],
            providers: [UserService]
        }).compile();

        userService = moduleRef.get<UserService>(UserService);

        userRepository = getRepository<User>(User);
        users = [
            {
                id: "49e2ad64-ff8f-4319-a1d2-4f602ffeaa75",
                username: "jared",
                email: "jared@email.com",
                password: await bcrypt.hash("password", await bcrypt.genSalt()),
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                id: "5870295a-3ce2-40f5-b9cf-d03afa20a600",
                username: "natalia",
                email: "natalia@email.com",
                password: await bcrypt.hash("jester", await bcrypt.genSalt()),
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

    test("Fetch user by id", () => {
        return expect(userService.findById(users[0].id)).resolves.toEqual(users[0]);
    });

    test("Fetch user by id when user doesn't exist", () => {
        return expect(userService.findById("81e92e0e-2d51-426f-9887-846e9e3d486a")).resolves.toEqual(undefined);
    });

    test("Fetch user by username", () => {
        return expect(userService.findByUsername("jared")).resolves.toEqual(users[0]);
    });

    test("Fetch user by username when user doesn't exist", () => {
        return expect(userService.findById("greg")).resolves.toEqual(undefined);
    });

    test("Fetch user by email", () => {
        return expect(userService.findByEmail("jared@email.com")).resolves.toEqual(users[0]);
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
        users.push(createdUser);
        return expect(userService.findByUsername(user.username)).resolves.toEqual(createdUser);
    });

    test("Add an user with the same email as an already existing one", () => {
        const user = {
            username: "vlad",
            email: "jared@email.com",
            password: "bat"
        };
        return expect(userService.create(user)).rejects.toThrowError(QueryFailedError);
    });

    test("Add an user with the same username as an already existing one", () => {
        const user = {
            username: "jared",
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

    test("Change username", async () => {
        const changeUsernameRequest: ChangeUsernameRequest = {
            newUsername: "frank",
            password: "password"
        };
        const promise = userService.changeUsername(users[0] as unknown as SessionUserEntity, changeUsernameRequest);
        await expect(promise).resolves.toEqual(undefined);
        users[0] = { ...users[0], username: changeUsernameRequest.newUsername };
        const updatedUser = await userService.findById(users[0].id);
        return expect(updatedUser?.username).toEqual(users[0].username);
    });

    test("Changing username fails with UserNotFoundError when the user doesn't exist", () => {
        const changeUsernameRequest: ChangeUsernameRequest = {
            newUsername: "frank",
            password: "password"
        };
        const user = { id: "3408ba41-3b24-4e17-b589-e8b9af2d1d8c" } as SessionUserEntity;
        const promise = userService.changeUsername(user, changeUsernameRequest);
        return expect(promise).rejects.toThrowError(UserNotFoundError);
    });

    test("Changing username fails with WrongPasswordError when providing the wrong current password", () => {
        const changeUsernameRequest: ChangeUsernameRequest = {
            newUsername: "spider",
            password: "desktop"
        };
        const promise = userService.changeUsername(users[0] as unknown as SessionUserEntity, changeUsernameRequest);
        return expect(promise).rejects.toThrowError(WrongPasswordError);
    });

    test("Change email", async () => {
        const changeEmailRequest: ChangeEmailRequest = {
            newEmail: "frank@castle.com",
            password: "password"
        };
        const promise = userService.changeEmail(users[0] as unknown as SessionUserEntity, changeEmailRequest);
        await expect(promise).resolves.toEqual(undefined);
        users[0] = { ...users[0], email: changeEmailRequest.newEmail };
        const updatedUser = await userService.findById(users[0].id);
        return expect(updatedUser?.email).toEqual(users[0].email);
    });

    test("Changing email fails with UserNotFoundError when the user doesn't exist", () => {
        const changeEmailRequest: ChangeEmailRequest = {
            newEmail: "pete@castiglioni.com",
            password: "password"
        };
        const user = { id: "3408ba41-3b24-4e17-b589-e8b9af2d1d8c" } as SessionUserEntity;
        const promise = userService.changeEmail(user, changeEmailRequest);
        return expect(promise).rejects.toThrowError(UserNotFoundError);
    });

    test("Changing email fails with WrongPasswordError when providing the wrong current password", () => {
        const changeEmailRequest: ChangeEmailRequest = {
            newEmail: "pete@castiglioni@gmail.com",
            password: "desktop"
        };
        const promise = userService.changeEmail(users[0] as unknown as SessionUserEntity, changeEmailRequest);
        return expect(promise).rejects.toThrowError(WrongPasswordError);
    });

    test("Change password", async () => {
        const changePasswordRequest: ChangePasswordRequest = {
            currentPassword: "password",
            newPassword: "sparta",
            confirmedNewPassword: "sparta"
        };
        const promise = userService.changePassword(users[0] as unknown as SessionUserEntity, changePasswordRequest);
        await expect(promise).resolves.toEqual(undefined);
        const updatedUser = await userService.findById(users[0].id);
        users[0] = { ...users[0], password: updatedUser?.password as string };
        return expect(await bcrypt.compare(changePasswordRequest.newPassword, updatedUser?.password as string));
    });

    test("Change password fails with UserNotFoundError when the user doesn't exist", () => {
        const changePasswordRequest: ChangePasswordRequest = {
            currentPassword: "password",
            newPassword: "sparta",
            confirmedNewPassword: "sparta"
        };
        const user = { id: "3408ba41-3b24-4e17-b589-e8b9af2d1d8c" } as SessionUserEntity;
        const promise = userService.changePassword(user, changePasswordRequest);
        return expect(promise).rejects.toThrowError(UserNotFoundError);
    });

    test("Change password fails with WrongPasswordError when providing the wrong current password", () => {
        const changePasswordRequest: ChangePasswordRequest = {
            currentPassword: "fishy",
            newPassword: "sparta",
            confirmedNewPassword: "sparta"
        };
        const promise = userService.changePassword(users[0] as unknown as SessionUserEntity, changePasswordRequest);
        return expect(promise).rejects.toThrowError(WrongPasswordError);
    });

    test("Change password fails with WrongPasswordError when passwords do not match", () => {
        const changePasswordRequest: ChangePasswordRequest = {
            currentPassword: "sparta",
            newPassword: "spear",
            confirmedNewPassword: "spearhead"
        };
        const promise = userService.changePassword(users[0] as unknown as SessionUserEntity, changePasswordRequest);
        return expect(promise).rejects.toThrowError(PasswordsDoNotMatchError);
    });
});