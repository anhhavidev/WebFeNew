import React, { useEffect, useState } from "react";
import { getAllUsers, createUser, updateUser, deleteUser, getRoles } from "../Service/Admin/UserAdminApi";
import useAuth from "../Hooks/useAuth";

export default function UserManagement() {
    const { ensureTokenValid } = useAuth();
    const [users, setUsers] = useState([]);
    const [pageIndex, setPageIndex] = useState(1);
    const [pageSize] = useState(10);
    const [totalPages, setTotalPages] = useState(1);

    const [editingUser, setEditingUser] = useState(null); // dùng cho edit
    const [roles, setRoles] = useState([]); // danh sách role từ API
    const [form, setForm] = useState({
        id: "",
        email: "",
        fullName: "",
        password: "",
        roleNames: [],
        userName: "",// thêm
        isActive: true  // ✅ thêm mặc định là true
    });

    // ✅ Load danh sách user
    const fetchUsers = async () => {
        const token = await ensureTokenValid();
        if (!token) return;

        try {
            const data = await getAllUsers(pageIndex, pageSize, token);
            setUsers(data.data.items || []);
            setTotalPages(data.data.totalPages || 1);
        } catch (err) {
            console.error(err);
            alert("Lỗi khi lấy danh sách user");
        }
    };

    // ✅ Load danh sách roles
    const fetchRoles = async () => {
        const token = await ensureTokenValid();
        if (!token) return;

        try {
            const data = await getRoles(token);
            setRoles(data.data || []);
        } catch (err) {
            console.error(err);
            alert("Lỗi khi lấy danh sách roles");
        }
    };

    useEffect(() => {
        fetchUsers();
        fetchRoles();
    }, [pageIndex]);

    // ✅ handleChange xử lý cả checkbox
    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setForm({
            ...form,
            [name]: type === "checkbox" ? checked : value
        });
    };

    // ✅ Handle multi-role change
    const handleRoleChange = (e) => {
        const options = e.target.options;
        const selected = [];
        for (let i = 0; i < options.length; i++) {
            if (options[i].selected) selected.push(options[i].value);
        }
        setForm({ ...form, roleNames: selected });
    };

    // ✅ Thêm hoặc sửa user
    const handleSubmit = async (e) => {
        e.preventDefault();
        const token = await ensureTokenValid();
        if (!token) return;

        try {
            if (editingUser) {
                await updateUser(form, token);
                alert("Cập nhật user thành công");
            } else {
                await createUser(form, token);
                alert("Thêm user thành công");
            }
            setForm({ id: "", email: "", fullName: "", password: "", roleNames: [] });
            setEditingUser(null);
            fetchUsers();
        } catch (err) {
            console.error(err);
            alert("Thao tác thất bại");
        }
    };

    // ✅ Chỉnh sửa user
    const handleEdit = (user) => {
        setEditingUser(user);
        setForm({
            id: user.id,
            email: user.email,
            fullName: user.fullName,
            password: "",
            roleNames: user.roleNames || [],
            isActive: user.isActive,
            userName: user.userName || user.email // fallback nếu userName trống
        });
    };


    // ✅ Xóa user
    const handleDelete = async (userId) => {
        if (!window.confirm("Bạn có chắc muốn xóa user này?")) return;

        const token = await ensureTokenValid();
        if (!token) return;

        try {
            await deleteUser(userId, token);
            alert("Xóa user thành công");
            fetchUsers();
        } catch (err) {
            console.error(err);
            alert("Xóa thất bại");
        }
    };

    return (
        <div className="container mt-4">
            <h3>Quản lý người dùng</h3>

            {/* Form thêm/sửa user */}
            <form className="border p-3 mb-4 rounded shadow-sm bg-light" onSubmit={handleSubmit}>
                <h5>{editingUser ? "Chỉnh sửa User" : "Thêm User"}</h5>
                <div className="mb-2">
                    <label>Email:</label>
                    <input type="email" name="email" value={form.email} onChange={handleChange} className="form-control" required />
                </div>
                <div className="mb-2">
                    <label>Họ và tên:</label>
                    <input type="text" name="fullName" value={form.fullName} onChange={handleChange} className="form-control" required />
                </div>
                <div className="mb-2">
                    <label>UserName:</label>
                    <input
                        type="text"
                        name="userName"
                        value={form.userName}
                        onChange={handleChange}
                        className="form-control"
                        required
                    />
                </div>

                {!editingUser && (
                    <div className="mb-2">
                        <label>Password:</label>
                        <input type="password" name="password" value={form.password} onChange={handleChange} className="form-control" required />
                    </div>
                )}
                <div className="mb-2">
                    <label>Active:</label>
                    <input type="checkbox" name="isActive" checked={form.isActive} onChange={handleChange} className="form-check-input ms-2" />
                </div>
                <div className="mb-2">
                    <label>Roles:</label>
                    <select
                        name="roleNames"
                        multiple
                        value={form.roleNames}
                        onChange={handleRoleChange}
                        className="form-select"
                        required
                    >
                        {roles.map((role) => (
                            <option key={role} value={role}>{role}</option>
                        ))}
                    </select>
                </div>
                <button className="btn btn-primary">{editingUser ? "Cập nhật" : "Thêm"}</button>
                {editingUser && (
                    <button type="button" className="btn btn-secondary ms-2" onClick={() => { setEditingUser(null); setForm({ id: "", email: "", fullName: "", password: "", roleNames: [] }); }}>
                        Hủy
                    </button>
                )}
            </form>

            {/* Danh sách user */}
            <table className="table table-bordered">
                <thead>
                    <tr>
                        <th>Email</th>
                        <th>Họ và tên</th>
                        <th>User Name </th>
                        <th>Roles</th>
                        <th>Active</th>
                        <th>Hành động</th>
                    </tr>
                </thead>
                <tbody>
                    {users.length === 0 ? (
                        <tr><td colSpan="4" className="text-center">Không có user nào</td></tr>
                    ) : users.map((user) => (
                        <tr key={user.id}>
                            <td>{user.email}</td>
                            <td>{user.fullName}</td>
                            <td>{user.userName}</td>
                            <td>{(user.roleNames || []).join(", ")}</td>
                            <td>{user.isActive ? "✅" : "❌"}</td>
                            <td>
                                <button className="btn btn-sm btn-primary me-1" onClick={() => handleEdit(user)}>Sửa</button>
                                <button className="btn btn-sm btn-danger" onClick={() => handleDelete(user.id)}>Xóa</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* Phân trang */}
            <div className="d-flex justify-content-center mt-3">
                <button className="btn btn-sm btn-primary me-2" onClick={() => setPageIndex(p => Math.max(p - 1, 1))} disabled={pageIndex === 1}>
                    Trang trước
                </button>
                <span className="align-self-center">Trang {pageIndex} / {totalPages}</span>
                <button className="btn btn-sm btn-primary ms-2" onClick={() => setPageIndex(p => Math.min(p + 1, totalPages))} disabled={pageIndex === totalPages}>
                    Trang sau
                </button>
            </div>
        </div>
    );
}
