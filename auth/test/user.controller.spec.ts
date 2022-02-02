import { UserService } from "../src/services/user.service";
import { User } from "../src/entities/db/user.entity";
import { getRepository, Repository } from "typeorm";
import { Test, TestingModule } from "@nestjs/testing";
import { TypeOrmModule } from "@nestjs/typeorm";
import { config } from "../src/config";
import { CacheModule } from "@nestjs/common";
import * as bcrypt from "bcryptjs";
import { UserController } from "../src/controllers/user.controller";
import { ChangeEmailRequest, ChangePasswordRequest, ChangeUsernameRequest } from "../src/entities/user.entities";
import { UserEntityHolder } from "../src/entities/auth.entities";
import { PasswordsDoNotMatchError, UserAlreadyExistsError, UserNotFoundError, WrongPasswordError } from "@shared/errors";
import { JwtModule } from "@nestjs/jwt";
import { SessionUserEntity } from "@shared/entities";

describe(UserService, () => {
    let users: User[];
    let userRepository: Repository<User>;
    let userController: UserController;
    let moduleRef: TestingModule;
    let userEntityHolder: UserEntityHolder;

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
                JwtModule.register({
                    secret: config.jwt.secret,
                    signOptions: { expiresIn: config.jwt.lifespan }
                }),
                CacheModule.register()
            ],
            controllers: [UserController],
            providers: [UserService]
        }).compile();

        userController = moduleRef.get<UserController>(UserController);
        userRepository = getRepository<User>(User);
        users = [
            {
                id: "929a511c-a390-457e-8eb8-aab468ea93f5",
                username: "carl",
                email: "carl@email.com",
                password: await bcrypt.hash("password", await bcrypt.genSalt()),
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                id: "3ceeb3d0-09d5-4cb5-a5a6-c40e9d1b1462",
                username: "irina",
                email: "irina@email.com",
                password: await bcrypt.hash("password", await bcrypt.genSalt()),
                createdAt: new Date(),
                updatedAt: new Date()
            }
        ];
        userEntityHolder = { user: users[0] };
        await userRepository.insert(users);
    });

    afterAll(async () => {
        await userRepository.remove(users);
        return moduleRef.close();
    });

    test("Changing username fails with UserAlreadyExistsError when the username is already in use", () => {
        const changeUsernameRequest: ChangeUsernameRequest = {
            newUsername: users[1].username,
            password: "password"
        };
        const promise = userController.changeUsername(userEntityHolder, changeUsernameRequest);
        return expect(promise).rejects.toThrowError(UserAlreadyExistsError);
    });

    test("Change username", async () => {
        const changeUsernameRequest: ChangeUsernameRequest = {
            newUsername: "scott",
            password: "password"
        };
        const promise = userController.changeUsername(userEntityHolder, changeUsernameRequest);
        await expect(promise).resolves.toEqual(undefined);
        users[0] = { ...users[0], username: changeUsernameRequest.newUsername };
        const updatedUser = await userRepository.findOne(users[0].id);
        return expect(updatedUser?.username).toEqual(users[0].username);
    });

    test("Changing username fails with UserNotFoundError when the user doesn't exist", () => {
        const changeUsernameRequest: ChangeUsernameRequest = {
            newUsername: "scott",
            password: "password"
        };
        const user = { id: "3408ba41-3b24-4e17-b589-e8b9af2d1d8c" } as SessionUserEntity;
        const promise = userController.changeUsername({ user }, changeUsernameRequest);
        return expect(promise).rejects.toThrowError(UserNotFoundError);
    });

    test("Changing username fails with WrongPasswordError when providing the wrong current password", () => {
        const changeUsernameRequest: ChangeUsernameRequest = {
            newUsername: "scott",
            password: "desktop"
        };
        const promise = userController.changeUsername(userEntityHolder, changeUsernameRequest);
        return expect(promise).rejects.toThrowError(WrongPasswordError);
    });

    test("Changing email fails with UserAlreadyExistsError when the email is already in use", () => {
        const changeEmailRequest: ChangeEmailRequest = {
            newEmail: users[1].email,
            password: "password"
        };
        const promise = userController.changeEmail(userEntityHolder, changeEmailRequest);
        return expect(promise).rejects.toThrowError(UserAlreadyExistsError);
    });

    test("Change email", async () => {
        const changeEmailRequest: ChangeEmailRequest = {
            newEmail: "scott@castle.com",
            password: "password"
        };
        const promise = userController.changeEmail(userEntityHolder, changeEmailRequest);
        await expect(promise).resolves.toEqual(undefined);
        users[0] = { ...users[0], email: changeEmailRequest.newEmail };
        const updatedUser = await userRepository.findOne(users[0].id);
        return expect(updatedUser?.email).toEqual(users[0].email);
    });

    test("Changing email fails with UserNotFoundError when the user doesn't exist", () => {
        const changeEmailRequest: ChangeEmailRequest = {
            newEmail: "scott@castiglioni.com",
            password: "password"
        };
        const user = { id: "3408ba41-3b24-4e17-b589-e8b9af2d1d8c" } as SessionUserEntity;
        const promise = userController.changeEmail({ user }, changeEmailRequest);
        return expect(promise).rejects.toThrowError(UserNotFoundError);
    });

    test("Changing email fails with WrongPasswordError when providing the wrong current password", () => {
        const changeEmailRequest: ChangeEmailRequest = {
            newEmail: "scott@castiglioni@gmail.com",
            password: "desktop"
        };
        const promise = userController.changeEmail(userEntityHolder, changeEmailRequest);
        return expect(promise).rejects.toThrowError(WrongPasswordError);
    });

    test("Change password", async () => {
        const changePasswordRequest: ChangePasswordRequest = {
            currentPassword: "password",
            newPassword: "sparta",
            confirmedNewPassword: "sparta"
        };
        const promise = userController.changePassword(userEntityHolder, changePasswordRequest);
        await expect(promise).resolves.toEqual(undefined);
        const updatedUser = await userRepository.findOne(users[0].id);
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
        const promise = userController.changePassword({ user }, changePasswordRequest);
        return expect(promise).rejects.toThrowError(UserNotFoundError);
    });

    test("Change password fails with WrongPasswordError when providing the wrong current password", () => {
        const changePasswordRequest: ChangePasswordRequest = {
            currentPassword: "fishy",
            newPassword: "sparta",
            confirmedNewPassword: "sparta"
        };
        const promise = userController.changePassword(userEntityHolder, changePasswordRequest);
        return expect(promise).rejects.toThrowError(WrongPasswordError);
    });

    test("Change password fails with WrongPasswordError when passwords do not match", () => {
        const changePasswordRequest: ChangePasswordRequest = {
            currentPassword: "sparta",
            newPassword: "spear",
            confirmedNewPassword: "spearhead"
        };
        const promise = userController.changePassword(userEntityHolder, changePasswordRequest);
        return expect(promise).rejects.toThrowError(PasswordsDoNotMatchError);
    });
});