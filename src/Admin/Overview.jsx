import React, { useEffect, useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  PieChart, Pie, Cell,
  AreaChart, Area
} from "recharts";
import { useDashboardApi } from "../Service/Admin/DashboardApi";
import { FiDollarSign, FiShoppingCart, FiUsers, FiTrendingUp } from "react-icons/fi";
import './AdminDashboard.css';

const PIE_COLORS = [
  "#3b82f6", "#ef4444", "#f59e0b", "#10b981", "#8b5cf6",
  "#f97316", "#6b7280", "#84cc16", "#e11d48", "#7c3aed", "#475569"
];

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
          getOrderStatus(),
          getSummary(),
          getRevenue("month")
        ]);

        setTopProducts(topData?.data || []);
        setOrderStatus(orderData?.data || { items: [] });
        setSummary(sumData?.data || {});
        setRevenueChart(revData?.data || { items: [] });
      } catch (err) {
        console.error("Lỗi load dashboard", err);
      }
    };

    fetchData();
  }, []);

  // Transform data for recharts
  const barData = topProducts.map(p => ({
    name: p.product?.name?.length > 15 ? p.product.name.slice(0, 15) + "..." : (p.product?.name || ""),
    "Số lượng bán": p.totalSell || 0
  }));

  const pieData = orderStatus.items.map((item, idx) => ({
    name: item.label,
    value: item.count,
    color: PIE_COLORS[idx % PIE_COLORS.length]
  }));

  const areaData = revenueChart.items.map(item => ({
    name: item.label,
    "Doanh thu": item.revenue
  }));

  return (
    <div>
      <h2 className="page-title">📊 Tổng quan</h2>
      <p className="page-subtitle">Chào mừng trở lại! Đây là tình hình hoạt động hôm nay.</p>

      {/* Stats Cards — 4 columns */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-card-header">
            <div>
              <p className="stat-card-title">Tổng doanh thu</p>
              <p className="stat-card-value">
                {summary?.totalRevenue?.toLocaleString("vi-VN") || "0"} ₫
              </p>
              <div className="stat-card-trend up">
                ↑ 12.5% <span>so với tháng trước</span>
              </div>
            </div>
            <div className="stat-card-icon blue">
              <FiDollarSign />
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <div>
              <p className="stat-card-title">Tổng đơn hàng</p>
              <p className="stat-card-value">
                {summary?.totalOrders?.toLocaleString("vi-VN") || "0"}
              </p>
              <div className="stat-card-trend up">
                ↑ 8.2% <span>so với tháng trước</span>
              </div>
            </div>
            <div className="stat-card-icon green">
              <FiShoppingCart />
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <div>
              <p className="stat-card-title">Tổng khách hàng</p>
              <p className="stat-card-value">
                {summary?.totalCustomers?.toLocaleString("vi-VN") || "0"}
              </p>
              <div className="stat-card-trend up">
                ↑ 15.3% <span>so với tháng trước</span>
              </div>
            </div>
            <div className="stat-card-icon purple">
              <FiUsers />
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <div>
              <p className="stat-card-title">Tỷ lệ tăng trưởng</p>
              <p className="stat-card-value">23.4%</p>
              <div className="stat-card-trend down">
                ↓ 3.1% <span>so với tháng trước</span>
              </div>
            </div>
            <div className="stat-card-icon orange">
              <FiTrendingUp />
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row 1: Bar + Pie */}
      <div className="charts-grid">
        {/* Top 5 Products Bar Chart */}
        <div className="chart-card">
          <h3 className="chart-card-title">🔥 Top 5 sản phẩm bán chạy</h3>
          <p className="chart-card-subtitle">Sản phẩm có doanh số cao nhất</p>
          {barData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="name" stroke="#6b7280" tick={{ fontSize: 12 }} />
                <YAxis stroke="#6b7280" tick={{ fontSize: 12 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '0.85rem'
                  }}
                />
                <Bar
                  dataKey="Số lượng bán"
                  fill="#3b82f6"
                  radius={[6, 6, 0, 0]}
                  maxBarSize={50}
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="chart-empty">
              Chưa có dữ liệu
            </div>
          )}
        </div>

        {/* Order Status Pie Chart */}
        <div className="chart-card">
          <h3 className="chart-card-title">📦 Trạng thái đơn hàng</h3>
          <p className="chart-card-subtitle">Phân bổ theo trạng thái</p>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={3}
                  dataKey="value"
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                  labelLine={{ stroke: '#9ca3af' }}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '0.85rem'
                  }}
                />
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  iconType="circle"
                  iconSize={8}
                  wrapperStyle={{ fontSize: '0.8rem', color: '#6b7280' }}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="chart-empty">
              Chưa có dữ liệu
            </div>
          )}
        </div>
      </div>

      {/* Revenue Area Chart — Full Width */}
      <div className="charts-grid">
        <div className="chart-card chart-card-full">
          <h3 className="chart-card-title">💰 Doanh thu theo tháng</h3>
          <p className="chart-card-subtitle">Tổng quan doanh thu theo thời gian</p>
          {areaData.length > 0 ? (
            <ResponsiveContainer width="100%" height={350}>
              <AreaChart data={areaData}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="name" stroke="#6b7280" tick={{ fontSize: 12 }} />
                <YAxis stroke="#6b7280" tick={{ fontSize: 12 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '0.85rem'
                  }}
                  formatter={(value) => [value?.toLocaleString("vi-VN") + " ₫", "Doanh thu"]}
                />
                <Area
                  type="monotone"
                  dataKey="Doanh thu"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  fill="url(#colorRevenue)"
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="chart-empty" style={{ height: 350 }}>
              Chưa có dữ liệu
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
