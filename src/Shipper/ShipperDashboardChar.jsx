import { useState, useEffect } from "react";
import { GetShipperDashboard } from "../Service/Shipper/OrderShipperApi";
import useAuth from "../Hooks/useAuth";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  CartesianGrid, ResponsiveContainer, Legend
} from "recharts";
import dayjs from "dayjs";
import {
  FiPackage, FiCheckCircle, FiXCircle,
  FiTruck, FiSearch, FiAlertCircle
} from "react-icons/fi";
import "./ShipperDashboard.css";

const ShipperTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  const COLOR_MAP = { "Thành công": "#10b981", "Thất bại": "#ef4444", "Đang giao": "#f59e0b" };
  return (
    <div className="sh-tooltip">
      <div className="sh-tooltip-date">{dayjs(label).format("DD/MM/YYYY")}</div>
      {payload.map((p, i) => (
        <div key={i} className="sh-tooltip-row">
          <span className="sh-tooltip-dot" style={{ background: COLOR_MAP[p.name] || p.color }} />
          <span className="sh-tooltip-name">{p.name}:</span>
          <strong>{p.value}</strong>
        </div>
      ))}
    </div>
  );
};

export default function ShipperDashboardChart() {
  const { ensureTokenValid } = useAuth();
  const [from, setFrom]       = useState(dayjs().subtract(7, "day").format("YYYY-MM-DD"));
  const [to, setTo]           = useState(dayjs().format("YYYY-MM-DD"));
  const [data, setData]       = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");

  const loadDashboard = async () => {
    try {
      setLoading(true); setError("");
      const token = await ensureTokenValid();
      const res   = await GetShipperDashboard(from, to, token);
      if (res.isSuccess) {
        setData(res.data.dailyStats || []);
        setSummary({
          total:    res.data.totalOrders   ?? 0,
          success:  res.data.totalSuccess  ?? 0,
          failed:   res.data.totalFailed   ?? 0,
          shipping: res.data.totalShipping ?? 0,
        });
      } else { setError(res.message || "Không thể tải dữ liệu"); }
    } catch { setError("Lỗi khi tải dashboard"); }
    finally { setLoading(false); }
  };

  useEffect(() => { loadDashboard(); }, []);

  const successRate = summary && summary.total > 0
    ? Math.round((summary.success / summary.total) * 100) : 0;

  const STATS = summary ? [
    { label: "Tổng đơn",    value: summary.total,    Icon: FiPackage,     accent: "#6366f1", light: "#eef2ff" },
    { label: "Thành công",  value: summary.success,  Icon: FiCheckCircle, accent: "#10b981", light: "#d1fae5" },
    { label: "Thất bại",    value: summary.failed,   Icon: FiXCircle,     accent: "#ef4444", light: "#fee2e2" },
    { label: "Đang giao",   value: summary.shipping, Icon: FiTruck,       accent: "#f59e0b", light: "#fef3c7" },
  ] : [];

  return (
    <div className="sh-page">

      {/* ── Header ── */}
      <div className="sh-header">
        <div>
          <h2 className="sh-title">Tổng quan Giao Hàng</h2>
          <p className="sh-sub">Thống kê hiệu suất giao hàng theo khoảng thời gian</p>
        </div>
        {summary && (
          <div className="sh-rate-card">
            <div className="sh-rate-ring">
              <svg viewBox="0 0 36 36" className="sh-ring-svg">
                <path className="sh-ring-bg"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                <path className="sh-ring-fill" stroke="#10b981"
                  strokeDasharray={`${successRate}, 100`}
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                <text x="18" y="20.35" className="sh-ring-text">{successRate}%</text>
              </svg>
            </div>
            <div className="sh-rate-info">
              <div className="sh-rate-label">Tỷ lệ thành công</div>
              <div className="sh-rate-sub">{summary.success}/{summary.total} đơn</div>
            </div>
          </div>
        )}
      </div>

      {/* ── Filter bar ── */}
      <div className="sh-filterbar">
        <div className="sh-date-group">
          <label>Từ ngày</label>
          <input type="date" value={from}
            onChange={e => setFrom(e.target.value)}
            className="sh-date-input" />
        </div>
        <span className="sh-date-arrow">→</span>
        <div className="sh-date-group">
          <label>Đến ngày</label>
          <input type="date" value={to}
            onChange={e => setTo(e.target.value)}
            className="sh-date-input" />
        </div>
        <button onClick={loadDashboard} className="sh-search-btn" disabled={loading}>
          {loading
            ? <><span className="sh-spin" /> Đang tải...</>
            : <><FiSearch size={14} /> Xem thống kê</>
          }
        </button>
      </div>

      {/* ── Error ── */}
      {error && (
        <div className="sh-error"><FiAlertCircle size={15} />{error}</div>
      )}

      {/* ── Stat cards ── */}
      {!loading && summary && (
        <div className="sh-stats">
          {STATS.map(({ label, value, Icon, accent, light }, i) => (
            <div key={i} className="sh-stat-card">
              <div className="sh-stat-icon" style={{ background: light, color: accent }}>
                <Icon size={20} />
              </div>
              <div className="sh-stat-value" style={{ color: accent }}>{value}</div>
              <div className="sh-stat-label">{label}</div>
              {label === "Thành công" && (
                <div className="sh-stat-bar-track">
                  <div className="sh-stat-bar-fill"
                    style={{ width: `${successRate}%`, background: accent }} />
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* ── Bar chart ── */}
      <div className="sh-chart-card">
        <div className="sh-chart-head">
          <span className="sh-chart-title">Thống kê giao hàng theo ngày</span>
          {data.length > 0 && (
            <span className="sh-chart-badge">{data.length} ngày</span>
          )}
        </div>

        {loading ? (
          <div className="sh-chart-loading">
            <span className="sh-spin-lg" /> Đang tải dữ liệu...
          </div>
        ) : data.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }} barGap={3}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="date"
                tickFormatter={d => dayjs(d).format("DD/MM")}
                tick={{ fontSize: 11, fill: "#94a3b8" }}
                axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip content={<ShipperTooltip />} cursor={{ fill: "#f8fafc" }} />
              <Legend
                wrapperStyle={{ fontSize: "12px", paddingTop: "14px" }}
                iconType="circle" iconSize={8} />
              <Bar dataKey="successCount"  name="Thành công" fill="#10b981" radius={[5,5,0,0]} maxBarSize={28} />
              <Bar dataKey="failedCount"   name="Thất bại"   fill="#ef4444" radius={[5,5,0,0]} maxBarSize={28} />
              <Bar dataKey="shippingCount" name="Đang giao"  fill="#f59e0b" radius={[5,5,0,0]} maxBarSize={28} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="sh-chart-empty">
            <FiTruck size={32} color="#cbd5e1" />
            <p>Không có dữ liệu trong khoảng thời gian này</p>
          </div>
        )}
      </div>
    </div>
  );
}
