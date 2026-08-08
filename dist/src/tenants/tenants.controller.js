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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TenantsController = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const class_validator_1 = require("class-validator");
const tenants_service_1 = require("./tenants.service");
class ProvisionTenantDto {
    externalCustomerId;
    slug;
    name;
    email;
}
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ProvisionTenantDto.prototype, "externalCustomerId", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(1),
    __metadata("design:type", String)
], ProvisionTenantDto.prototype, "slug", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(1),
    __metadata("design:type", String)
], ProvisionTenantDto.prototype, "name", void 0);
__decorate([
    (0, class_validator_1.IsEmail)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], ProvisionTenantDto.prototype, "email", void 0);
let TenantsController = class TenantsController {
    tenantsService;
    config;
    constructor(tenantsService, config) {
        this.tenantsService = tenantsService;
        this.config = config;
    }
    provision(secret, dto) {
        const expected = this.config.get('PROVISIONING_SECRET');
        if (!expected || secret !== expected) {
            throw new common_1.UnauthorizedException('Invalid provisioning secret');
        }
        return this.tenantsService.provision(dto);
    }
};
exports.TenantsController = TenantsController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Headers)('x-provisioning-secret')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, ProvisionTenantDto]),
    __metadata("design:returntype", void 0)
], TenantsController.prototype, "provision", null);
exports.TenantsController = TenantsController = __decorate([
    (0, common_1.Controller)('internal/tenants'),
    __metadata("design:paramtypes", [tenants_service_1.TenantsService,
        config_1.ConfigService])
], TenantsController);
//# sourceMappingURL=tenants.controller.js.map