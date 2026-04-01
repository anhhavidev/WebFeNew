import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import {
  getPaginatedProducSeller,
  deleteProduct,
  getCategories,
  addProduct, updateProduct , getProductById
} from "../Service/ProductApi";
import "../Admin/ProductManagement.css";
import ProductForm from "../Admin/Helpper/ProductForm";
const ProductManagerSeller = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingProductId, setEditingProductId] = useState(null);
  // Bộ lọc
  // State cho input tạm
  const [searchInput, setSearchInput] = useState("");
  const [minPriceInput, setMinPriceInput] = useState("");
  const [maxPriceInput, setMaxPriceInput] = useState("");
  const [categoryInput, setCategoryInput] = useState("");
  const [statusInput, setStatusInput] = useState("");

  // State filter thật sự để fetch
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [status, setStatus] = useState("");
  const [minPrice, setMinPrice] = useState(null);
  const [maxPrice, setMaxPrice] = useState(null);


  // Khi nhấn Tìm
  const handleFilter = () => {
    setSearch(searchInput);
    setCategory(categoryInput);
    setStatus(statusInput);

    // Ép kiểu sang số hoặc null nếu rỗng
    setMinPrice(minPriceInput.trim() !== "" ? Number(minPriceInput) : null);
    setMaxPrice(maxPriceInput.trim() !== "" ? Number(maxPriceInput) : null);

    setPageIndex(1); // reset về trang đầu
  };
  /// resestfillter 
  const handleResetFilters = () => {
    setSearchInput("");
    setCategoryInput("");
    setStatusInput("");
    setMinPriceInput("");
    setMaxPriceInput("");

    setSearch("");
    setCategory("");
    setStatus("");
    setMinPrice(null);
    setMaxPrice(null);

    setPageIndex(1);
  };
  // mở đóng form 
  const [showForm, setShowForm] = useState(false);
  // const [editingProduct, setEditingProduct] = useState(null);
  const handleAdd = () => {
    setEditingProductId(null);   // Thêm mới → không có dữ liệu cũ
    setShowForm(true);
  };

  const handleEdit = (product) => {
    setEditingProductId(product.productId); // Sửa → truyền dữ liệu sản phẩm
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

  // Pagination
  const [pageNumber, setPageIndex] = useState(1);
  const [pageSize] = useState(8);
  const [totalPages, setTotalPages] = useState(1);
  //detail
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);

  useEffect(() => {
    fetchData();
  }, [search, category, status, minPrice, maxPrice, pageNumber]); // một trong những dk thay đổi htif ohji lại 

  const fetchData = async () => {
    setLoading(true);
    try {
      // Lấy danh mục (gọi 1 lần thôi)
      if (categories.length === 0) {
        const catData = await getCategories();
        setCategories(catData.data);
      }

      // Gửi filter khớp BE
      const filter = {
        pageSize,
        pageNumber,
        keyword: search,      // FE: search -> BE: keyword
        CategoryId: category, // FE: category -> BE: CategoryId
        minprice: minPrice,
        maxprice: maxPrice,
        sortedby: null,       // (nếu chưa dùng thì để null hoặc bỏ)
        isAdding: true,        // hoặc false, tuỳ nhu cầu
        status: status ? parseInt(status) : null // 👈 FE gửi số, BE bind vào enum
      };

      //'http://localhost:5230/api/Product/paging?pageIndex=1&pageSize=8'

      const productData = await getPaginatedProducSeller(filter);
      setProducts(productData.items || []);
      setTotalPages(productData.totalPages || 1); // giả sử BE trả về totalPages
    } catch (error) {
      console.error("Lỗi tải dữ liệu:", error);
    } finally {
      setLoading(false);
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

  if (loading) return <div className="p-3">Đang tải sản phẩm...</div>;
  const handleView = async (id) => {
    try {
      const data = await getProductById(id);
      setSelectedProduct(data);
      setShowViewModal(true);
    } catch (err) {
      console.error(err);
      alert("Lỗi khi lấy chi tiết sản phẩm");
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
            type="number"
            className="form-control"
            placeholder="Giá từ"
            value={minPriceInput}
            onChange={(e) => setMinPriceInput(e.target.value)}
          />
        </div>
        <div className="col-md-2">
          <input
            type="number"
            className="form-control"
            placeholder="Đến giá"
            value={maxPriceInput}
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
                    onClick={() => handleDelete(p.productId)}
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
        <div className="modal fade show d-block" tabIndex="-1">
          <div className="modal-dialog modal-lg">
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
