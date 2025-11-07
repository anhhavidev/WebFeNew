// import React, { useState, useEffect } from "react";
// import "bootstrap/dist/css/bootstrap.min.css";
// import { getCategories, getPaginatedProductSeller, addProduct, updateProduct, deleteProduct } from "../Service/ProductApi";
// import ProductForm from "./Helpper/ProductForm";

// const SellerProducts = ({ currentSellerId }) => {
//   const [products, setProducts] = useState([]);
//   const [categories, setCategories] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [editingProductId, setEditingProductId] = useState(null);
//   const [showForm, setShowForm] = useState(false);

//   // Filter
//   const [searchInput, setSearchInput] = useState("");
//   const [categoryInput, setCategoryInput] = useState("");
//   const [statusInput, setStatusInput] = useState("");
//   const [minPriceInput, setMinPriceInput] = useState("");
//   const [maxPriceInput, setMaxPriceInput] = useState("");

//   const [search, setSearch] = useState("");
//   const [category, setCategory] = useState("");
//   const [status, setStatus] = useState("");
//   const [minPrice, setMinPrice] = useState(null);
//   const [maxPrice, setMaxPrice] = useState(null);

//   const [pageNumber, setPageNumber] = useState(1);
//   const [pageSize] = useState(8);
//   const [totalPages, setTotalPages] = useState(1);

//   useEffect(() => {
//     fetchData();
//   }, [search, category, status, minPrice, maxPrice, pageNumber]);

//   const fetchData = async () => {
//     setLoading(true);
//     try {
//       if (categories.length === 0) {
//         const catData = await getCategories();
//         setCategories(catData.data);
//       }

//       const filter = {
//         pageNumber,
//         pageSize,
//         keyword: search,
//         CategoryId: category,
//         minprice: minPrice,
//         maxprice: maxPrice,
//         sellerId: currentSellerId,
//         status: status ? parseInt(status) : null
//       };

//       const productData = await getPaginatedProductSeller(filter);
//       setProducts(productData.items || []);
//       setTotalPages(productData.totalPages || 1);
//     } catch (error) {
//       console.error("Lỗi tải dữ liệu:", error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleFilter = () => {
//     setSearch(searchInput);
//     setCategory(categoryInput);
//     setStatus(statusInput);
//     setMinPrice(minPriceInput.trim() ? Number(minPriceInput) : null);
//     setMaxPrice(maxPriceInput.trim() ? Number(maxPriceInput) : null);
//     setPageNumber(1);
//   };

//   const handleResetFilters = () => {
//     setSearchInput(""); setCategoryInput(""); setStatusInput(""); setMinPriceInput(""); setMaxPriceInput("");
//     setSearch(""); setCategory(""); setStatus(""); setMinPrice(null); setMaxPrice(null);
//     setPageNumber(1);
//   };

//   const handleAdd = () => { setEditingProductId(null); setShowForm(true); };
//   const handleEdit = (product) => { setEditingProductId(product.id); setShowForm(true); };
//   const handleSave = async (data) => {
//     try {
//       data.sellerId = currentSellerId;
//       if (editingProductId) await updateProduct(editingProductId, data);
//       else await addProduct(data);
//       setShowForm(false); fetchData();
//     } catch (error) { console.error("Lỗi lưu sản phẩm:", error); }
//   };

//   const handleDelete = async (id) => {
//     if (window.confirm("Bạn có chắc muốn xóa sản phẩm này?")) {
//       try { await deleteProduct(id); fetchData(); }
//       catch (error) { console.error("Lỗi xóa sản phẩm:", error); }
//     }
//   };

//   if (loading) return <div className="p-3">Đang tải sản phẩm...</div>;

//   return (
//     <div className="p-3">
//       <div className="d-flex justify-content-between mb-3">
//         <h4>Quản lý sản phẩm</h4>
//         <button className="btn btn-primary" onClick={handleAdd}>Thêm sản phẩm</button>
//       </div>

//       {/* Filter */}
//       <div className="row g-2 mb-3">
//         <div className="col-md-3"><input type="text" className="form-control" placeholder="Tìm kiếm" value={searchInput} onChange={e=>setSearchInput(e.target.value)} /></div>
//         <div className="col-md-3">
//           <select className="form-select" value={categoryInput} onChange={e=>setCategoryInput(e.target.value)}>
//             <option value="">Danh mục</option>
//             {categories.map(c=><option key={c.categoryid} value={c.categoryid}>{c.name}</option>)}
//           </select>
//         </div>
//         <div className="col-md-2"><input type="number" className="form-control" placeholder="Giá từ" value={minPriceInput} onChange={e=>setMinPriceInput(e.target.value)} /></div>
//         <div className="col-md-2"><input type="number" className="form-control" placeholder="Đến giá" value={maxPriceInput} onChange={e=>setMaxPriceInput(e.target.value)} /></div>
//         <div className="col-md-2 d-flex gap-1">
//           <button className="btn btn-primary w-100" onClick={handleFilter}>Tìm</button>
//           <button className="btn btn-secondary w-100" onClick={handleResetFilters}>Xóa</button>
//         </div>
//       </div>

//       {/* Table */}
//       <table className="table table-bordered align-middle">
//         <thead className="table-light">
//           <tr><th>STT</th><th>Ảnh</th><th>Tên sản phẩm</th><th>Giá</th><th>Tồn kho</th><th>Trạng thái</th><th>Hành động</th></tr>
//         </thead>
//         <tbody>
//           {products.length ? products.map((p,index)=>(
//             <tr key={p.id}>
//               <td>{(pageNumber-1)*pageSize+index+1}</td>
//               <td><img src={p.imageUrl} alt={p.name} style={{width:"50px",height:"50px",objectFit:"cover"}} /></td>
//               <td>{p.name}</td>
//               <td>{p.disCountPrice} đ</td>
//               <td>{p.stockQuantity}</td>
//               <td>{p.statuss}</td>
//               <td>
//                 <button className="btn btn-sm btn-warning me-1" onClick={()=>handleEdit(p)}>Sửa</button>
//                 <button className="btn btn-sm btn-danger" onClick={()=>handleDelete(p.id)}>Xóa</button>
//               </td>
//             </tr>
//           )) : <tr><td colSpan="7" className="text-center">Không có sản phẩm</td></tr>}
//         </tbody>
//       </table>

//       {/* Pagination */}
//       <nav>
//         <ul className="pagination justify-content-center">
//           <li className={`page-item ${pageNumber===1?"disabled":""}`}><button className="page-link" onClick={()=>setPageNumber(p=>Math.max(1,p-1))}>Trước</button></li>
//           {Array.from({length:totalPages},(_,i)=>i+1).map(num=>(
//             <li key={num} className={`page-item ${pageNumber===num?"active":""}`}><button className="page-link" onClick={()=>setPageNumber(num)}>{num}</button></li>
//           ))}
//           <li className={`page-item ${pageNumber===totalPages?"disabled":""}`}><button className="page-link" onClick={()=>setPageNumber(p=>Math.min(totalPages,p+1))}>Sau</button></li>
//         </ul>
//       </nav>

//       {showForm && <div className="modal fade show d-block">
//         <div className="modal-dialog modal-lg">
//           <div className="modal-content">
//             <div className="modal-header">
//               <h5 className="modal-title">{editingProductId ? "Sửa sản phẩm" : "Thêm sản phẩm"}</h5>
//               <button type="button" className="btn-close" onClick={()=>setShowForm(false)}></button>
//             </div>
//             <div className="modal-body">
//               <ProductForm categories={categories} productId={editingProductId} onSave={handleSave} onCancel={()=>setShowForm(false)} />
//             </div>
//           </div>
//         </div>
//       </div>}

//     </div>
//   );
// };

// export default SellerProducts;
