export interface SSHInitRequest {
    host: string;
    username: string;
    password: string;
}

export interface SSHInstallationInitRequest extends SSHInitRequest {
    vmName: string;
}