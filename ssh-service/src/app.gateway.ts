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

const sshConfig = {
    host: "192.168.1.101",
    username: "emanuel",
    password: "emanuelserver"
};

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

    @SubscribeMessage("msgToServer")
    public handleMessage(client: Socket, payload: any): WsResponse {
        return { event: "msgToClient", data: payload };
    }

    @SubscribeMessage("ssh")
    public async handleSSHConnection(client: Socket, payload: any): Promise<WsResponse> {
        await this.sshService.establishSSHConnection(client, sshConfig);
        this.logger.log("SSH Connection established");
        return { event: "ssh-connection", data: "Connection established" };
    }
}