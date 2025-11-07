import React, { useEffect, useState } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  LineElement,
  PointElement
} from "chart.js";
import { Bar, Pie, Line } from "react-chartjs-2";
import { useDashboardApi } from "../Service/Admin/DashboardApi";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  LineElement,
  PointElement
);

export default function Overview() {
  const { getTopProducts, getOrderStatus, getRevenue, getSummary } = useDashboardApi();
  const [topProducts, setTopProducts] = useState([]);
  const [orderStatus, setOrderStatus] = useState({ items: [] });
  const [revenueChart, setRevenueChart] = useState({ items: [] });
  const [summary, setSummary] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [topData, orderData, sumData, revData] = await Promise.all([
          getTopProducts(),
          getOrderStatus(
            new Date(new Date().setDate(new Date().getDate() - 7)),
            new Date()
          ),
          getSummary(),
          getRevenue("month")
        ]);

        // ✅ Top products
        setTopProducts(topData?.data || []);

        // ✅ Order status
        setOrderStatus(orderData?.data || { items: [] });

        // ✅ Summary
        setSummary(sumData?.data || {});

        // ✅ Revenue chart
        setRevenueChart(revData?.data || { items: [] });
      } catch (err) {
        console.error("Lỗi load dashboard", err);
      }
    };

    fetchData();
  }, []);

  return (
    <div>
      <h3 className="mb-4">📊 Thống kê tổng quan</h3>

      {/* ✅ Card thống kê */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white shadow rounded-2xl p-6 text-center">
          <h4 className="text-gray-500 mb-2">Tổng doanh thu</h4>
          <p className="text-2xl font-bold text-green-600">
            {summary?.totalRevenue?.toLocaleString("vi-VN")} ₫
          </p>
        </div>
        <div className="bg-white shadow rounded-2xl p-6 text-center">
          <h4 className="text-gray-500 mb-2">Tổng số đơn hàng</h4>
          <p className="text-2xl font-bold text-blue-600">{summary?.totalOrders}</p>
        </div>
        <div className="bg-white shadow rounded-2xl p-6 text-center">
          <h4 className="text-gray-500 mb-2">Tổng số khách hàng</h4>
          <p className="text-2xl font-bold text-purple-600">{summary?.totalCustomers}</p>
        </div>
      </div>

      <div className="row">
        {/* ✅ Top 5 sản phẩm bán chạy */}
        <div className="col-md-6 mb-4">
          <div className="card shadow p-3">
            <h5>🔥 Top 5 sản phẩm bán chạy</h5>
            <Bar
              data={{
                labels: topProducts.map(p => p.product?.name || ""),
                datasets: [
                  {
                    label: "Số lượng bán",
                    data: topProducts.map(p => p.totalSell || 0),
                    backgroundColor: "rgba(75, 192, 192, 0.6)"
                  }
                ]
              }}
              options={{ responsive: true, plugins: { legend: { position: "top" } } }}
            />
          </div>
        </div>

        {/* ✅ Trạng thái đơn hàng */}
        <div className="col-md-6 mb-4">
          <div className="card shadow p-3">
            <h5>📦 Trạng thái đơn hàng</h5>
            {orderStatus.items.length > 0 && (
              <Pie
                data={{
                  labels: orderStatus.items.map(i => i.label),
                  datasets: [
                    {
                      label: "Số đơn",
                      data: orderStatus.items.map(i => i.count),
                      backgroundColor: [
                        "#36A2EB",
                        "#FF6384",
                        "#FFCE56",
                        "#4BC0C0",
                        "#9966FF",
                        "#FF9F40",
                        "#C9CBCF",
                        "#8BC34A",
                        "#FF5722",
                        "#9C27B0",
                        "#607D8B"
                      ]
                    }
                  ]
                }}
                options={{ responsive: true, plugins: { legend: { position: "bottom" } } }}
              />
            )}
          </div>
        </div>
      </div>

      {/* ✅ Doanh thu (ví dụ Line chart) */}
      <div className="row mt-6">
        <div className="col-md-12 mb-4">
          <div className="card shadow p-3">
            <h5>💰 Doanh thu theo tháng</h5>
            {revenueChart.items.length > 0 && (
              <Line
                data={{
                  labels: revenueChart.items.map(i => i.label),
                  datasets: [
                    {
                      label: "Doanh thu",
                      data: revenueChart.items.map(i => i.revenue),
                      borderColor: "#36A2EB",
                      backgroundColor: "rgba(54, 162, 235, 0.2)",
                      tension: 0.3
                    }
                  ]
                }}
                options={{ responsive: true, plugins: { legend: { position: "top" } } }}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
