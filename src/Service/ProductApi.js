const API_URL = "http://localhost:5230/api/Product";

// Lấy tất cả sản phẩm
export async function getAllProducts() {
  try {
    const response = await fetch(`${API_URL}/all`);
    if (!response.ok) throw new Error("Lỗi API sản phẩm");
    return await response.json();
  } catch (error) {
    console.error(error);
    return [];
  }
}
export const getPaginatedProducts = async (filter = {}) => {
  const query = new URLSearchParams();

  // Duyệt qua các filter truyền lên
  Object.entries(filter).forEach(([key, value]) => {
    if (value !== null && value !== undefined && value !== '') {
      query.append(key, value);
    }
  });

  const url = `http://localhost:5230/api/Product/paging?${query.toString()}`;

  const response = await fetch(url);
  if (!response.ok) throw new Error("Lỗi khi gọi API sản phẩm");

  return await response.json(); // PageResult<ProductDTO>
};
export const getPaginatedProductAdmin = async (filter = {}) => {
  const query = new URLSearchParams();

  // Duyệt qua các filter truyền lên
  Object.entries(filter).forEach(([key, value]) => {
    if (value !== null && value !== undefined && value !== '') {
      query.append(key, value);
    }
  });

  const url = `http://localhost:5230/api/Product/admin/paging?${query.toString()}`;

  // 👇 Lấy token từ localStorage (đặt khi login)
  const token = localStorage.getItem("token");

  const response = await fetch(url, {
    headers: {
      "Authorization": `Bearer ${token}`, // 👈 truyền token ở đây
    },
  });

  if (!response.ok) throw new Error("Lỗi khi gọi API sản phẩm");

  return await response.json(); // PageResult<ProductDTO>
};


// Lấy sản phẩm theo danh mục
export async function getProductsByCategory(categoryId) {
  try {
    const response = await fetch(`${API_URL}/by-category/${categoryId}`);
    if (!response.ok) throw new Error("Lỗi API sản phẩm theo danh mục");
    return await response.json();
  } catch (error) {
    console.error(error);
    return [];
  }
}

// Thêm sản phẩm (POST)
export async function addProduct(product) {
  try {
    const response = await fetch(`${API_URL}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(product),
    });
    if (!response.ok) throw new Error("Thêm sản phẩm thất bại");
    return await response.json();
  } catch (error) {
    console.error(error);
    throw error;
  }
}
// Thêm sản phẩm có ảnh
export async function addProductWithImage(product) {
  try {
    const formData = new FormData();
    formData.append("name", product.name);
    formData.append("description", product.description);
    formData.append("price", product.price);
    formData.append("stockQuantity", product.stockQuantity);
    formData.append("categoryId", product.categoryId);
    formData.append("image", product.image); // ⬅️ trùng với tên trong ProductRequest (BE)

    const response = await fetch("http://localhost:5230/api/Product", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Thêm sản phẩm thất bại");
    }

    return await response.json();
  } catch (error) {
    console.error("API thêm sản phẩm:", error);
    throw error;
  }
}

// Sửa sản phẩm (PUT)
export async function updateProduct(id, product) {
  try {
    const response = await fetch(`${API_URL}/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(product),
    });
    if (!response.ok) throw new Error("Cập nhật sản phẩm thất bại");
    return await response.json();
  } catch (error) {
    console.error(error);
    throw error;
  }
}

// Xóa sản phẩm (DELETE)
export async function deleteProduct(id) {
  try {
    const response = await fetch(`${API_URL}/${id}`, {
      method: "DELETE",
    });
    if (!response.ok) throw new Error("Xóa sản phẩm thất bại");
    return await response.json();
  } catch (error) {
    console.error(error);
    throw error;
  }
}



export async function getCategories() {
  try {
    const response = await fetch('http://localhost:5230/api/Category/all');
    if (!response.ok) throw new Error('Lỗi API danh mục');
    return await response.json();
  } catch (error) {
    console.error(error);
    return [];
  }
}
