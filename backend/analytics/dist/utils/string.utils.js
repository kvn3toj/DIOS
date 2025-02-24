"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.slugify = slugify;
function slugify(text) {
    return text
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .replace(/-+/g, '-');
}
//# sourceMappingURL=string.utils.js.map