export interface SSHInitRequest {
    host: string;
    username: string;
    password: string;
}

export interface SSHInstallationInitRequest {
    vmName: string;
}