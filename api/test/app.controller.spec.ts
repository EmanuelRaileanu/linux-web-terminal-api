import { Test, TestingModule } from "@nestjs/testing";
import { AppController } from "../src/controllers/app.controller";
import { AppService } from "../src/services/app.service";

describe("AuthController", () => {
    let authController: AppController;

    beforeEach(async () => {
        const app: TestingModule = await Test.createTestingModule({
            controllers: [AppController],
            providers: [AppService]
        }).compile();

        authController = app.get<AppController>(AppController);
    });

    describe("/api/v1/login", () => {
        it("Should return 'Hello World!'", () => {
            return expect(authController.login()).resolves.toEqual("Hello World!");
        });
    });
});
