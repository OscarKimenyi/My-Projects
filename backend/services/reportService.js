import { reportService } from "../services/api";

// In your component
const fetchReports = async () => {
  try {
    const revenueData = await reportService.getRevenue({
      start_date: "2024-01-01",
      end_date: "2024-01-31",
    });
    console.log(revenueData.data);
  } catch (error) {
    console.error("Error fetching reports:", error);
  }
};
