"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RequirePermission = exports.PERMISSION_KEY = void 0;
const common_1 = require("@nestjs/common");
exports.PERMISSION_KEY = 'permission';
const RequirePermission = (options) => (0, common_1.SetMetadata)(exports.PERMISSION_KEY, options);
exports.RequirePermission = RequirePermission;
//# sourceMappingURL=require-permission.decorator.js.map