// Service Admin lấy dữ liệu thống kê dashboard (top sản phẩm, doanh thu, tổng quan)
import useAuth from "../../Hooks/useAuth";

const API_BASE = "http://localhost:5230/api/DashBoard";

export const useDashboardApi = () => {
  const { ensureTokenValid } = useAuth();

  // ✅ Top 5 sản phẩm bán chạy
  const getTopProducts = async () => {
    const token = await ensureTokenValid();
    if (!token) return null;

    const res = await fetch(`${API_BASE}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) throw new Error("Lỗi khi lấy top sản phẩm");
    return res.json();
  };

// ✅ Trạng thái đơn hàng (không cần truyền from/to date)
const getOrderStatus = async () => {
  const token = await ensureTokenValid();
  if (!token) return null;

  const res = await fetch(`${API_BASE}/order-status-chart`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({}) // hoặc bỏ hoàn toàn nếu backend cho phép
  });

  if (!res.ok) throw new Error("Lỗi khi lấy biểu đồ trạng thái đơn hàng");
  return res.json();
};


  // ✅ Doanh thu theo ngày/tháng/năm
  const getRevenue = async (groupBy = "month", fromDate = null, toDate = null) => {
    const token = await ensureTokenValid();
    if (!token) return null;

    const params = new URLSearchParams({ groupBy });
    if (fromDate) params.append("fromDate", fromDate);
    if (toDate) params.append("toDate", toDate);

    const res = await fetch(`${API_BASE}/revenue-chart?${params.toString()}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) throw new Error("Lỗi khi lấy biểu đồ doanh thu");
    return res.json();
  };

  // ✅ Thống kê tổng quan (tổng doanh thu, tổng đơn hàng, tổng khách hàng)
  const getSummary = async () => {
    const token = await ensureTokenValid();
    if (!token) return null;

    const res = await fetch(`${API_BASE}/summary`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) throw new Error("Lỗi khi lấy dữ liệu tổng quan");
    return res.json();
  };

  return { getTopProducts, getOrderStatus, getRevenue, getSummary };
};
