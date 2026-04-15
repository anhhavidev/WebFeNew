import React, { useState, useEffect } from 'react';
import useAuth from '../Hooks/useAuth';
import { updateProfile } from '../Service/userApi';
import './AdminDashboard.css';
import { FiUser, FiMail, FiPhone, FiMapPin, FiShield, FiSave, FiEdit2 } from 'react-icons/fi';

export default function UserProfile() {
  const { user, ensureTokenValid, getProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    fullName: user?.fullName || user?.hoTen || 'Người dùng',
    email: user?.email || 'email@example.com',
    phone: user?.phone || user?.sdt || 'Chưa cập nhật',
    address: user?.address || 'Chưa cập nhật',
  });

  useEffect(() => {
    if (user) {
      setFormData({
        fullName: user.fullName || user.hoTen || 'Người dùng',
        email: user.email || 'email@example.com',
        phone: user.phone || user.sdt || 'Chưa cập nhật',
        address: user.address || 'Chưa cập nhật',
      });
    }
  }, [user]);

  const getRoleDisplay = () => {
    switch (user?.role) {
      case 'Admin': return { name: 'Quản Trị Viên', color: '#ef4444', bg: '#fef2f2' };
      case 'Seller': return { name: 'Cửa Hàng / Người Bán', color: '#f59e0b', bg: '#fffbeb' };
      case 'Shipper': return { name: 'Nhân Viên Giao Hàng', color: '#3b82f6', bg: '#eff6ff' };
      default: return { name: 'Khách Hàng', color: '#10b981', bg: '#ecfdf5' };
    }
  };

  const roleInfo = getRoleDisplay();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const token = await ensureTokenValid();
    if (!token) return;
    try {
      await updateProfile(token, formData);
      setIsEditing(false);
      alert('Đã cập nhật hồ sơ thành công!');
      await getProfile(token);
    } catch (error) {
      console.error(error);
      alert('Cập nhật thất bại.');
    }
  };

  return (
    <div className="profile-wrapper">
      <div className="mb-6 mb-md-8 mt-2">
        <h2 className="text-2xl font-bold text-gray-900 mb-2 page-title">Hồ Sơ Của Tôi</h2>
        <p className="text-gray-600 page-subtitle">Quản lý và cập nhật thông tin tài khoản</p>
      </div>

      <div className="row">
        <div className="col-lg-4 mb-4 mb-lg-0">
          <div className="profile-card text-center p-4">
            <div className="avatar-preview mx-auto mb-4">
              <FiUser />
            </div>
            <h4 className="fw-bold mb-1">{formData.fullName}</h4>
            <p className="text-muted mb-3">{formData.email}</p>
            <span 
              className="badge px-3 py-2 rounded-pill" 
              style={{ backgroundColor: roleInfo.bg, color: roleInfo.color, fontSize: '0.875rem' }}
            >
              <FiShield className="me-1" /> {roleInfo.name}
            </span>
          </div>
        </div>

        <div className="col-lg-8">
          <div className="profile-card p-4">
            <div className="d-flex justify-content-between align-items-center mb-4 pb-3 border-bottom">
              <h5 className="fw-bold mb-0">Thông tin chi tiết</h5>
              <button 
                className={`btn btn-${isEditing ? 'outline-secondary' : 'primary'} d-flex align-items-center gap-2`}
                onClick={() => setIsEditing(!isEditing)}
              >
                {isEditing ? <><FiUser /> Hủy bỏ</> : <><FiEdit2 /> Chỉnh sửa</>}
              </button>
            </div>

            <form onSubmit={handleSave}>
              <div className="row g-4">
                <div className="col-md-6">
                  <div className="form-group">
                    <label className="text-muted fs-7 mb-2 d-flex align-items-center gap-2">
                      <FiUser /> Họ và tên
                    </label>
                    <input 
                      type="text" 
                      className="form-control" 
                      name="fullName"
                      value={formData.fullName} 
                      onChange={handleChange}
                      disabled={!isEditing} 
                      required
                    />
                  </div>
                </div>

                <div className="col-md-6">
                  <div className="form-group">
                    <label className="text-muted fs-7 mb-2 d-flex align-items-center gap-2">
                      <FiMail /> Địa chỉ Email
                    </label>
                    <input 
                      type="email" 
                      className="form-control" 
                      name="email"
                      value={formData.email} 
                      onChange={handleChange}
                      disabled={!isEditing} 
                      required
                    />
                  </div>
                </div>

                <div className="col-md-6">
                  <div className="form-group">
                    <label className="text-muted fs-7 mb-2 d-flex align-items-center gap-2">
                      <FiPhone /> Số điện thoại
                    </label>
                    <input 
                      type="text" 
                      className="form-control" 
                      name="phone"
                      value={formData.phone} 
                      onChange={handleChange}
                      disabled={!isEditing} 
                    />
                  </div>
                </div>

                <div className="col-md-6">
                  <div className="form-group">
                    <label className="text-muted fs-7 mb-2 d-flex align-items-center gap-2">
                      <FiMapPin /> Địa chỉ
                    </label>
                    <input 
                      type="text" 
                      className="form-control" 
                      name="address"
                      value={formData.address} 
                      onChange={handleChange}
                      disabled={!isEditing} 
                    />
                  </div>
                </div>
              </div>

              {isEditing && (
                <div className="mt-5 text-end">
                  <button type="submit" className="btn btn-primary px-4 py-2 d-flex align-items-center gap-2 ms-auto">
                    <FiSave /> Lưu thay đổi
                  </button>
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
