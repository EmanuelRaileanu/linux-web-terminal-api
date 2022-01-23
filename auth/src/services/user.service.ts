import { Injectable } from "@nestjs/common";
import { CreateUserRequest, User } from "../entities/user.entities";

@Injectable()
export class UserService {
    private readonly users: User[] = [
        {
            id: 0,
            username: "john",
            password: "password"
        },
        {
            id: 1,
            username: "maria",
            password: "guess"
        }
    ];

    public async findOne(username: string): Promise<User | undefined> {
        return this.users.find(user => user.username === username);
    }

    public async create(payload: CreateUserRequest): Promise<void> {
        this.users.push({ id: this.users.length, ...payload });
    }
}