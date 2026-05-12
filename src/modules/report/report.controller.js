import ApiResponse from "../../utils/ApiResponse.js";
import reportService from "./report.service.js";

const reportController = {
  async getAdminReports(req, res, next) {
    try {
      const reports = await reportService.getAdminReports(req.query);

      res
        .status(200)
        .json(new ApiResponse(200, "Reports fetched successfully", reports, null));
    } catch (error) {
      next(error);
    }
  }
};

export default reportController;
