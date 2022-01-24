import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { User } from "../entities/db/user.entity";
import { CreateUserRequest } from "../entities/auth.entities";

@Injectable()
export class UserService {
    constructor(
        @InjectRepository(User) private readonly usersRepository: Repository<User>
    ) {}

    public findById(id: string): Promise<User | undefined> {
        return this.usersRepository.findOne(id);
    }

    public findByUsername(username: string): Promise<User | undefined> {
        return this.usersRepository.findOne({ username });
    }

    public findByEmail(email: string): Promise<User | undefined> {
        return this.usersRepository.findOne({ email });
    }

    public async create(payload: CreateUserRequest): Promise<User> {
        return this.usersRepository.save(this.usersRepository.create(payload));
    }

    public async deleteById(id: string): Promise<void> {
        await this.usersRepository.delete(id);
    }
}