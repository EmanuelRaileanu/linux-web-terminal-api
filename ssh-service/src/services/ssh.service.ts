import { Injectable } from "@nestjs/common";
import { Socket } from "socket.io";
import { NodeSSH } from "node-ssh";
import { SSHInitRequest } from "../entities";

@Injectable()
export class SSHService {
    private readonly ssh = new NodeSSH();

    public async establishSSHConnection(ws: Socket, sshConfig: SSHInitRequest) {
        await this.ssh.connect(sshConfig);
        const shellStream = await this.ssh.requestShell();
        ws.on("command", command => {
            shellStream.write(command.trim() + "\n");
        });
        shellStream.on("data", (data: string) => {
            ws.send(data.toString());
        });
        shellStream.stderr.on("data", (data: string) => {
            ws.send(data);
        });
    }
}