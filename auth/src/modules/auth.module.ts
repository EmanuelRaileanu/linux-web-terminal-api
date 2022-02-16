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
import { User } from "@shared/db-entities/user.entity";
import { UserController } from "../controllers/user.controller";
import { OperatingSystem } from "@shared/db-entities/operating-system.entity";

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
            entities: [User, OperatingSystem],
            synchronize: true
        })
    ],
    controllers: [AuthController, UserController],
    providers: [AuthService, LocalStrategy, JwtStrategy]
})
export class AuthModule {}
