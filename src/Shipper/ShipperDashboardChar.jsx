import { useState, useEffect } from "react";
import { GetShipperDashboard } from "../Service/Shipper/OrderShipperApi";
import useAuth from "../Hooks/useAuth";
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid, ResponsiveContainer } from "recharts";
import dayjs from "dayjs";

export default function ShipperDashboardChar() {
  const { ensureTokenValid } = useAuth();
  const [from, setFrom] = useState(dayjs().subtract(7, "day").format("YYYY-MM-DD"));
  const [to, setTo] = useState(dayjs().format("YYYY-MM-DD"));
  const [data, setData] = useState([]);
  const [summary, setSummary] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const token = await ensureTokenValid();
      const res = await GetShipperDashboard(from, to, token);

      if (res.isSuccess) {
        setData(res.data.dailyStats);
        setSummary({
          total: res.data.totalOrders,
          success: res.data.totalSuccess,
          failed: res.data.totalFailed,
          shipping: res.data.totalShipping,
        });
      } else {
        setError(res.message || "Không thể tải dữ liệu");
      }
    } catch (err) {
      setError("Lỗi khi tải dashboard");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold mb-6">📊 Dashboard Shipper</h1>

      {/* Bộ lọc thời gian */}
      <div className="flex gap-3 mb-6">
        <input
          type="date"
          value={from}
          onChange={(e) => setFrom(e.target.value)}
          className="border p-2 rounded"
        />
        <input
          type="date"
          value={to}
          onChange={(e) => setTo(e.target.value)}
          className="border p-2 rounded"
        />
        <button
          onClick={loadDashboard}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          🔍 Xem thống kê
        </button>
      </div>

      {/* Tổng quan */}
      {summary && (
        <div className="grid grid-cols-4 gap-4 mb-8">
          <div className="bg-white shadow p-4 rounded text-center">
            <p className="text-gray-500">Tổng đơn</p>
            <h2 className="text-xl font-semibold">{summary.total}</h2>
          </div>
          <div className="bg-green-100 shadow p-4 rounded text-center">
            <p className="text-gray-500">Thành công</p>
            <h2 className="text-xl font-semibold text-green-700">{summary.success}</h2>
          </div>
          <div className="bg-red-100 shadow p-4 rounded text-center">
            <p className="text-gray-500">Thất bại</p>
            <h2 className="text-xl font-semibold text-red-700">{summary.failed}</h2>
          </div>
          <div className="bg-yellow-100 shadow p-4 rounded text-center">
            <p className="text-gray-500">Đang giao</p>
            <h2 className="text-xl font-semibold text-yellow-700">{summary.shipping}</h2>
          </div>
        </div>
      )}

      {/* Biểu đồ */}
      {loading ? (
        <p>⏳ Đang tải dữ liệu...</p>
      ) : error ? (
        <p className="text-red-600">{error}</p>
      ) : (
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" tickFormatter={(d) => dayjs(d).format("DD/MM")} />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="successCount" fill="#22c55e" name="Thành công" />
            <Bar dataKey="failedCount" fill="#ef4444" name="Thất bại" />
            <Bar dataKey="shippingCount" fill="#eab308" name="Đang giao" />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
