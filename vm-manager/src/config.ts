export const config = {
    serverPort: +(process.env.VM_MANAGER_SERVER_PORT || 8002),
    authService: {
        url: process.env.AUTH_SERVICE_URL || "http://localhost:8001/api/v1",
        validateTokenPath: process.env.AUTH_SERVICE_VALIDATE_TOKEN_PATH || "/validate-token"
    }
};
