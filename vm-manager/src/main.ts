import { bootstrapServer } from "@shared/utils";
import { config } from "./config";
import { VmManagerModule } from "./vm-manager.module";

bootstrapServer(VmManagerModule, config.serverPort)
    .catch((err) => console.error("Error occurred when starting api service:", err));