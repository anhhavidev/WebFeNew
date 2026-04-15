import React, { useEffect, useState } from "react";
import { GetSellerDashboard } from "../Service/Seller/OrderSellerAPI";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  CartesianGrid, ResponsiveContainer, Cell
} from "recharts";
import useAuth from "../Hooks/useAuth";
import {
  FiTrendingUp, FiShoppingBag, FiCheckCircle,
  FiCalendar, FiSun, FiSliders, FiSearch, FiAlertCircle
} from "react-icons/fi";
import "./SellerDashboard.css";

const FILTER_OPTIONS = [
  { key: "Today",      label: "Hôm nay",   Icon: FiSun      },
  { key: "This Month", label: "Tháng này",  Icon: FiCalendar },
  { key: "custom",     label: "Tùy chọn",   Icon: FiSliders  },
];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="s-tooltip">
        <div className="s-tooltip-date">{label}</div>
        <div className="s-tooltip-val">
          {Number(payload[0].value).toLocaleString("vi-VN")} ₫
        </div>
      </div>
    );
  }
  return null;
};

export default function SellerDashboardChar() {
  const [data, setData]         = useState(null);
  const [filter, setFilter]     = useState("This Month");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate]     = useState("");
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);
  const { ensureTokenValid }    = useAuth();

  const fetchData = async () => {
    const token = await ensureTokenValid();
    if (!token) return;
    setLoading(true);
    try {
      const res = await GetSellerDashboard(filter, fromDate, toDate, token);
      if (res.isSuccess) { setData(res.data); setError(""); }
      else setError(res.message || "Có lỗi khi tải dữ liệu");
    } catch {
      setError("Không thể kết nối máy chủ.");
    } finally { setLoading(false); }
  };

  useEffect(() => { if (filter !== "custom") fetchData(); }, [filter]);

  const barData   = data?.dailyRevenue || [];
  const maxRev    = Math.max(...barData.map(d => d.revenue || 0), 1);

  const stats = [
    {
      label : "Tổng doanh thu",
      value : data ? data.totalRevenue.toLocaleString("vi-VN") + " ₫" : "—",
      Icon  : FiTrendingUp,
      accent: "#6366f1",
      light : "#eef2ff",
    },
    {
      label : "Tổng đơn hàng",
      value : data?.totalOrders ?? "—",
      Icon  : FiShoppingBag,
      accent: "#0ea5e9",
      light : "#e0f2fe",
    },
    {
      label : "Đơn thành công",
      value : data?.orderStatusStats?.success ?? "—",
      Icon  : FiCheckCircle,
      accent: "#10b981",
      light : "#d1fae5",
    },
  ];

  const statusList = data ? [
    { label: "Thành công", v: data.orderStatusStats?.success  ?? 0, color: "#10b981" },
    { label: "Thất bại",   v: data.orderStatusStats?.failed   ?? 0, color: "#ef4444" },
    { label: "Đã hủy",     v: data.orderStatusStats?.canceled ?? 0, color: "#f59e0b" },
  ] : [];
  const totalStatus = statusList.reduce((s, x) => s + x.v, 0) || 1;

  return (
    <div className="s-page">

      {/* ── Header ── */}
      <div className="s-header">
        <div>
          <h2 className="s-title">Tổng quan Cửa hàng</h2>
          <p className="s-sub">Theo dõi hiệu suất kinh doanh theo thời gian thực</p>
        </div>

        {/* Filter pills */}
        <div className="s-pills">
          {FILTER_OPTIONS.map(({ key, label, Icon }) => (
            <button
              key={key}
              id={`seller-filter-${key}`}
              className={`s-pill ${filter === key ? "active" : ""}`}
              onClick={() => setFilter(key)}
            >
              <Icon size={14} />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Custom date picker ── */}
      {filter === "custom" && (
        <div className="s-datebar">
          <div className="s-date-group">
            <label>Từ ngày</label>
            <input type="date" value={fromDate}
              onChange={e => setFromDate(e.target.value)}
              className="s-date-input" />
          </div>
          <div className="s-date-sep">→</div>
          <div className="s-date-group">
            <label>Đến ngày</label>
            <input type="date" value={toDate}
              onChange={e => setToDate(e.target.value)}
              className="s-date-input" />
          </div>
          <button className="s-apply-btn" onClick={() => {
            if (!fromDate || !toDate) { setError("Vui lòng chọn đủ hai ngày!"); return; }
            fetchData();
          }}>
            <FiSearch size={14} /> Lọc
          </button>
        </div>
      )}

      {/* ── Error ── */}
      {error && (
        <div className="s-error">
          <FiAlertCircle size={16} /> {error}
        </div>
      )}

      {/* ── Loading ── */}
      {loading && (
        <div className="s-loading"><span className="s-spinner" /> Đang tải dữ liệu...</div>
      )}

      {/* ── Stats cards ── */}
      {!loading && (
        <div className="s-stats">
          {stats.map(({ label, value, Icon, accent, light }, i) => (
            <div key={i} className="s-stat-card">
              <div className="s-stat-icon-wrap" style={{ background: light, color: accent }}>
                <Icon size={20} />
              </div>
              <div className="s-stat-body">
                <span className="s-stat-label">{label}</span>
                <span className="s-stat-value">{value}</span>
              </div>
              <div className="s-stat-accent-bar" style={{ background: accent }} />
            </div>
          ))}
        </div>
      )}

      {/* ── Revenue Bar Chart ── */}
      {data && !loading && (
        <>
          <div className="s-card">
            <div className="s-card-head">
              <span className="s-card-title">Doanh thu theo ngày</span>
              <span className="s-card-badge" style={{ color: "#6366f1", background: "#eef2ff" }}>
                {barData.length} ngày
              </span>
            </div>
            {barData.length > 0 ? (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={barData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#94a3b8" }}
                    axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false}
                    tickFormatter={v => v >= 1e6 ? `${(v/1e6).toFixed(1)}M` : v >= 1e3 ? `${(v/1e3).toFixed(0)}K` : v} />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: "#f8fafc" }} />
                  <Bar dataKey="revenue" radius={[6, 6, 0, 0]} maxBarSize={44}>
                    {barData.map((entry, i) => {
                      const ratio = entry.revenue / maxRev;
                      const fill  = ratio > 0.75 ? "#6366f1"
                                  : ratio > 0.4  ? "#818cf8"
                                  :                "#c7d2fe";
                      return <Cell key={i} fill={fill} />;
                    })}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="s-empty">Chưa có dữ liệu doanh thu</div>
            )}
          </div>

          {/* ── Order status card ── */}
          <div className="s-card">
            <div className="s-card-head">
              <span className="s-card-title">Trạng thái đơn hàng</span>
              <span className="s-card-badge" style={{ color: "#10b981", background: "#d1fae5" }}>
                Tổng: {totalStatus}
              </span>
            </div>
            <div className="s-status-list">
              {statusList.map((item, i) => {
                const pct = Math.round((item.v / totalStatus) * 100);
                return (
                  <div key={i} className="s-status-row">
                    <div className="s-status-meta">
                      <span className="s-status-dot" style={{ background: item.color }} />
                      <span className="s-status-name">{item.label}</span>
                      <span className="s-status-pct">{pct}%</span>
                    </div>
                    <div className="s-bar-track">
                      <div className="s-bar-fill"
                        style={{ width: `${pct}%`, background: item.color }} />
                    </div>
                    <span className="s-status-num" style={{ color: item.color }}>{item.v}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
