export const config = {
    api: {
        serverPort: +(process.env.API_SERVER_PORT || 8000)
    },
    auth: {
        serverPort: +(process.env.AUTH_SERVER_PORT || 8001)
    },
    vmManager: {
        serverPort: +(process.env.VM_MANAGER_SERVER_PORT || 8002)
    }
};
