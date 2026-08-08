"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TenantHostGuard = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const tenants_service_1 = require("./tenants.service");
let TenantHostGuard = class TenantHostGuard {
    tenantsService;
    config;
    constructor(tenantsService, config) {
        this.tenantsService = tenantsService;
        this.config = config;
    }
    async canActivate(context) {
        const request = context.switchToHttp().getRequest();
        const rootDomain = this.config.get('ROOT_DOMAIN', 'localhost');
        const host = request.headers['x-forwarded-host'] ||
            request.headers.host;
        await this.tenantsService.assertHostMatchesTenant(host, request.user?.slug, rootDomain);
        return true;
    }
};
exports.TenantHostGuard = TenantHostGuard;
exports.TenantHostGuard = TenantHostGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [tenants_service_1.TenantsService,
        config_1.ConfigService])
], TenantHostGuard);
//# sourceMappingURL=tenant-host.guard.js.map