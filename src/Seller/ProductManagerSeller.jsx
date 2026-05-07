import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import {
  getPaginatedProducSeller,
  deleteProduct,
  getCategories,
  addProduct, updateProduct, getProductById
} from "../Service/ProductApi";
import "../Admin/ProductManagement.css";
import ProductForm from "../Admin/Helpper/ProductForm";
import { FiEye, FiEdit, FiTrash2, FiSearch, FiFilter, FiPlus } from "react-icons/fi";
import toast from "react-hot-toast";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

const MySwal = withReactContent(Swal);

const ProductManagerSeller = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingProductId, setEditingProductId] = useState(null);
  // ... (giữ nguyên các state lọc)
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

  const handleFilter = () => {
    setSearch(searchInput);
    setCategory(categoryInput);
    setStatus(statusInput);

    const parsePrice = (val) => {
      if (!val) return null;
      const num = Number(val.toString().replace(/\D/g, ""));
      return isNaN(num) ? null : num;
    };

    setMinPrice(parsePrice(minPriceInput));
    setMaxPrice(parsePrice(maxPriceInput));
    setPageIndex(1);
  };

  const handleResetFilters = () => {
    setSearchInput(""); setCategoryInput(""); setStatusInput(""); setMinPriceInput(""); setMaxPriceInput("");
    setSearch(""); setCategory(""); setStatus(""); setMinPrice(null); setMaxPrice(null);
    setPageIndex(1);
  };

  const [showForm, setShowForm] = useState(false);
  
  const handleAdd = () => {
    setEditingProductId(null);
    setShowForm(true);
  };

  const handleEdit = (product) => {
    setEditingProductId(product.productId);
    setShowForm(true);
  };

  const handleSave = async (data) => {
    const loadingToast = toast.loading("Đang lưu sản phẩm...");
    try {
      if (editingProductId) {
        await updateProduct(editingProductId, data);
        toast.success("Cập nhật thành công!", { id: loadingToast });
      } else {
        await addProduct(data);
        toast.success("Đã thêm sản phẩm mới thành công!", { id: loadingToast });
      }
      setShowForm(false);
      fetchData();
    } catch (error) {
      console.error("Lỗi lưu sản phẩm:", error);
      toast.error("Thao tác thất bại!", { id: loadingToast });
      throw error;
    }
  };

  // Pagination
  const [pageNumber, setPageIndex] = useState(1);
  const [pageSize] = useState(8);
  const [totalPages, setTotalPages] = useState(1);
  //detail
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);

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

      const productData = await getPaginatedProducSeller(filter);
      setProducts(productData.items || []);
      setTotalPages(productData.totalPages || 1);
    } catch (error) {
      console.error("Lỗi tải dữ liệu:", error);
      toast.error("Không thể tải sản phẩm");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, name) => {
    const result = await MySwal.fire({
      title: "Xác nhận xóa?",
      text: `Sản phẩm "${name}" sẽ bị xóa vĩnh viễn!`,
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
        toast.error("Xóa sản phẩm thất bại", { id: loadingToast });
      }
    }
  };

  if (loading) return <div className="p-3 text-center">Đang tải sản phẩm...</div>;

  const handleView = async (id) => {
    const loadingToast = toast.loading("Đang lấy thông tin...");
    try {
      const data = await getProductById(id);
      setSelectedProduct(data);
      setShowViewModal(true);
      toast.dismiss(loadingToast);
    } catch (err) {
      console.error(err);
      toast.error("Lỗi khi lấy chi tiết sản phẩm", { id: loadingToast });
    }
  };

  return (
    <div className="p-3">
      <div className="d-flex justify-content-between ">
        <h4 className="mb-3">Quản lý sản phẩm</h4>
        <button className="btn btn-primary mb-3" onClick={handleAdd}>
          Thêm sản phẩm
        </button>

      </div>

      {/* Thanh lọc và tìm kiếm */}
      <div className="row g-2 mb-3">
        <div className="col-md-3">
          <input
            type="text"
            className="form-control"
            placeholder="Tìm kiếm theo tên, mã sản phẩm"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)} // normal 
          />
        </div>
        <div className="col-md-2">
          <select
            className="form-select"
            value={categoryInput}
            onChange={(e) => setCategoryInput(e.target.value)}
          >
            <option value="">Danh mục</option>
            {categories.map((c) => (
              <option key={c.categoryid} value={c.categoryid}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div className="col-md-2">
          <select
            className="form-select"
            value={statusInput}
            onChange={(e) => setStatusInput(e.target.value)}
          >
            <option value="">Trạng thái</option>
            <option value="1">Còn hàng</option>
            <option value="2">Hết hàng</option>
            <option value="3">Ngừng kinh doanh</option>
          </select>

        </div>
        <div className="col-md-2">
          <input
            type="text"
            className="form-control"
            placeholder="Giá từ"
            value={minPriceInput ? Number(minPriceInput.toString().replace(/\D/g, "")).toLocaleString("vi-VN") : ""}
            onChange={(e) => setMinPriceInput(e.target.value)}
          />
        </div>
        <div className="col-md-2">
          <input
            type="text"
            className="form-control"
            placeholder="Đến giá"
            value={maxPriceInput ? Number(maxPriceInput.toString().replace(/\D/g, "")).toLocaleString("vi-VN") : ""}
            onChange={(e) => setMaxPriceInput(e.target.value)}
          />
        </div>
        <div className="col-md-1 d-flex gap-1">
          <button className="btn btn-primary w-100" onClick={handleFilter}>
            Tìm
          </button>
          <button
            type="button"
            className="btn btn-secondary w-100"
            onClick={handleResetFilters}
          >
            Xóa
          </button>
        </div>

      </div>


      {/* Bảng sản phẩm */}
      {/* Bảng sản phẩm */}
      <table className="table table-bordered align-middle">
        <thead className="table-light">
          <tr>
            <th>STT</th>
            <th>Ảnh</th>
            <th>Tên sản phẩm</th>
            <th>Giá gốc </th>
            <th>Giá KM </th>
            <th>% Giảm</th>

            <th>Tồn kho</th>
            <th>Trạng thái</th>
            <th>Ngày tạo</th>
            <th>Ngày cập nhật</th>
            <th>Hành động</th>
          </tr>
        </thead>
        <tbody>
          {products.length > 0 ? (
            products.map((p, index) => (
              <tr key={p.id}>
                {/* STT */}
                <td>{(pageNumber - 1) * pageSize + index + 1}</td>
                <td>
                  <img
                    src={p.linkImage}
                    alt={p.name}
                    style={{
                      width: "50px",
                      height: "50px",
                      objectFit: "cover",
                    }}
                  />
                </td>
                <td>{p.name}</td>
                {/* Giá gốc */}
                <td>{p.originalPrice.toLocaleString()} đ</td>

                {/* Giá KM */}
                <td>
                  {p.disCountPrice < p.originalPrice ? (
                    <>
                      <span className="text-danger fw-bold">
                        {p.disCountPrice.toLocaleString()} đ
                      </span>

                    </>
                  ) : (
                    <span className="text-danger fw-bold">
                      {p.originalPrice.toLocaleString()} đ
                    </span>
                  )}
                </td>

                <td>
                  {p.disCountPrice < p.originalPrice
                    ? `${p.discountPercent}%`
                    : "—"}
                </td>
                <td>{p.stockQuantity}</td>
                <td>
                  {p.statuss === "ConHang" && (
                    <span className="badge bg-success">Còn hàng</span>
                  )}
                  {p.statuss === "HetHang" && (
                    <span className="badge bg-danger">Hết hàng</span>
                  )}
                  {p.statuss === "NgungKinhDoanh" && (
                    <span className="badge bg-secondary">Ngừng kinh doanh</span>
                  )}
                </td>

                <td>{new Date(p.createdAt).toLocaleDateString("vi-VN")}</td>
                <td>
                  {p.updatedAt
                    ? new Date(p.updatedAt).toLocaleDateString("vi-VN")
                    : "—"}
                </td>

                <td>
                  {/* Xem */}
                  <button
                    className="btn btn-sm btn-info me-2"
                    onClick={() => handleView(p.productId)}
                  >
                    <i className="bi bi-eye"></i>
                  </button>

                  {/* Sửa */}
                  <button
                    className="btn btn-sm btn-warning me-2"
                    onClick={() => handleEdit(p)}
                  >
                    <i className="bi bi-pencil"></i>
                  </button>
                  {/* Xoá */}
                  <button
                    className="btn btn-sm btn-danger"
                    onClick={() => handleDelete(p.productId, p.name)}
                  >
                    <i className="bi bi-trash"></i>
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="11" className="text-center">
                Không có sản phẩm
              </td>
            </tr>
          )}
        </tbody>
      </table>
      {showViewModal && selectedProduct && (
  <div className="modal fade show d-block" tabIndex="-1">
    <div className="modal-dialog modal-lg">
      <div className="modal-content">
        <div className="modal-header">
          <h5 className="modal-title">Chi tiết sản phẩm: {selectedProduct.name}</h5>
          <button
            type="button"
            className="btn-close"
            onClick={() => setShowViewModal(false)}
          ></button>
        </div>
        <div className="modal-body">
          <div className="row">
            <div className="col-md-4">
              <img
                src={selectedProduct.linkImage}
                alt={selectedProduct.name}
                className="img-fluid rounded"
              />
            </div>
            <div className="col-md-8">
              <p><strong>Tên sản phẩm:</strong> {selectedProduct.name}</p>
              <p><strong>Danh mục:</strong> {selectedProduct.categoryName}</p>
              <p><strong>Mô tả:</strong> {selectedProduct.description}</p>
              <p><strong>Giá gốc:</strong> {selectedProduct.originalPrice.toLocaleString()} đ</p>
              <p><strong>Giảm giá:</strong> {selectedProduct.discountPercent}%</p>
              <p><strong>Tồn kho:</strong> {selectedProduct.stockQuantity}</p>
              <p><strong>Trạng thái:</strong> {selectedProduct.isActive ? "Hoạt động" : "Ngưng hoạt động"}</p>
              <p><strong>Đã bán:</strong> {selectedProduct.totalPurchased}</p>
              <p><strong>Trọng lượng:</strong> {selectedProduct.weight} kg</p>
            </div>
          </div>
        </div>
        <div className="modal-footer">
          <button
            className="btn btn-secondary"
            onClick={() => setShowViewModal(false)}
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  </div>
)}

      {/* Pagination */}
      <nav>
        <ul className="pagination justify-content-center">
          <li className={`page-item ${pageNumber === 1 ? "disabled" : ""}`}>
            <button
              className="page-link"
              onClick={() => setPageIndex((p) => Math.max(1, p - 1))}
            >
              Trước
            </button>
          </li>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((num) => (
            <li
              key={num}
              className={`page-item ${pageNumber === num ? "active" : ""}`}
            >
              <button className="page-link" onClick={() => setPageIndex(num)}>
                {num}
              </button>
            </li>
          ))}

          <li
            className={`page-item ${pageNumber === totalPages ? "disabled" : ""
              }`}
          >
            <button
              className="page-link"
              onClick={() =>
                setPageIndex((p) => Math.min(totalPages, p + 1))
              }
            >
              Sau
            </button>
          </li>
        </ul>
      </nav>
      {showForm && (
        <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg modal-dialog-scrollable">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {editingProductId ? "Sửa sản phẩm" : "Thêm sản phẩm"}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowForm(false)}
                ></button>
              </div>
              <div className="modal-body">
                <ProductForm
                  categories={categories}
                  productId={editingProductId}   // 👈 chỉ truyền id , prop tự định nghĩa 
                  onSave={handleSave}
                  onCancel={() => setShowForm(false)}
                />
              </div>
            </div>
          </div>
        </div>
      )}

    </div>

  );
};

export default ProductManagerSeller;
