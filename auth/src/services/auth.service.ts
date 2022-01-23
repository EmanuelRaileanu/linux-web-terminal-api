import { BadRequestException, Injectable } from "@nestjs/common";
import { UserService } from "./user.service";
import { RegisterRequest, ValidateUserResponse } from "../entities/user.entities";
import { JwtService } from "@nestjs/jwt";
import { JwtResponse } from "../entities/jwt.entities";

@Injectable()
export class AuthService {
    constructor(
        private readonly usersService: UserService,
        private readonly jwtService: JwtService
    ) {}

    public async validateUser(userName: string, pass: string): Promise<ValidateUserResponse | undefined> {
        const user = await this.usersService.findOne(userName);
        if (!user || user.password !== pass) {
            return undefined;
        }
        const { id, username } = user;
        return { id, username };
    }

    public async register(payload: RegisterRequest): Promise<void> {
        const { password, confirmedPassword, username } = payload;
        if (!password || !confirmedPassword || password !== confirmedPassword) {
            throw new BadRequestException();
        }
        return this.usersService.create({ username, password });
    }

    public async login(user: ValidateUserResponse): Promise<JwtResponse> {
        return {
            token: this.jwtService.sign(user)
        };
    }
}
