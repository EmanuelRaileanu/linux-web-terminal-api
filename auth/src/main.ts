import { bootstrapServer } from "../../shared/utils";
import { config } from "./config";
import { AuthModule } from "./auth.module";

bootstrapServer(AuthModule, config.serverPort)
    .catch((err) => console.error("Error occurred when starting api service:", err));