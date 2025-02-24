"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateFeatureFlagDto = void 0;
const mapped_types_1 = require("@nestjs/mapped-types");
const create_feature_flag_dto_1 = require("./create-feature-flag.dto");
class UpdateFeatureFlagDto extends (0, mapped_types_1.PartialType)(create_feature_flag_dto_1.CreateFeatureFlagDto) {
}
exports.UpdateFeatureFlagDto = UpdateFeatureFlagDto;
//# sourceMappingURL=update-feature-flag.dto.js.map