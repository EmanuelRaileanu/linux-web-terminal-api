import { Module } from "@nestjs/common";
import { UserService } from "../services/user.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { User } from "../entities/db/user.entity";

@Module({
    imports: [TypeOrmModule.forFeature([User])],
    providers: [UserService],
    exports: [UserService, TypeOrmModule]
})
export class UserModule {}
