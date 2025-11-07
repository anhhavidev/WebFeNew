import React, { useEffect, useState } from "react";
import {
  GetAllCategory,
  AddCategory,
  UpdateCategory,
  DeleteCategory,
} from "../Service/Admin/CategoryApi";
import useAuth from "../Hooks/useAuth"; // để lấy token

export default function ManagerCategory() {
  const [categories, setCategories] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    isActive: true,
  });

  const { ensureTokenValid } = useAuth();

  // 🔹 Lấy danh sách category
  const fetchCategories = async () => {
    const result = await GetAllCategory();
    if (result.isSuccess) setCategories(result.data || []);
    else alert(result.message);
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // 🔹 Lưu category (thêm hoặc sửa)
  const handleSave = async () => {
    const token = await ensureTokenValid();
    if (!token) return;

    if (!formData.name.trim()) {
      alert("Tên danh mục không được để trống");
      return;
    }

    let result;
    if (editingCategory) {
      result = await UpdateCategory(
        {
          categoryid: editingCategory.categoryid,
          name: formData.name,
          description: formData.description,
          isActive: formData.isActive,
        },
        token
      );
    } else {
      result = await AddCategory(
        {
          name: formData.name,
          description: formData.description,
          isActive: formData.isActive,
        },
        token
      );
    }

    if (result.isSuccess) {
      alert(result.message);
      fetchCategories();
      setShowModal(false);
      resetForm();
    } else {
      alert(result.message);
    }
  };

  // 🔹 Xóa category
  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc muốn xóa danh mục này?")) return;

    const token = await ensureTokenValid();
    if (!token) return;

    const result = await DeleteCategory(id, token);
    if (result.isSuccess) {
      alert(result.message);
      fetchCategories();
    } else {
      alert(result.message);
    }
  };

  // 🔹 Sửa category
  const handleEdit = (category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      description: category.description || "",
      isActive: category.isActive ?? true,
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setEditingCategory(null);
    setFormData({ name: "", description: "", isActive: true });
  };

  return (
    <div className="container mt-4">
      <h4>Quản lý loại sản phẩm</h4>
      <button className="btn btn-primary mb-2" onClick={() => setShowModal(true)}>
        Thêm mới
      </button>

      <table className="table table-bordered">
        <thead>
          <tr>
            <th>ID</th>
            <th>Tên loại</th>
            <th>Mô tả</th>
            <th>Trạng thái</th>
            <th>Hành động</th>
          </tr>
        </thead>
        <tbody>
          {categories.length === 0 ? (
            <tr>
              <td colSpan="5" className="text-center">
                Không có danh mục
              </td>
            </tr>
          ) : (
            categories.map((cat) => (
              <tr key={cat.categoryid}>
                <td>{cat.categoryid}</td>
                <td>{cat.name}</td>
                <td>{cat.description || "Không có"}</td>
                <td>
                  {cat.isActive ? (
                    <span className="badge bg-success">Hoạt động</span>
                  ) : (
                    <span className="badge bg-secondary">Ngừng</span>
                  )}
                </td>
                <td>
                  <button
                    className="btn btn-sm btn-warning me-1"
                    onClick={() => handleEdit(cat)}
                  >
                    Sửa
                  </button>
                  <button
                    className="btn btn-sm btn-danger"
                    onClick={() => handleDelete(cat.categoryid)}
                  >
                    Xóa
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {/* Modal thêm/sửa */}
      {showModal && (
        <div className="modal show d-block" tabIndex="-1">
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {editingCategory ? "Sửa danh mục" : "Thêm danh mục"}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                ></button>
              </div>
              <div className="modal-body">
                <label className="form-label">Tên loại:</label>
                <input
                  type="text"
                  className="form-control mb-2"
                  placeholder="Tên danh mục"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />

                <label className="form-label">Mô tả:</label>
                <textarea
                  className="form-control mb-2"
                  rows="2"
                  placeholder="Mô tả danh mục"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                ></textarea>

                <label className="form-label">Trạng thái:</label>
                <select
                  className="form-select"
                  value={formData.isActive ? "true" : "false"}
                  onChange={(e) =>
                    setFormData({ ...formData, isActive: e.target.value === "true" })
                  }
                >
                  <option value="true">Hoạt động</option>
                  <option value="false">Ngừng</option>
                </select>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                >
                  Đóng
                </button>
                <button type="button" className="btn btn-primary" onClick={handleSave}>
                  Lưu
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
