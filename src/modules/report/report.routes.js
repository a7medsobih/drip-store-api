import { Router } from "express";

import adminMiddleware from "../../middlewares/admin.middleware.js";
import authMiddleware from "../../middlewares/auth.middleware.js";
import reportController from "./report.controller.js";

const router = Router();

router.use(authMiddleware);

router.get("/admin", adminMiddleware, reportController.getAdminReports);

export default router;
