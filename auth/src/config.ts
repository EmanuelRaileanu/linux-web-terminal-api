export const config = {
    serverPort: +(process.env.AUTH_SERVER_PORT || 8001),
    jwt: {
        secret: process.env.JWT_SECRET || "bef71f6dd4cba6eaee4e4538e2adb46eac660d4109165d4518484d450c30c4a6",
        lifespan: +(process.env.JWT_LIFESPAN || 86400)
    },
    db: {
        host: process.env.DB_HOST || "localhost",
        port: +(process.env.DB_PORT || 3306),
        username: process.env.DB_USERNAME || "dev",
        password: process.env.DB_PASSWORD || "emanuel",
        database: process.env.DB_NAME || "auth"
    },
    testDb: process.env.TEST_DB_NAME || "test",
    redis: {
        host: process.env.REDIS_HOST || "localhost",
        port: +(process.env.REDIS_PORT || 6379)
    },
    https: {
        keyPath: process.env.PATH_TO_KEY || "/key.pem",
        certPath: process.env.PATH_TOC_CERT || "/cert.pem"
    }
};
