import { Injectable } from "@nestjs/common";
import { Socket } from "socket.io";
import { NodeSSH } from "node-ssh";
import { SSHInitRequest, SSHInstallationInitRequest } from "../entities";
import { config } from "../config";

@Injectable()
export class SSHService {
    private readonly ssh = new NodeSSH();

    public async establishSSHConnection(ws: Socket, sshConfig: SSHInitRequest): Promise<void> {
        await this.ssh.connect(sshConfig);
        return this.streamDataThroughShell(ws);
    }

    public async establishSSHConnectionForInstallation(ws: Socket, sshConfig: SSHInstallationInitRequest): Promise<void> {
        await this.ssh.connect({ ...config.hostMachine, ...sshConfig });
        await this.ssh.execCommand(`virsh console ${sshConfig.vmName}`);
        return this.streamDataThroughShell(ws);
    }

    private async streamDataThroughShell(ws: Socket): Promise<void> {
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