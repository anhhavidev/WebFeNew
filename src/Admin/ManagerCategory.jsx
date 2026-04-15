import React, { useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "./AdminDashboard.css";
import { 
  getCategories, 
  addCategory, 
  updateCategory, 
  deleteCategory 
} from "../Service/categoryApi";
import { FiSearch, FiFilter, FiPlus, FiEdit2, FiTrash2, FiTag } from "react-icons/fi";
import toast from "react-hot-toast";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

const MySwal = withReactContent(Swal);

const ManagerCategory = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });

  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const data = await getCategories();
      setCategories(data);
    } catch (error) {
      console.error("Lỗi tải danh mục:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const openForm = (category = null) => {
    setEditingCategory(category);
    if (category) {
      setFormData({
        name: category.name,
        description: category.description,
      });
    } else {
      setFormData({ name: "", description: "" });
    }
    setShowModal(true);
  };

  const closeForm = () => {
    setShowModal(false);
    setEditingCategory(null);
    setFormData({ name: "", description: "" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return toast.error("Tên danh mục không được để trống!");

    const loadingToast = toast.loading(editingCategory ? "Đang cập nhật..." : "Đang thêm mới...");
    try {
      if (editingCategory) {
        await updateCategory(editingCategory.categoryid, formData);
        toast.success("Cập nhật danh mục thành công!", { id: loadingToast });
      } else {
        await addCategory(formData);
        toast.success("Thêm danh mục thành công!", { id: loadingToast });
      }
      closeForm();
      fetchCategories();
    } catch (error) {
      console.error("Lỗi lưu danh mục:", error);
      toast.error("Lỗi khi lưu danh mục!", { id: loadingToast });
    }
  };

  const handleDelete = async (id, name) => {
    const result = await MySwal.fire({
      title: "Xác nhận xóa?",
      text: `Danh mục "${name}" và các sản phẩm liên quan sẽ bị ảnh hưởng!`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#64748b",
      confirmButtonText: "Xóa ngay",
      cancelButtonText: "Hủy",
      borderRadius: "15px"
    });

    if (result.isConfirmed) {
      const loadingToast = toast.loading("Đang xóa...");
      try {
        await deleteCategory(id);
        toast.success("Xóa danh mục thành công!", { id: loadingToast });
        fetchCategories();
      } catch (error) {
        console.error("Lỗi xóa danh mục:", error);
        toast.error("Không thể xóa danh mục này!", { id: loadingToast });
      }
    }
  };

  const filteredCategories = categories.filter((c) =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <div className="mb-6 mt-2">
        <h2 className="text-2xl font-bold text-gray-900 mb-2 page-title">Quản lý danh mục</h2>
        <p className="text-gray-600 page-subtitle">Danh sách các danh mục sản phẩm</p>
      </div>

      <div className="table-container">
        {/* Actions Bar */}
        <div className="table-header-actions">
          <div className="table-search">
            <FiSearch className="search-icon" />
            <input
              type="text"
              placeholder="Tìm kiếm danh mục..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="table-actions">
            <button className="btn-table-action primary" onClick={() => openForm(null)}>
              <FiPlus className="w-5 h-5" /> Thêm danh mục
            </button>
          </div>
        </div>

        {/* Categories Table */}
        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th width="100px">ID</th>
                <th width="30%">Tên danh mục</th>
                <th>Mô tả</th>
                <th width="120px" className="text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="4" className="text-center py-5">Đang tải dữ liệu...</td>
                </tr>
              ) : filteredCategories.length > 0 ? (
                filteredCategories.map((category) => (
                  <tr key={category.categoryid}>
                    <td className="text-muted fw-medium">#C{category.categoryid}</td>
                    <td className="fw-medium text-dark">
                        <div className="d-flex align-items-center">
                            <span className="bg-light p-2 rounded-2 me-3 text-primary d-inline-flex align-items-center justify-content-center border">
                                <FiTag size={16} />
                            </span>
                            {category.name}
                        </div>
                    </td>
                    <td className="text-muted">{category.description || "Chưa có mô tả"}</td>
                    <td>
                      <div className="action-buttons justify-content-center">
                        <button
                          className="btn-icon edit"
                          title="Sửa danh mục"
                          onClick={() => openForm(category)}
                        >
                          <FiEdit2 />
                        </button>
                        <button
                          className="btn-icon delete"
                          title="Xóa danh mục"
                          onClick={() => handleDelete(category.categoryid, category.name)}
                        >
                          <FiTrash2 />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="text-center py-5 text-muted">Không tìm thấy danh mục nào.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modern Modal for Adding/Editing Category */}
      {showModal && (
        <div className="modal show d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)" }} tabIndex="-1">
            <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">{editingCategory ? "Cập nhật danh mục" : "Thêm danh mục mới"}</h5>
                        <button type="button" className="btn-close" onClick={closeForm}></button>
                    </div>
                    <form onSubmit={handleSubmit}>
                        <div className="modal-body">
                            <div className="mb-4">
                                <label className="form-label text-muted fw-medium fs-7">Tên danh mục <span className="text-danger">*</span></label>
                                <input
                                    type="text"
                                    className="form-control"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    placeholder="Ví dụ: Điện thoại thông minh"
                                    required
                                />
                            </div>
                            <div className="mb-3">
                                <label className="form-label text-muted fw-medium fs-7">Mô tả danh mục</label>
                                <textarea
                                    className="form-control"
                                    name="description"
                                    rows="4"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    placeholder="Nhập mô tả cho danh mục này..."
                                ></textarea>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary px-4" onClick={closeForm}>Hủy</button>
                            <button type="submit" className="btn btn-primary px-4 border-0" style={{ backgroundColor: '#2563eb' }}>
                                {editingCategory ? "Cập nhật" : "Thêm mới"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default ManagerCategory;
