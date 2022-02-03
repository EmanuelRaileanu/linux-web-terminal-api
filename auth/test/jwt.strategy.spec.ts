import { JwtStrategy } from "../src/strategies/jwt.strategy";
import { ValidateUserResponse } from "@shared/entities";

describe(JwtStrategy, () => {
    let jwtStrategy: JwtStrategy;

    beforeAll(() => {
        jwtStrategy = new JwtStrategy();
    });

    test("Verify method (trivial)", () => {
        const payload: ValidateUserResponse = {
            id: "10db1caa-9429-48da-a1dc-506202012af9",
            username: "bookface",
            email: "mail@face.com"
        };
        return expect(jwtStrategy.validate(payload)).toEqual(payload);
    });
});