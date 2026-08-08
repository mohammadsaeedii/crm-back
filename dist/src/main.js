"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const app_module_1 = require("./app.module");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    const config = app.get(config_1.ConfigService);
    const rootDomain = config.get('ROOT_DOMAIN', 'localhost');
    const corsOrigins = config.get('CORS_ORIGINS', '');
    app.enableCors({
        origin: (origin, callback) => {
            if (!origin) {
                callback(null, true);
                return;
            }
            if (corsOrigins === '*') {
                callback(null, true);
                return;
            }
            if (corsOrigins) {
                const allowed = corsOrigins.split(',').map((o) => o.trim());
                if (allowed.includes(origin)) {
                    callback(null, true);
                    return;
                }
            }
            try {
                const { hostname } = new URL(origin);
                if (hostname === rootDomain ||
                    hostname === `www.${rootDomain}` ||
                    hostname.endsWith(`.${rootDomain}`) ||
                    hostname === 'localhost' ||
                    hostname.endsWith('.localhost')) {
                    callback(null, true);
                    return;
                }
            }
            catch {
            }
            callback(new Error(`CORS blocked for origin: ${origin}`), false);
        },
        credentials: true,
    });
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
    }));
    const port = config.get('PORT', 3001);
    await app.listen(port);
    console.log(`API listening on port ${port}`);
}
bootstrap();
//# sourceMappingURL=main.js.map