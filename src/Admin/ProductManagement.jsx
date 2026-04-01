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
import { FiSearch, FiFilter, FiPlus, FiEdit2, FiTrash2, FiEye, FiEyeOff } from "react-icons/fi";

const ProductManagement = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingProductId, setEditingProductId] = useState(null);
  
  // Nút tìm kiếm & Lọc
  const [searchInput, setSearchInput] = useState("");
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

  const handleSave = async (data) => {
    try {
      if (editingProductId) {
        await updateProduct(editingProductId, data);
      } else {
        await addProduct(data);
      }
      setShowForm(false);
      fetchData();
    } catch (error) {
      console.error("Lỗi lưu sản phẩm:", error);
    }
  };

  const handleToggleStatus = async (id) => {
    if (window.confirm("Bạn có chắc muốn ẩn hoặc bật sản phẩm này không?")) {
      try {
        const result = await toggleProductStatus(id);
        alert(result.message);
        fetchData();
      } catch (error) {
        console.error("Lỗi ẩn/bật sản phẩm:", error);
        alert("Không thể thay đổi trạng thái sản phẩm");
      }
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Bạn có chắc muốn xóa sản phẩm này?")) {
      try {
        await deleteProduct(id);
        fetchData();
      } catch (error) {
        console.error("Lỗi xóa sản phẩm:", error);
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
              <button className="btn btn-secondary w-100" onClick={handleResetFilters}>Xóa</button>
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
                <th>Cửa hàng</th>
                <th>Tồn kho</th>
                <th>Trạng thái</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="9" className="text-center py-4">Đang tải sản phẩm...</td></tr>
              ) : products.length > 0 ? (
                products.map((p) => (
                  <tr key={p.id}>
                    <td>
                      <img
                        src={p.linkImage}
                        alt={p.name}
                        style={{ width: "40px", height: "40px", objectFit: "cover", borderRadius: "8px" }}
                      />
                    </td>
                    <td className="fw-medium">{p.name}</td>
                    <td>{p.categoryName}</td>
                    <td>{p.originalPrice.toLocaleString()} đ</td>
                    <td className="text-danger fw-bold">
                      {p.disCountPrice < p.originalPrice ? p.disCountPrice.toLocaleString() + " đ" : "—"}
                    </td>
                    <td>{p.sellerName}</td>
                    <td>{p.stockQuantity}</td>
                    <td>
                      {p.statuss === "ConHang" && <span className="status-badge success">Còn hàng</span>}
                      {p.statuss === "HetHang" && <span className="status-badge danger">Hết hàng</span>}
                      {p.statuss === "NgungKinhDoanh" && <span className="status-badge secondary">Khóa</span>}
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button className="btn-icon view" title="Xem chi tiết" onClick={() => alert(`Xem chi tiết: ${p.name}`)}>
                          <FiEye />
                        </button>
                        <button className="btn-icon edit" title={p.isActive ? "Ẩn sản phẩm" : "Bật sản phẩm"} onClick={() => handleToggleStatus(p.productId)}>
                          {p.isActive ? <FiEyeOff /> : <FiEye />}
                        </button>
                        <button className="btn-icon delete" title="Xóa" onClick={() => handleDelete(p.productId)}>
                          <FiTrash2 />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="9" className="text-center py-5 text-muted">Không có sản phẩm nào</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <nav>
          <ul className="pagination admin-pagination justify-content-center">
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

      {/* Modal */}
      {showForm && (
        <div className="modal fade show d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)" }} tabIndex="-1">
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">{editingProductId ? "Sửa sản phẩm" : "Thêm sản phẩm"}</h5>
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
