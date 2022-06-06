import {
    OnGatewayConnection,
    OnGatewayDisconnect,
    OnGatewayInit,
    SubscribeMessage,
    WebSocketGateway,
    WebSocketServer,
    WsResponse
} from "@nestjs/websockets";
import { Logger } from "@nestjs/common";
import { Server, Socket } from "socket.io";
import { SSHService } from "./services/ssh.service";
import { SSHInitRequest, SSHInstallationInitRequest } from "./entities";

@WebSocketGateway({ cors: true })
export class AppGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer() server: Server;
    private readonly logger: Logger = new Logger("AppGateway");

    constructor(private readonly sshService: SSHService) {}

    public afterInit(server: Server): void {
        this.logger.log("Init websocket server");
    }

    public handleConnection(client: Socket, ...args: any[]): void {
        this.logger.log(`Client connected: ${client.id}`);
    }

    public handleDisconnect(client: Socket): void {
        this.logger.log(`Client disconnected: ${client.id}`);
    }

    @SubscribeMessage("ssh")
    public async handleSSHConnection(client: Socket, payload: SSHInitRequest): Promise<WsResponse> {
        await this.sshService.establishSSHConnection(client, payload);
        this.logger.log("SSH Connection established");
        return { event: "ssh-connection", data: "Connection established" };
    }

    @SubscribeMessage("ssh-installation")
    public async handleSSHConnectionForInstallation(client: Socket, payload: SSHInstallationInitRequest): Promise<WsResponse> {
        await this.sshService.establishSSHConnectionForInstallation(client, payload);
        this.logger.log("SSH Connection established (VM installation)");
        return { event: "ssh-installation-connection", data: "Connection established" };
    }
}