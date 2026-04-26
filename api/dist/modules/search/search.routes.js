"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const search_controller_1 = require("./search.controller");
const auth_1 = require("../../middleware/auth");
const router = (0, express_1.Router)();
router.get('/global', auth_1.verifyToken, search_controller_1.globalSearch);
exports.default = router;
