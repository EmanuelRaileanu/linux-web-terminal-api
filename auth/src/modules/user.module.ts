import { CacheModule, Module } from "@nestjs/common";
import { UserService } from "../services/user.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ClientOpts as RedisClientOpts } from "redis";
import * as redisStore from "cache-manager-redis-store";
import { config } from "../config";
import { User } from "@shared/db-entities/user.entity";

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
