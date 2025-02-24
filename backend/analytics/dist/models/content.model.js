"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContentStatus = exports.ContentType = void 0;
var ContentType;
(function (ContentType) {
    ContentType["ARTICLE"] = "article";
    ContentType["PAGE"] = "page";
    ContentType["DOCUMENT"] = "document";
    ContentType["MEDIA"] = "media";
    ContentType["TEMPLATE"] = "template";
})(ContentType || (exports.ContentType = ContentType = {}));
var ContentStatus;
(function (ContentStatus) {
    ContentStatus["DRAFT"] = "draft";
    ContentStatus["REVIEW"] = "review";
    ContentStatus["PUBLISHED"] = "published";
    ContentStatus["ARCHIVED"] = "archived";
})(ContentStatus || (exports.ContentStatus = ContentStatus = {}));
//# sourceMappingURL=content.model.js.map