import { bootstrapServer } from "../../shared/utils";
import { config } from "../../config";
import { AppModule } from "./app.module";

bootstrapServer(AppModule, config.vmManager.serverPort)
    .catch((err) => console.error("Error occurred when starting api service:", err));