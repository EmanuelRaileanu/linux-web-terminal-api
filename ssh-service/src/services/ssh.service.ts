import { Injectable } from "@nestjs/common";
import { Socket } from "socket.io";
import { NodeSSH } from "node-ssh";
import { SSHInitRequest, SSHInstallationInitRequest } from "../entities";
import { config } from "../config";
import { ClientChannel } from "ssh2";

@Injectable()
export class SSHService {
    private readonly ssh = new NodeSSH();

    public async establishSSHConnection(ws: Socket, sshConfig: SSHInitRequest): Promise<void> {
        await this.ssh.connect(sshConfig);
        const shellStream = await this.ssh.requestShell();
        return this.streamDataThroughShell(ws, shellStream);
    }

    public async establishSSHConnectionForInstallation(ws: Socket, sshConfig: SSHInstallationInitRequest): Promise<void> {
        await this.ssh.connect({ ...config.hostMachine, ...sshConfig });
        await this.ssh.execCommand(`virsh console ${sshConfig.vmName}`);
        const shellStream = await this.ssh.requestShell();
        shellStream.write(`virsh console ${sshConfig.vmName}\n`);
        return this.streamDataThroughShell(ws, shellStream);
    }

    private async streamDataThroughShell(ws: Socket, shellStream: ClientChannel): Promise<void> {
        ws.on("command", (command: string) => {
            shellStream.write(command.trim() + "\n");
        });
        shellStream.on("data", (data: string) => {
            ws.send(data.toString());
        });
        shellStream.stderr.on("data", (data: string) => {
            ws.send(data);
        });
        this.handleSignals(ws, shellStream);
    }

    private handleSignals(ws: Socket, shellStream: ClientChannel) {
        ws.on("SIGINT", () => {
            shellStream.write("\x03");
        });
        ws.on("SIGTSTP", () => {
            shellStream.write("\x1A");
        });
    }
}