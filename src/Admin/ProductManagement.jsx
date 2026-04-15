import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import {
  getPaginatedProductAdmin,
  deleteProduct,
  getCategories,
  addProduct, updateProduct, toggleProductStatus
} from "../Service/ProductApi";
import ProductForm from "./Helpper/ProductForm";
import "./AdminDashboard.css";
import { FiSearch, FiFilter, FiPlus, FiEdit2, FiTrash2, FiEye, FiEyeOff, FiPackage, FiDollarSign, FiTag, FiShoppingBag, FiInfo } from "react-icons/fi";
import toast from "react-hot-toast";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

const MySwal = withReactContent(Swal);

const ProductManagement = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingProductId, setEditingProductId] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  
  // Nút tìm kiếm & Lọc
  const [searchInput, setSearchInput] = useState("");
  // ... (giữ nguyên các state lọc bên dưới)
  const [minPriceInput, setMinPriceInput] = useState("");
  const [maxPriceInput, setMaxPriceInput] = useState("");
  const [categoryInput, setCategoryInput] = useState("");
  const [statusInput, setStatusInput] = useState("");

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [status, setStatus] = useState("");
  const [minPrice, setMinPrice] = useState(null);
  const [maxPrice, setMaxPrice] = useState(null);

  const [showForm, setShowForm] = useState(false);
  
  // Phân trang
  const [pageNumber, setPageIndex] = useState(1);
  const [pageSize] = useState(8);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchData();
  }, [search, category, status, minPrice, maxPrice, pageNumber]); 

  const fetchData = async () => {
    setLoading(true);
    try {
      if (categories.length === 0) {
        const catData = await getCategories();
        setCategories(catData.data);
      }

      const filter = {
        pageSize,
        pageNumber,
        keyword: search,
        CategoryId: category,
        minprice: minPrice,
        maxprice: maxPrice,
        sortedby: null,
        isAdding: true,
        status: status ? parseInt(status) : null
      };

      const productData = await getPaginatedProductAdmin(filter);
      setProducts(productData.items || []);
      setTotalPages(productData.totalPages || 1);
    } catch (error) {
      console.error("Lỗi tải dữ liệu:", error);
      toast.error("Không thể tải danh sách sản phẩm");
    } finally {
      setLoading(false);
    }
  };

  const handleFilter = () => {
    setSearch(searchInput);
    setCategory(categoryInput);
    setStatus(statusInput);
    setMinPrice(minPriceInput.trim() !== "" ? Number(minPriceInput) : null);
    setMaxPrice(maxPriceInput.trim() !== "" ? Number(maxPriceInput) : null);
    setPageIndex(1);
  };

  const handleResetFilters = () => {
    setSearchInput(""); setCategoryInput(""); setStatusInput(""); setMinPriceInput(""); setMaxPriceInput("");
    setSearch(""); setCategory(""); setStatus(""); setMinPrice(null); setMaxPrice(null);
    setPageIndex(1);
  };

  const handleAdd = () => {
    setEditingProductId(null);
    setShowForm(true);
  };

  const handleEdit = (product) => {
    setEditingProductId(product.productId);
    setShowForm(true);
  };

  const handleViewDetail = (product) => {
    setSelectedProduct(product);
    setShowDetailModal(true);
  };

  const handleSave = async (data) => {
    const loadingToast = toast.loading("Đang lưu sản phẩm...");
    try {
      if (editingProductId) {
        await updateProduct(editingProductId, data);
        toast.success("Cập nhật thành công!", { id: loadingToast });
      } else {
        await addProduct(data);
        toast.success("Thêm mới thành bomb!", { id: loadingToast });
      }
      setShowForm(false);
      fetchData();
    } catch (error) {
      console.error("Lỗi lưu sản phẩm:", error);
      toast.error("Có lỗi xảy ra khi lưu!", { id: loadingToast });
    }
  };

  const handleToggleStatus = async (product) => {
    const action = product.isActive ? "Ẩn" : "Bật";
    
    const result = await MySwal.fire({
      title: `Xác nhận ${action}?`,
      text: `Bạn có chắc muốn ${action.toLowerCase()} sản phẩm "${product.name}"?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: product.isActive ? "#d33" : "#2563eb",
      cancelButtonColor: "#64748b",
      confirmButtonText: "Đồng ý",
      cancelButtonText: "Hủy",
      borderRadius: "15px"
    });

    if (result.isConfirmed) {
      const loadingToast = toast.loading(`Đang ${action.toLowerCase()}...`);
      try {
        await toggleProductStatus(product.productId);
        toast.success(`${action} sản phẩm thành công!`, { id: loadingToast });
        fetchData();
      } catch (error) {
        console.error("Lỗi ẩn/bật sản phẩm:", error);
        toast.error("Thao tác thất bại", { id: loadingToast });
      }
    }
  };

  const handleDelete = async (id, name) => {
    const result = await MySwal.fire({
      title: "Xác nhận xóa?",
      text: `Dữ liệu sản phẩm "${name}" sẽ bị xóa vĩnh viễn!`,
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
        await deleteProduct(id);
        toast.success("Đã xóa sản phẩm thành công!", { id: loadingToast });
        fetchData();
      } catch (error) {
        console.error("Lỗi xóa sản phẩm:", error);
        toast.error("Xóa thất bại", { id: loadingToast });
      }
    }
  };

  return (
    <div>
      <div className="mb-6 mt-2">
        <h2 className="text-2xl font-bold text-gray-900 mb-2 page-title">Quản lý sản phẩm</h2>
        <p className="text-gray-600 page-subtitle">Danh sách tất cả sản phẩm trong hệ thống</p>
      </div>

      <div className="table-container">
        {/* Actions Bar */}
        <div className="table-header-actions">
          <div className="table-search">
            <FiSearch className="search-icon" />
            <input
              type="text"
              placeholder="Tìm kiếm theo tên, mã sản phẩm..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
          </div>
          
          <div className="table-actions">
            <button className="btn-table-action outline" onClick={() => {
              const filterMenu = document.getElementById("filter-options");
              filterMenu.classList.toggle("d-none");
            }}>
              <FiFilter className="w-5 h-5" /> Lọc
            </button>
            <button className="btn-table-action primary" onClick={handleAdd}>
              <FiPlus className="w-5 h-5" /> Thêm sản phẩm
            </button>
          </div>
        </div>

        {/* Filter Dropdown Area (Toggleable) */}
        <div id="filter-options" className="d-none bg-light p-3 border-bottom border-gray-200">
          <div className="row g-2">
            <div className="col-md-3">
              <select className="form-select" value={categoryInput} onChange={(e) => setCategoryInput(e.target.value)}>
                <option value="">Danh mục</option>
                {categories.map((c) => (
                  <option key={c.categoryid} value={c.categoryid}>{c.name}</option>
                ))}
              </select>
            </div>
            <div className="col-md-3">
              <select className="form-select" value={statusInput} onChange={(e) => setStatusInput(e.target.value)}>
                <option value="">Trạng thái</option>
                <option value="1">Còn hàng</option>
                <option value="2">Hết hàng</option>
                <option value="3">Ngừng kinh doanh</option>
              </select>
            </div>
            <div className="col-md-2">
              <input type="number" className="form-control" placeholder="Giá từ" value={minPriceInput} onChange={(e) => setMinPriceInput(e.target.value)} />
            </div>
            <div className="col-md-2">
              <input type="number" className="form-control" placeholder="Đến giá" value={maxPriceInput} onChange={(e) => setMaxPriceInput(e.target.value)} />
            </div>
            <div className="col-md-2 d-flex gap-2">
              <button className="btn btn-primary w-100" onClick={handleFilter}>Tìm</button>
              <button className="btn btn-secondary w-100" onClick={handleResetFilters}>Reset</button>
            </div>
          </div>
        </div>

        {/* Products Table */}
        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Ảnh</th>
                <th>Tên sản phẩm</th>
                <th>Loại</th>
                <th>Giá gốc</th>
                <th>Giá KM</th>
                <th>Tồn</th>
                <th>Trạng thái</th>
                <th className="text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="8" className="text-center py-4">Đang tải sản phẩm...</td></tr>
              ) : products.length > 0 ? (
                products.map((p) => (
                  <tr key={p.id}>
                    <td>
                      <div className="product-img-wrapper" style={{ position: 'relative' }}>
                        <img
                          src={p.linkImage}
                          alt={p.name}
                          style={{ width: "45px", height: "45px", objectFit: "cover", borderRadius: "10px", border: "1px solid #eee" }}
                        />
                        {!p.isActive && <div className="status-indicator-red"></div>}
                      </div>
                    </td>
                    <td className="fw-medium text-dark">{p.name}</td>
                    <td className="text-muted">{p.categoryName}</td>
                    <td className="text-muted">{p.originalPrice.toLocaleString()}đ</td>
                    <td className="text-danger fw-bold">
                      {p.disCountPrice < p.originalPrice ? p.disCountPrice.toLocaleString() + "đ" : "—"}
                    </td>
                    <td className="fw-medium">{p.stockQuantity}</td>
                    <td>
                      {p.statuss === "ConHang" && <span className="status-badge success">Còn hàng</span>}
                      {p.statuss === "HetHang" && <span className="status-badge danger">Hết hàng</span>}
                      {p.statuss === "NgungKinhDoanh" && <span className="status-badge secondary">Khóa</span>}
                    </td>
                    <td>
                      <div className="action-buttons justify-content-center">
                        <button className="btn-icon view" title="Xem chi tiết" onClick={() => handleViewDetail(p)}>
                          <FiEye />
                        </button>
                        <button className="btn-icon edit" title={p.isActive ? "Ẩn sản phẩm" : "Bật sản phẩm"} onClick={() => handleToggleStatus(p)}>
                          {p.isActive ? <FiEyeOff /> : <FiEye />}
                        </button>
                        <button className="btn-icon delete" title="Xóa" onClick={() => handleDelete(p.productId, p.name)}>
                          <FiTrash2 />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="text-center py-5 text-muted">Không có sản phẩm nào</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <nav>
          <ul className="pagination admin-pagination justify-content-center mt-4">
            <li className={`page-item ${pageNumber === 1 ? "disabled" : ""}`}>
              <button className="page-link" onClick={() => setPageIndex((p) => Math.max(1, p - 1))}>Trước</button>
            </li>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((num) => (
              <li key={num} className={`page-item ${pageNumber === num ? "active" : ""}`}>
                <button className="page-link" onClick={() => setPageIndex(num)}>{num}</button>
              </li>
            ))}
            <li className={`page-item ${pageNumber === totalPages ? "disabled" : ""}`}>
              <button className="page-link" onClick={() => setPageIndex((p) => Math.min(totalPages, p + 1))}>Sau</button>
            </li>
          </ul>
        </nav>
      )}

      {/* Modal View Detail */}
      {showDetailModal && selectedProduct && (
        <div className="modal show d-block" style={{ backgroundColor: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }} tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content overflow-hidden border-0 shadow-2xl">
              <div className="modal-header bg-light border-0 py-3">
                <h5 className="modal-title fw-bold text-dark d-flex align-items-center gap-2">
                   <FiInfo className="text-primary" /> Chi tiết sản phẩm
                </h5>
                <button type="button" className="btn-close" onClick={() => setShowDetailModal(false)}></button>
              </div>
              <div className="modal-body p-0">
                <div className="p-4">
                  <div className="d-flex gap-4 mb-4">
                    <img 
                      src={selectedProduct.linkImage} 
                      alt={selectedProduct.name}
                      className="rounded-3 shadow-sm border"
                      style={{ width: "120px", height: "120px", objectFit: "cover" }}
                    />
                    <div className="flex-grow-1">
                      <h4 className="fw-bold text-dark mb-1">{selectedProduct.name}</h4>
                      <div className="d-flex align-items-center gap-2 mb-2">
                         <span className="badge bg-primary-subtle text-primary border border-primary-subtle rounded-pill px-3">
                            {selectedProduct.categoryName}
                         </span>
                         <span className={`status-badge ${selectedProduct.isActive ? 'success' : 'danger'}`}>
                            {selectedProduct.isActive ? 'Đang hoạt động' : 'Đang ẩn'}
                         </span>
                      </div>
                      <p className="text-muted small mb-0">Cung cấp bởi: <span className="text-dark fw-medium">{selectedProduct.sellerName}</span></p>
                    </div>
                  </div>

                  <div className="row g-3">
                    <div className="col-6">
                      <div className="p-3 bg-light rounded-3 border">
                        <label className="text-muted fs-7 d-block mb-1">Giá gốc</label>
                        <span className="fw-bold text-dark fs-5">{selectedProduct.originalPrice.toLocaleString()}đ</span>
                      </div>
                    </div>
                    <div className="col-6">
                      <div className="p-3 bg-light rounded-3 border">
                        <label className="text-muted fs-7 d-block mb-1">Giá khuyến mãi</label>
                        <span className="fw-bold text-danger fs-5">
                          {selectedProduct.disCountPrice < selectedProduct.originalPrice ? selectedProduct.disCountPrice.toLocaleString() + "đ" : "Không có"}
                        </span>
                      </div>
                    </div>
                    <div className="col-6">
                      <div className="p-3 bg-light rounded-3 border">
                        <label className="text-muted fs-7 d-block mb-1">Tồn kho</label>
                        <span className="fw-bold text-dark fs-5">{selectedProduct.stockQuantity} sản phẩm</span>
                      </div>
                    </div>
                    <div className="col-6">
                      <div className="p-3 bg-light rounded-3 border">
                        <label className="text-muted fs-7 d-block mb-1">Trạng thái kho</label>
                        <span className="fw-bold text-dark fs-5">
                            {selectedProduct.statuss === "ConHang" ? "Còn hàng" : (selectedProduct.statuss === "HetHang" ? "Hết hàng" : "Khóa")}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="modal-footer bg-light border-0">
                <button type="button" className="btn btn-secondary px-4" onClick={() => setShowDetailModal(false)}>Đóng</button>
                <button type="button" className="btn btn-primary px-4 border-0" style={{ backgroundColor: '#2563eb' }} onClick={() => {setShowDetailModal(false); handleEdit(selectedProduct)}}>Chỉnh sửa</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Add/Edit */}
      {showForm && (
        <div className="modal fade show d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)" }} tabIndex="-1">
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content overflow-hidden border-0">
              <div className="modal-header border-bottom py-3">
                <h5 className="modal-title fw-bold text-dark">{editingProductId ? "Sửa sản phẩm" : "Thêm sản phẩm mới"}</h5>
                <button type="button" className="btn-close" onClick={() => setShowForm(false)}></button>
              </div>
              <div className="modal-body p-0">
                <div className="p-4">
                  <ProductForm
                    categories={categories}
                    productId={editingProductId}
                    onSave={handleSave}
                    onCancel={() => setShowForm(false)}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductManagement;
