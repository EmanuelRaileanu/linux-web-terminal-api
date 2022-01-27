import { CacheModule, Module } from "@nestjs/common";
import { UserService } from "../services/user.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { User } from "../entities/db/user.entity";
import { ClientOpts as RedisClientOpts } from "redis";
import * as redisStore from "cache-manager-redis-store";
import { config } from "../config";

@Module({
    imports: [
        TypeOrmModule.forFeature([User]),
        CacheModule.register<RedisClientOpts>({
            store: redisStore,
            host: config.redis.host,
            port: config.redis.port
        })
    ],
    providers: [UserService],
    exports: [UserService, TypeOrmModule, CacheModule]
})
export class UserModule {}
