import React, { useEffect, useState } from "react";
import Dashboard from "../layout1/Dashboard";
import { getAllProducts, addProductWithImage } from "../Service/ProductApi";
import ProductForm from "./ProductForm";

export default function CrudProduct() {
  const [products, setProducts] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editProduct, setEditProduct] = useState(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    const data = await getAllProducts();
    setProducts(data);
  };

  const handleAddProduct = async (product) => {
    try {
      await addProductWithImage(product);
      setShowForm(false);
      setEditProduct(null);
      fetchProducts();
    } catch (error) {
      console.error("Lỗi khi thêm sản phẩm:", error);
      alert("Thêm sản phẩm thất bại!");
    }
  };

  const handleEdit = (product) => {
    setEditProduct(product);
    setShowForm(true);
  };

  const handleDelete = async (productId) => {
    if (window.confirm("Bạn có chắc muốn xóa sản phẩm này không?")) {
      await fetch(`https://localhost:7095/api/Product/${productId}`, {
        method: "DELETE",
      });
      fetchProducts();
    }
  };

  return (
    <Dashboard>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3>📦 Danh sách sản phẩm</h3>
        <button
          className="btn btn-success"
          onClick={() => {
            setEditProduct(null);
            setShowForm(true);
           
          }}
        >
          Thêm sản phẩm
        </button>
      </div>

      <table className="table table-bordered table-hover">
        <thead className="table-dark">
          <tr>
            <th>ID</th>
            <th>Tên</th>
            <th>Giá</th>
            <th>Hình</th>
            <th>Thao tác</th>
          </tr>
        </thead>
     <tbody>
  {products.length === 0 ? (
    <tr>
      <td colSpan="5" className="text-center">Không có sản phẩm</td>
    </tr>
  ) : (
    products.map((p) => (
      <tr key={p.productId}>
        <td>{p.productId}</td>
        <td>{p.name}</td>
        <td>{p.finalPrice != null ? p.finalPrice.toLocaleString() : "0"} đ</td>
        <td>
          <img
            src={p.linkImage || p.LinkImage} // nếu backend trả PascalCase thì dùng p.LinkImage
            height="50"
            style={{ borderRadius: "4px" }}
            alt={p.name}
          />
        </td>
        <td>
          <button className="btn btn-primary btn-sm me-2" onClick={() => handleEdit(p)}>Sửa</button>
          <button className="btn btn-danger btn-sm" onClick={() => handleDelete(p.productId)}>Xóa</button>
        </td>
      </tr>
    ))
  )}
</tbody>

      </table>

      {showForm && (
        <div className="modal d-block" tabIndex="-1" role="dialog">
          <div className="modal-dialog" role="document">
            <div className="modal-content p-3">
              <h5>{editProduct ? "🛠️ Sửa sản phẩm" : "➕ Thêm sản phẩm"}</h5> 
              {/* nếu  */}
              <ProductForm
                initialData={editProduct}
                onSubmit={handleAddProduct}
                onClose={() => {
                  setShowForm(false);
                  setEditProduct(null);
                }}
              />
            </div>
          </div>
        </div>
      )}
    </Dashboard>
  );
}
