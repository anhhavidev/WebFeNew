import React, { useEffect, useState } from "react";
import { GetSellerDashboard } from "../Service/Seller/OrderSellerAPI";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer
} from "recharts";
import useAuth from "../Hooks/useAuth";

export default function SellerDashboardChar() {
  const [data, setData] = useState(null);
  const [filter, setFilter] = useState("This Month");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [error, setError] = useState(""); // ✅ lưu thông báo lỗi
  const { ensureTokenValid } = useAuth();

  const fetchData = async () => {
    const token = await ensureTokenValid();
    if (!token) return;

    try {
      const response = await GetSellerDashboard(filter, fromDate, toDate, token);
      if (response.isSuccess) {
        setData(response.data);
        setError(""); // ✅ reset lỗi nếu thành công
      } else {
        setError(response.message || "Có lỗi xảy ra khi tải dữ liệu");
      }
    } catch (err) {
      console.error("Không thể tải dashboard:", err);
      setError("Không thể kết nối tới máy chủ.");
    }
  };

  // ✅ Khi đổi sang Today / This Month thì tự fetch
  useEffect(() => {
    if (filter !== "custom") {
      fetchData();
    }
  }, [filter]);

  if (!data && !error) return <p>Đang tải dữ liệu...</p>;

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold mb-4">📊 Seller Dashboard</h1>

      {/* Bộ lọc thời gian */}
      <div className="flex gap-3 items-center">
        {["Today", "This Month", "custom"].map((f) => (
          <button
            key={f}
            className={`px-4 py-2 rounded-lg border transition ${
              filter === f ? "bg-blue-600 text-white" : "bg-gray-100 hover:bg-gray-200"
            }`}
            onClick={() => setFilter(f)}
          >
            {f === "Today"
              ? "Hôm nay"
              : f === "This Month"
              ? "Tháng này"
              : "Tùy chọn"}
          </button>
        ))}
      </div>

      {/* ✅ Giao diện chọn ngày cho "Tùy chọn" */}
      {filter === "custom" && (
        <div className="flex flex-wrap items-end gap-4 bg-gray-50 border border-gray-200 rounded-lg p-4 mt-4 shadow-sm">
          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-600 mb-1 p-2">
              Từ ngày
            </label>
            <input
              type="date"
              className="border p-2 border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
            />
          </div>
          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-600 mb-1 p-2">
              Đến ngày
            </label>
            <input
              type="date"
              
              className="border  border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
            />
          </div>
          <button
            onClick={() => {
              if (!fromDate || !toDate) {
                setError("Vui lòng chọn đủ cả hai ngày!");
                return;
              }
              fetchData(); // ✅ chỉ gọi khi click "Lọc"
            }}
            className="px-4 py-2  text-white bg-black rounded-lg  transition"
          >
            Lọc
          </button>
        </div>
      )}

      {/* ⚠️ Hiển thị lỗi nếu có */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded mt-3">
          ⚠️ {error}
        </div>
      )}

      {/* Nếu có dữ liệu thì hiển thị dashboard */}
      {data && (
        <>
          {/* Thống kê tổng quan */}
          <div className="grid grid-cols-3 gap-6 mt-6">
            <div className="p-4 bg-green-100 rounded-lg shadow">
              <h3 className="text-sm font-medium text-gray-600">Tổng doanh thu</h3>
              <p className="text-2xl font-bold text-green-700">
                {data.totalRevenue.toLocaleString()} ₫
              </p>
            </div>
            <div className="p-4 bg-blue-100 rounded-lg shadow">
              <h3 className="text-sm font-medium text-gray-600">Tổng đơn hàng</h3>
              <p className="text-2xl font-bold text-blue-700">{data.totalOrders}</p>
            </div>
            <div className="p-4 bg-yellow-100 rounded-lg shadow">
              <h3 className="text-sm font-medium text-gray-600">Đơn thành công</h3>
              <p className="text-2xl font-bold text-yellow-700">
                {data.orderStatusStats.success}
              </p>
            </div>
          </div>

          {/* Biểu đồ doanh thu hàng ngày */}
          <div className="bg-white rounded-lg p-4 shadow mt-6">
            <h2 className="text-lg font-semibold mb-2">📈 Doanh thu theo ngày</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data.dailyRevenue}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="revenue" fill="#4F46E5" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Biểu đồ trạng thái đơn hàng */}
          <div className="bg-white rounded-lg p-4 shadow mt-6">
            <h2 className="text-lg font-semibold mb-2">📦 Trạng thái đơn hàng</h2>
            <ul className="space-y-2">
              <li>✅ Thành công: {data.orderStatusStats.success}</li>
              <li>❌ Thất bại: {data.orderStatusStats.failed}</li>
              <li>🛑 Đã hủy: {data.orderStatusStats.canceled}</li>
            </ul>
          </div>
        </>
      )}
    </div>
  );
}
