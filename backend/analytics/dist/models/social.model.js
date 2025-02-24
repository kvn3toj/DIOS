"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReactionType = exports.ActivityType = exports.ConnectionStatus = void 0;
var ConnectionStatus;
(function (ConnectionStatus) {
    ConnectionStatus["PENDING"] = "pending";
    ConnectionStatus["ACCEPTED"] = "accepted";
    ConnectionStatus["BLOCKED"] = "blocked";
})(ConnectionStatus || (exports.ConnectionStatus = ConnectionStatus = {}));
var ActivityType;
(function (ActivityType) {
    ActivityType["FOLLOW"] = "follow";
    ActivityType["COMMENT"] = "comment";
    ActivityType["REACTION"] = "reaction";
    ActivityType["SHARE"] = "share";
    ActivityType["ACHIEVEMENT"] = "achievement";
})(ActivityType || (exports.ActivityType = ActivityType = {}));
var ReactionType;
(function (ReactionType) {
    ReactionType["LIKE"] = "like";
    ReactionType["LOVE"] = "love";
    ReactionType["CELEBRATE"] = "celebrate";
    ReactionType["SUPPORT"] = "support";
    ReactionType["INSIGHTFUL"] = "insightful";
})(ReactionType || (exports.ReactionType = ReactionType = {}));
//# sourceMappingURL=social.model.js.map