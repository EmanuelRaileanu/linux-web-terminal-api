import { Module } from "@nestjs/common";
import { AuthController } from "../controllers/auth.controller";
import { AuthService } from "../services/auth.service";
import { UserModule } from "./user.module";
import { PassportModule } from "@nestjs/passport";
import { LocalStrategy } from "../strategies/local.strategy";
import { JwtModule } from "@nestjs/jwt";
import { config } from "../config";
import { JwtStrategy } from "../strategies/jwt.strategy";
import { TypeOrmModule } from "@nestjs/typeorm";
import { UserController } from "../controllers/user.controller";
import { ENTITIES } from "@shared/db-entities";

@Module({
    imports: [
        UserModule,
        PassportModule,
        JwtModule.register({
            secret: config.jwt.secret,
            signOptions: { expiresIn: config.jwt.lifespan + "s" }
        }),
        TypeOrmModule.forRoot({
            type: "mysql",
            ...config.db,
            entities: ENTITIES
        })
    ],
    controllers: [AuthController, UserController],
    providers: [AuthService, LocalStrategy, JwtStrategy]
})
export class AuthModule {}
