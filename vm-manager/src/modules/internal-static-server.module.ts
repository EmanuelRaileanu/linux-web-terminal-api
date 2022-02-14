import { Module } from "@nestjs/common";
import { ServeStaticModule } from "@nestjs/serve-static";

@Module({
    imports: [
        ServeStaticModule.forRoot({
            rootPath: __dirname + "/../../../../public"
        })
    ]
})
export class InternalStaticServerModule {}