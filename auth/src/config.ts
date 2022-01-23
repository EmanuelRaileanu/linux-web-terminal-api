export const config = {
    serverPort: +(process.env.AUTH_SERVER_PORT || 8001),
    jwt: {
        secret: process.env.JWT_SECRET || "bef71f6dd4cba6eaee4e4538e2adb46eac660d4109165d4518484d450c30c4a6",
        lifespan: process.env.JWT_LIFESPAN || "12h"
    }
};
