import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import {
  getPaginatedProductAdmin,
  deleteProduct,
  addProduct, updateProduct, toggleProductStatus
} from "../Service/ProductApi";
import { getCategories } from "../Service/categoryApi";
import ProductForm from "./Helper/ProductForm";
import Pagination from "../Components/Pagination";
import FilterArea from "./FilterArea";
import ProductTable from "./ProductTable";
import DetailModal from "./DetailModal";
import "./AdminDashboard.css";
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
  const [showForm, setShowForm] = useState(false);

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
        pageSize, pageNumber,
        keyword: search,
        CategoryId: category,
        minprice: minPrice,
        maxprice: maxPrice,
        sortedby: null,
        isAdding: true,
        status: status ? parseInt(status) : null
      };

      const productData = await getPaginatedProductAdmin(filter);
      setProducts(productData.data?.items || productData.items || []);
      setTotalPages(productData.data?.totalPages || productData.totalPages || 1);
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
        toast.success("Thêm mới thành công!", { id: loadingToast });
      }
      setShowForm(false);
      fetchData();
    } catch (error) {
      console.error("Lỗi lưu sản phẩm:", error);
      toast.error("Có lỗi xảy ra khi lưu!", { id: loadingToast });
      throw error;
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
        <FilterArea
          searchInput={searchInput} onSearchChange={setSearchInput}
          categoryInput={categoryInput} categoryOptions={categories} onCategoryChange={setCategoryInput}
          statusInput={statusInput} onStatusChange={setStatusInput}
          minPriceInput={minPriceInput} maxPriceInput={maxPriceInput}
          onMinPriceChange={setMinPriceInput} onMaxPriceChange={setMaxPriceInput}
          onFilter={handleFilter} onReset={handleResetFilters} onAdd={handleAdd}
        />

        <ProductTable
          products={products} loading={loading}
          onViewDetail={handleViewDetail}
          onToggleStatus={handleToggleStatus}
          onDelete={handleDelete}
        />
      </div>

      <Pagination currentPage={pageNumber} totalPages={totalPages} onPageChange={setPageIndex} />

      {showDetailModal && (
        <DetailModal
          product={selectedProduct}
          onClose={() => setShowDetailModal(false)}
          onEdit={handleEdit}
        />
      )}

      {showForm && (
        <div className="modal fade show d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)" }} tabIndex="-1">
          <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
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
