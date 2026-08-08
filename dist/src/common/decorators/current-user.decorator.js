"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CurrentUser = exports.CurrentTenantId = exports.CurrentUserId = void 0;
const common_1 = require("@nestjs/common");
function getUser(ctx) {
    const request = ctx.switchToHttp().getRequest();
    if (!request.user?.userId) {
        throw new common_1.ForbiddenException('Not authenticated');
    }
    return request.user;
}
exports.CurrentUserId = (0, common_1.createParamDecorator)((_data, ctx) => getUser(ctx).userId);
exports.CurrentTenantId = (0, common_1.createParamDecorator)((_data, ctx) => {
    const tenantId = getUser(ctx).tenantId;
    if (!tenantId) {
        throw new common_1.ForbiddenException('Missing tenant context');
    }
    return tenantId;
});
exports.CurrentUser = (0, common_1.createParamDecorator)((_data, ctx) => getUser(ctx));
//# sourceMappingURL=current-user.decorator.js.map