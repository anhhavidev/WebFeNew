import React, { useEffect, useState } from "react";
import {
  getAllUsers,
  createUser,
  updateUser,
  deleteUser,
  assignRole,
} from "../Service/Admin/UserAdminApi";
import "bootstrap/dist/css/bootstrap.min.css";
import useAuth from '../Hooks/useAuth';
import "./AdminDashboard.css";
import { FiSearch, FiFilter, FiPlus, FiEdit2, FiTrash2, FiUserCheck } from "react-icons/fi";
import toast from "react-hot-toast";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

const MySwal = withReactContent(Swal);

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingUserId, setEditingUserId] = useState(null);
  const { ensureTokenValid } = useAuth();
  
  const [formData, setFormData] = useState({
    hoTen: "",
    email: "",
    sdt: "",
    password: "",
    gioiTinh: true,
  });

  const [roleData, setRoleData] = useState({ userId: "", roleName: "Customer" });

  const [showRoleModal, setShowRoleModal] = useState(false);
  const [showFormModal, setShowFormModal] = useState(false);

  // Filter state
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("");

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    const token = await ensureTokenValid();
    if (!token) return;

    try {
      const resp = await getAllUsers(token);
      // Backend trả về dạng ResponeDTO<PageResult<...>> 
      // vd: { isSuccess: true, data: { items: [...] } }
      const userList = resp?.data?.items || resp?.data || resp || [];
      setUsers(Array.isArray(userList) ? userList : []);
    } catch (error) {
      console.error("Lỗi khi tải danh sách người dùng:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === "gioiTinh" ? value === "true" : value,
    });
  };

  const handleCreateOrUpdate = async (e) => {
    e.preventDefault();
    const token = await ensureTokenValid();
    if (!token) return;

    const loadingToast = toast.loading(editingUserId ? "Đang cập nhật..." : "Đang thêm người dùng...");
    try {
      const dto = {
        fullName: formData.hoTen,
        userName: formData.email,
        email: formData.email,
        isActive: true,
      };
      if (formData.password) dto.password = formData.password;

      if (editingUserId) {
        const existingUser = users.find(u => u.id === editingUserId);
        dto.roleNames = existingUser?.roleNames || ["Customer"];
        await updateUser(editingUserId, dto, token);
        toast.success("Cập nhật người dùng thành công!", { id: loadingToast });
      } else {
        dto.roleNames = ["Customer"];
        await createUser(dto, token);
        toast.success("Thêm người dùng thành công!", { id: loadingToast });
      }
      setFormData({ hoTen: "", email: "", sdt: "", password: "", gioiTinh: true });
      setEditingUserId(null);
      setShowFormModal(false);
      fetchUsers();
    } catch (error) {
      console.error("Lỗi khi lưu người dùng:", error);
      toast.error("Đã xảy ra lỗi!", { id: loadingToast });
    }
  };

  const handleEdit = (user) => {
    setEditingUserId(user.id);
    setFormData({
      hoTen: user.fullName || user.hoTen || "",
      email: user.email || "",
      sdt: user.sdt || "",
      password: "",
      gioiTinh: user.gioiTinh !== undefined ? user.gioiTinh : true,
    });
    setShowFormModal(true);
  };

  const handleDelete = async (id, name) => {
    const result = await MySwal.fire({
      title: "Xác nhận xóa?",
      text: `Tài khoản của "${name}" sẽ bị xóa khỏi hệ thống!`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#64748b",
      confirmButtonText: "Xóa ngay",
      cancelButtonText: "Hủy",
      borderRadius: "15px"
    });

    if (result.isConfirmed) {
      const token = await ensureTokenValid();
      if (!token) return;

      const loadingToast = toast.loading("Đang xóa người dùng...");
      try {
        await deleteUser(id, token);
        toast.success("Xóa người dùng thành công!", { id: loadingToast });
        fetchUsers();
      } catch (error) {
        console.error("Lỗi khi xóa người dùng:", error);
        toast.error("Xóa thất bại", { id: loadingToast });
      }
    }
  };

  const handleAssignRole = async (e) => {
    e.preventDefault();
    const token = await ensureTokenValid();
    if (!token) return;

    const loadingToast = toast.loading("Đang thực hiện...");
    try {
      const targetUser = users.find(u => u.id === roleData.userId);
      if (!targetUser) throw new Error("User not found");

      const dto = {
        fullName: targetUser.fullName || targetUser.hoTen || targetUser.userName,
        userName: targetUser.userName || targetUser.email,
        email: targetUser.email,
        isActive: targetUser.isActive !== undefined ? targetUser.isActive : true,
        roleNames: [roleData.roleName]
      };

      await updateUser(roleData.userId, dto, token);
      toast.success("Cấp quyền thành công!", { id: loadingToast });
      setShowRoleModal(false);
      fetchUsers();
    } catch (error) {
      console.error("Lỗi khi cấp quyền:", error);
      toast.error("Lỗi cấp quyền", { id: loadingToast });
    }
  };

  const getRoleBadge = (roles) => {
    if (!roles || roles.length === 0) return <span className="status-badge secondary">User</span>;
    if (roles.includes("Admin")) return <span className="status-badge danger">Admin</span>;
    if (roles.includes("Seller")) return <span className="status-badge warning">Seller</span>;
    if (roles.includes("Shipper")) return <span className="status-badge info">Shipper</span>;
    return <span className="status-badge success">Customer</span>;
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      (user.fullName || user.hoTen || "")?.toLowerCase().includes(searchTerm.toLowerCase()) || 
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.sdt?.includes(searchTerm);
      
    const matchesRole = roleFilter === "" ? true : user.roleNames?.includes(roleFilter) || (!user.roleNames?.length && roleFilter === "Customer");
    
    return matchesSearch && matchesRole;
  });

  return (
    <div>
      <div className="mb-6 mt-2">
        <h2 className="text-2xl font-bold text-gray-900 mb-2 page-title">Quản lý người dùng</h2>
        <p className="text-gray-600 page-subtitle">Quản lý thông tin và phân quyền tài khoản</p>
      </div>

      <div className="table-container">
        {/* Actions Bar */}
        <div className="table-header-actions">
          <div className="table-search">
            <FiSearch className="search-icon" />
            <input
              type="text"
              placeholder="Tìm kiếm theo tên, email, SĐT..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="table-actions">
            <select 
                className="form-select border-gray-300"
                style={{ borderRadius: '8px', minWidth: '140px' }}
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
            >
                <option value="">Tất cả vai trò</option>
                <option value="Admin">Admin</option>
                <option value="Customer">Khách hàng</option>
                <option value="Seller">Người bán</option>
                <option value="Shipper">Người giao hàng</option>
            </select>
            <button className="btn-table-action primary" onClick={() => {
                setEditingUserId(null);
                setFormData({ hoTen: "", email: "", sdt: "", password: "", gioiTinh: true });
                setShowFormModal(true);
            }}>
              <FiPlus className="w-5 h-5" /> Thêm người dùng
            </button>
          </div>
        </div>

        {/* Users Table */}
        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Họ Tên</th>
                <th>Email</th>
                <th>Số điện thoại</th>
                <th>Giới tính</th>
                <th>Vai trò</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" className="text-center py-5">Đang tải danh sách người dùng...</td>
                </tr>
              ) : filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <tr key={user.id}>
                    <td className="fw-medium text-dark">{user.fullName || user.hoTen}</td>
                    <td>{user.email}</td>
                    <td>{user.sdt || "—"}</td>
                    <td>{user.gioiTinh ? "Nam" : "Nữ"}</td>
                    <td>{getRoleBadge(user.roleNames)}</td>
                    <td>
                        <div className="action-buttons">
                            <button
                                className="btn-icon view"
                                title="Cấp quyền"
                                onClick={() => {
                                    setRoleData({ userId: user.id, roleName: user.roleNames?.[0] || "Customer" });
                                    setShowRoleModal(true);
                                }}
                            >
                                <FiUserCheck />
                            </button>
                            <button
                                className="btn-icon edit"
                                title="Sửa thông tin"
                                onClick={() => handleEdit(user)}
                            >
                                <FiEdit2 />
                            </button>
                            <button
                                className="btn-icon delete"
                                title="Xóa người dùng"
                                onClick={() => handleDelete(user.id, user.fullName || user.hoTen || user.email)}
                            >
                                <FiTrash2 />
                            </button>
                        </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="text-center py-5 text-muted">Không tìm thấy người dùng nào.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* User Form Modal */}
      {showFormModal && (
        <div className="modal show d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)" }} tabIndex="-1">
            <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">{editingUserId ? "Cập nhật người dùng" : "Thêm người dùng mới"}</h5>
                        <button type="button" className="btn-close" onClick={() => setShowFormModal(false)}></button>
                    </div>
                    <form onSubmit={handleCreateOrUpdate}>
                        <div className="modal-body">
                            <div className="mb-3">
                                <label className="form-label text-muted fw-medium fs-7">Họ Tên</label>
                                <input type="text" className="form-control" name="hoTen" value={formData.hoTen} onChange={handleInputChange} required />
                            </div>
                            <div className="mb-3">
                                <label className="form-label text-muted fw-medium fs-7">Email</label>
                                <input type="email" className="form-control" name="email" value={formData.email} onChange={handleInputChange} required />
                            </div>
                            <div className="mb-3">
                                <label className="form-label text-muted fw-medium fs-7">Số điện thoại</label>
                                <input type="text" className="form-control" name="sdt" value={formData.sdt} onChange={handleInputChange} required />
                            </div>
                            <div className="mb-3">
                                <label className="form-label text-muted fw-medium fs-7">Mật khẩu {editingUserId && "(Bỏ trống nếu không đổi)"}</label>
                                <input type="password" className="form-control" name="password" value={formData.password} onChange={handleInputChange} required={!editingUserId} />
                            </div>
                            <div className="mb-3">
                                <label className="form-label text-muted fw-medium fs-7 d-block">Giới tính</label>
                                <div className="form-check form-check-inline mt-2">
                                    <input className="form-check-input" type="radio" name="gioiTinh" value="true" checked={formData.gioiTinh === true} onChange={handleInputChange} />
                                    <label className="form-check-label">Nam</label>
                                </div>
                                <div className="form-check form-check-inline mt-2">
                                    <input className="form-check-input" type="radio" name="gioiTinh" value="false" checked={formData.gioiTinh === false} onChange={handleInputChange} />
                                    <label className="form-check-label">Nữ</label>
                                </div>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary px-4" onClick={() => setShowFormModal(false)}>Hủy</button>
                            <button type="submit" className="btn btn-primary px-4 border-0" style={{ backgroundColor: '#2563eb' }}>{editingUserId ? "Cập nhật" : "Thêm mới"}</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
      )}

      {/* Assign Role Modal */}
      {showRoleModal && (
        <div className="modal show d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)" }} tabIndex="-1">
            <div className="modal-dialog modal-dialog-centered modal-sm">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">Cấp quyền tài khoản</h5>
                        <button type="button" className="btn-close" onClick={() => setShowRoleModal(false)}></button>
                    </div>
                    <form onSubmit={handleAssignRole}>
                        <div className="modal-body">
                            <div className="mb-3">
                                <label className="form-label text-muted fw-medium fs-7">Chọn vai trò mới</label>
                                <select 
                                    className="form-select"
                                    value={roleData.roleName}
                                    onChange={(e) => setRoleData({ ...roleData, roleName: e.target.value })}
                                >
                                    <option value="Customer">Khách hàng</option>
                                    <option value="Admin">Admin</option>
                                    <option value="Seller">Người bán</option>
                                    <option value="Shipper">Người giao hàng</option>
                                </select>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary px-4" onClick={() => setShowRoleModal(false)}>Hủy</button>
                            <button type="submit" className="btn btn-primary px-4 border-0" style={{ backgroundColor: '#2563eb' }}>Cấp quyền</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
