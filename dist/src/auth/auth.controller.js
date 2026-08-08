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
exports.AuthController = void 0;
const common_1 = require("@nestjs/common");
const auth_service_1 = require("./auth.service");
const login_dto_1 = require("./dto/login.dto");
const exchange_ticket_dto_1 = require("./dto/exchange-ticket.dto");
const jwt_auth_guard_1 = require("./jwt-auth.guard");
const sso_service_1 = require("./sso.service");
let AuthController = class AuthController {
    authService;
    ssoService;
    constructor(authService, ssoService) {
        this.authService = authService;
        this.ssoService = ssoService;
    }
    login(dto) {
        return this.authService.login(dto);
    }
    logout() {
        return this.authService.logout();
    }
    me(req) {
        return this.authService.getMe(req.user.userId);
    }
    async ssoStart(returnTo, res) {
        const { authorizeUrl } = await this.ssoService.start(returnTo);
        return res.redirect(302, authorizeUrl);
    }
    async ssoStartJson(returnTo) {
        return this.ssoService.start(returnTo);
    }
    async ssoCallback(code, state, res) {
        const { redirectTo } = await this.ssoService.handleCallback(code, state);
        return res.redirect(302, redirectTo);
    }
    exchangeTicket(dto) {
        return this.ssoService.exchangeTicket(dto.ticket);
    }
};
exports.AuthController = AuthController;
__decorate([
    (0, common_1.Post)('login'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [login_dto_1.LoginDto]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "login", null);
__decorate([
    (0, common_1.Post)('logout'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "logout", null);
__decorate([
    (0, common_1.Get)('me'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "me", null);
__decorate([
    (0, common_1.Get)('sso/start'),
    __param(0, (0, common_1.Query)('returnTo')),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "ssoStart", null);
__decorate([
    (0, common_1.Post)('sso/start'),
    __param(0, (0, common_1.Body)('returnTo')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "ssoStartJson", null);
__decorate([
    (0, common_1.Get)('sso/callback'),
    __param(0, (0, common_1.Query)('code')),
    __param(1, (0, common_1.Query)('state')),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "ssoCallback", null);
__decorate([
    (0, common_1.Post)('sso/exchange'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [exchange_ticket_dto_1.ExchangeTicketDto]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "exchangeTicket", null);
exports.AuthController = AuthController = __decorate([
    (0, common_1.Controller)('auth'),
    __metadata("design:paramtypes", [auth_service_1.AuthService,
        sso_service_1.SsoService])
], AuthController);
//# sourceMappingURL=auth.controller.js.map