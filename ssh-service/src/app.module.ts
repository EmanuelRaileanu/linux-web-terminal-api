import { Module } from "@nestjs/common";
import { AppGateway } from "./app.gateway";
import { SSHService } from "./services/ssh.service";

@Module({
    providers: [AppGateway, SSHService]
})
export class AppModule {}
