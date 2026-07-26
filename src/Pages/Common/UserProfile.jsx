import React, { useEffect, useState } from "react";
import useAuth from "../../Hooks/useAuth";
import { updateProfile, changePassword } from "../../Service/userApi";
import toast from "react-hot-toast";
import { ROUTES } from "../../constants/routePaths";
import { useNavigate } from "react-router-dom";
import "./CustomerPages.css";

export default function UserProfile() {
  const { user, ensureTokenValid, getProfile } = useAuth();
  const navigate = useNavigate();
  const [showEdit, setShowEdit] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [formData, setFormData] = useState({});
  const [passData, setPassData] = useState({ oldPassword: "", newPassword: "", confirmNewPass: "" });
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const token = await ensureTokenValid();
      if (token && !user) {
        await getProfile(token);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const { OrderApi } = await import("../../Service/OrderAPI");
        const data = await OrderApi(1, 3, null);
        setOrders(data.data?.items || []);
      } catch (_) {}
    };
    if (user) fetchOrders();
  }, [user]);

  if (!user) return (
    <div className="ed-page" style={{ textAlign: 'center', padding: '80px 0' }}>
      <p style={{ fontSize: 14, color: 'rgba(26,26,26,0.5)' }}>Đang tải thông tin...</p>
    </div>
  );

  const handleEdit = () => {
    setFormData({
      fullName: user.fullName || "",
      phone: user.phone || "",
      address: user.address || "",
      gender: user.gender ?? "",
      dateOfBirth: user.dateOfBirth ? user.dateOfBirth.split("T")[0] : "",
    });
    setShowEdit(true);
  };

  const saveEdit = async () => {
    const token = await ensureTokenValid();
    try {
      await updateProfile(token, formData);
      toast.success("Cập nhật thành công");
      setShowEdit(false);
      await getProfile(token);
    } catch (err) {
      toast.error("Cập nhật thất bại");
    }
  };

  const savePassword = async () => {
    const token = await ensureTokenValid();
    try {
      const res = await changePassword(token, passData);
      const result = res.data;
      if (result.isSuccess) {
        toast.success(result.message || "Đổi mật khẩu thành công");
        setShowPass(false);
      } else {
        toast.error(result.message || "Đổi mật khẩu thất bại");
      }
    } catch (err) {
      const msg = err.response?.data?.message || "Lỗi hệ thống khi đổi mật khẩu";
      toast.error(msg);
    }
  };

  const genderLabel = user.gender === true ? "Nam" : user.gender === false ? "Nữ" : "Chưa cập nhật";
  const completedOrders = orders.filter(o => o.status === "Delivered" || o.status === "Received").length;

  return (
    <div className="ed-page">
      <div className="ed-account-layout">
        {/* Header */}
        <div className="ed-account-header">
          <div>
            <span className="ed-account-subtitle">Tài khoản AURA</span>
            <h1 className="ed-account-title">Thông Tin Tài Khoản</h1>
          </div>
          <div className="ed-account-header-actions">
            <button className="ed-account-pill" onClick={() => navigate(ROUTES.MY_ORDERS)}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4zM3 6h18M16 10a4 4 0 01-8 0"/></svg>
              Đơn hàng của tôi ({orders.length})
            </button>
          </div>
        </div>

        {/* Banner Card */}
        <div className="ed-account-banner">
          <div className="ed-account-avatar">
            {user.avatarUrl ? (
              <img src={user.avatarUrl} alt={user.fullName} referrerPolicy="no-referrer" />
            ) : (
              <div className="ed-account-avatar-fallback">{(user.fullName || "U").charAt(0)}</div>
            )}
            <button className="ed-account-avatar-edit" onClick={handleEdit} title="Đổi ảnh đại diện">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/><circle cx="12" cy="13" r="4"/></svg>
            </button>
          </div>
          <div className="ed-account-banner-info">
            <div className="ed-account-banner-name-row">
              <h2 className="ed-account-banner-name">{user.fullName}</h2>
              <span className="ed-account-badge ed-account-badge-active">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                Đã kích hoạt
              </span>
              <span className="ed-account-badge ed-account-badge-role">{user.role || "Customer"}</span>
            </div>
            <p className="ed-account-banner-meta">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
              {user.email}
              <span className="ed-account-banner-dot">•</span>
              Tham gia từ {user.createdAt ? new Date(user.createdAt).toLocaleDateString("vi-VN") : "..."}
            </p>
            <div className="ed-account-metrics">
              <div className="ed-account-metric">
                <span className="ed-account-metric-value">{orders.length}</span>
                <span className="ed-account-metric-label">Đơn hàng</span>
              </div>
              <div className="ed-account-metric">
                <span className="ed-account-metric-value ed-account-metric-green">{completedOrders}</span>
                <span className="ed-account-metric-label">Hoàn thành</span>
              </div>
            </div>
          </div>
        </div>

        {/* Detail Table */}
        <div className="ed-account-card">
          <div className="ed-account-card-header">
            <h3>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              Chi Tiết Hồ Sơ Cá Nhân
            </h3>
            <div className="ed-account-card-actions">
              <button className="ed-btn-account-edit" onClick={handleEdit}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                Cập nhật thông tin
              </button>
              <button className="ed-btn-account-password" onClick={() => { setPassData({ oldPassword: "", newPassword: "", confirmNewPass: "" }); setShowPass(true); }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>
                Đổi mật khẩu
              </button>
            </div>
          </div>
          <div className="ed-account-table">
            <div className="ed-account-row"><span className="ed-account-row-label">Họ tên:</span><span>{user.fullName}</span></div>
            <div className="ed-account-row"><span className="ed-account-row-label">Email:</span><span>{user.email}</span></div>
            <div className="ed-account-row"><span className="ed-account-row-label">Số điện thoại:</span><span>{user.phone || <span className="ed-account-na">Chưa cập nhật</span>}</span></div>
            <div className="ed-account-row"><span className="ed-account-row-label">Địa chỉ:</span><span>{user.address || <span className="ed-account-na">Chưa cập nhật</span>}</span></div>
            <div className="ed-account-row"><span className="ed-account-row-label">Ngày sinh:</span><span>{user.dateOfBirth ? new Date(user.dateOfBirth).toLocaleDateString("vi-VN") : <span className="ed-account-na">Chưa cập nhật</span>}</span></div>
            <div className="ed-account-row"><span className="ed-account-row-label">Giới tính:</span><span>{genderLabel}</span></div>
            <div className="ed-account-row"><span className="ed-account-row-label">Trạng thái:</span><span className="ed-account-badge ed-account-badge-active">Đã kích hoạt</span></div>
            <div className="ed-account-row"><span className="ed-account-row-label">Vai trò:</span><span className="ed-account-role-text">{user.role || "Customer"}</span></div>
            <div className="ed-account-row"><span className="ed-account-row-label">Ngày tạo:</span><span>{user.createdAt ? new Date(user.createdAt).toLocaleDateString("vi-VN") : "..."}</span></div>
          </div>
        </div>

        {/* Recent Orders */}
        <div className="ed-account-card">
          <div className="ed-account-card-header">
            <h3>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4zM3 6h18M16 10a4 4 0 01-8 0"/></svg>
              Đơn Hàng Gần Đây
            </h3>
            {orders.length > 0 && (
              <button className="ed-account-view-all" onClick={() => navigate(ROUTES.MY_ORDERS)}>
                Xem tất cả ({orders.length})
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </button>
            )}
          </div>
          {orders.length === 0 ? (
            <p className="ed-account-empty">Bạn chưa có đơn hàng nào.</p>
          ) : (
            <div className="ed-account-recent-orders">
              {orders.slice(0, 2).map(order => (
                <div key={order.orderId} className="ed-account-recent-order" onClick={() => navigate(ROUTES.MY_ORDERS)}>
                  <div>
                    <p className="ed-account-recent-order-id">#{order.parentOrderId || order.orderId} <span className="ed-account-recent-order-date">• {new Date(order.orderDate).toLocaleDateString("vi-VN")}</span></p>
                    <p className="ed-account-recent-order-items">{order.items ? order.items.length : 0} sản phẩm</p>
                  </div>
                  <div className="ed-account-recent-order-right">
                    <span className="ed-account-recent-order-total">{order.totalAmount.toLocaleString()}₫</span>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6"/></svg>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Edit Profile Modal */}
      {showEdit && (
        <div className="ed-modal-overlay">
          <div className="ed-modal">
            <div className="ed-modal-header">
              <h3>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                Cập Nhật Thông Tin Cá Nhân
              </h3>
              <button className="ed-modal-close" onClick={() => setShowEdit(false)}>✕</button>
            </div>
            <form className="ed-modal-form" onSubmit={e => { e.preventDefault(); saveEdit(); }}>
              <div>
                <label>Họ và tên *</label>
                <input type="text" required value={formData.fullName || ""} onChange={e => setFormData({ ...formData, fullName: e.target.value })} />
              </div>
              <div className="ed-modal-row">
                <div>
                  <label>Email</label>
                  <input type="email" value={user.email || ""} disabled />
                </div>
                <div>
                  <label>Số điện thoại</label>
                  <input type="tel" value={formData.phone || ""} onChange={e => setFormData({ ...formData, phone: e.target.value })} />
                </div>
              </div>
              <div>
                <label>Địa chỉ chi tiết</label>
                <input type="text" placeholder="Số nhà, tên đường..." value={formData.address || ""} onChange={e => setFormData({ ...formData, address: e.target.value })} />
              </div>
              <div className="ed-modal-row">
                <div>
                  <label>Ngày sinh</label>
                  <input type="date" value={formData.dateOfBirth || ""} onChange={e => setFormData({ ...formData, dateOfBirth: e.target.value || null })} />
                </div>
                <div>
                  <label>Giới tính</label>
                  <select value={formData.gender === true ? "true" : formData.gender === false ? "false" : ""} onChange={e => { const v = e.target.value; setFormData({ ...formData, gender: v === "" ? null : v === "true" }); }}>
                    <option value="">Chọn</option>
                    <option value="true">Nam</option>
                    <option value="false">Nữ</option>
                  </select>
                </div>
              </div>
              <div className="ed-modal-actions">
                <button type="button" className="ed-btn-modal-cancel" onClick={() => setShowEdit(false)}>Hủy</button>
                <button type="submit" className="ed-btn-modal-save">Lưu thay đổi</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Change Password Modal */}
      {showPass && (
        <div className="ed-modal-overlay">
          <div className="ed-modal">
            <div className="ed-modal-header">
              <h3>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>
                Đổi Mật Khẩu
              </h3>
              <button className="ed-modal-close" onClick={() => setShowPass(false)}>✕</button>
            </div>
            <form className="ed-modal-form" onSubmit={e => { e.preventDefault(); savePassword(); }}>
              <div>
                <label>Mật khẩu hiện tại *</label>
                <input type="password" required value={passData.oldPassword} onChange={e => setPassData({ ...passData, oldPassword: e.target.value })} />
              </div>
              <div>
                <label>Mật khẩu mới *</label>
                <input type="password" required value={passData.newPassword} onChange={e => setPassData({ ...passData, newPassword: e.target.value })} />
              </div>
              <div>
                <label>Xác nhận mật khẩu mới *</label>
                <input type="password" required value={passData.confirmNewPass} onChange={e => setPassData({ ...passData, confirmNewPass: e.target.value })} />
              </div>
              <div className="ed-modal-actions">
                <button type="button" className="ed-btn-modal-cancel" onClick={() => setShowPass(false)}>Hủy</button>
                <button type="submit" className="ed-btn-modal-danger">Cập nhật mật khẩu</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
