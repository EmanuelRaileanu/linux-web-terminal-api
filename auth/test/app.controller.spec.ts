import { Test, TestingModule } from "@nestjs/testing";
import { AuthController } from "../src/controllers/auth.controller";
import { AuthService } from "../src/services/auth.service";

describe("AuthController", () => {
    let authController: AuthController;

    beforeEach(async () => {
        const app: TestingModule = await Test.createTestingModule({
            controllers: [AuthController],
            providers: [AuthService]
        }).compile();

        authController = app.get<AuthController>(AuthController);
    });

    describe("/api/v1/login", () => {
        it("Should return 'Hello World!'", () => {
            return expect(authController.login()).resolves.toEqual("Hello World!");
        });
    });
});
