// import React, { useState } from "react";
// import Dashboard from "../layout1/Dashboard";
// import { useNavigate } from "react-router-dom";
// import { addProductWithImage } from "../Service/ProductApi"; // ✅ hàm gọi API dùng FormData

// export default function ProductCreate() {
//   const [name, setName] = useState("");
//   const [price, setPrice] = useState("");
//   const [description, setDescription] = useState("");
//   const [categoryId, setCategoryId] = useState(1);
//   const [stockQuantity, setStockQuantity] = useState(1);
//   const [image, setImage] = useState(null);
//   const navigate = useNavigate();

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     const product = {
//       name,
//       price: Number(price),
//       description,
//       categoryId: Number(categoryId),
//       stockQuantity: Number(stockQuantity),
//       image,
//     };

//     try {
//       await addProductWithImage(product);
//       alert("Thêm sản phẩm thành công");
//       navigate("/products"); // 👉 điều hướng về trang danh sách
//     } catch (err) {
//       console.error("Lỗi thêm sản phẩm:", err);
//       alert("Thêm sản phẩm thất bại");
//     }
//   };

//   return (
//     <Dashboard>
//       <h3>➕ Thêm sản phẩm</h3>
//       <form onSubmit={handleSubmit}>
//         <input
//           className="form-control mb-2"
//           placeholder="Tên sản phẩm"
//           value={name}
//           onChange={(e) => setName(e.target.value)}
//           required
//         />
//         <input
//           className="form-control mb-2"
//           type="number"
//           placeholder="Giá"
//           value={price}
//           onChange={(e) => setPrice(e.target.value)}
//           required
//         />
//         <textarea
//           className="form-control mb-2"
//           placeholder="Mô tả"
//           value={description}
//           onChange={(e) => setDescription(e.target.value)}
//         />
//         <input
//           className="form-control mb-2"
//           type="number"
//           placeholder="Tồn kho"
//           value={stockQuantity}
//           onChange={(e) => setStockQuantity(e.target.value)}
//           required
//         />
//         <input
//           className="form-control mb-2"
//           type="number"
//           placeholder="ID Danh mục"
//           value={categoryId}
//           onChange={(e) => setCategoryId(e.target.value)}
//           required
//         />
//         <input
//           className="form-control mb-2"
//           type="file"
//           accept=".jpg,.png"
//           onChange={(e) => setImage(e.target.files[0])}
//           required
//         />
//         <button className="btn btn-success" type="submit">
//           Lưu
//         </button>
//       </form>
//     </Dashboard>
//   );
// }
