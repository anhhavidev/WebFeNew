// Hook lấy danh sách sản phẩm (có lọc theo danh mục)
import { useEffect, useState } from "react";
import { getAllProducts, getProductsByCategory } from "../Service/ProductApi";

export default function useProducts(categoryId) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = categoryId
          ? await getProductsByCategory(categoryId)
          : await getAllProducts();
        setProducts(data.data || data || []);
      } catch (error) {
        console.error("Lỗi khi gọi API sản phẩm:", error);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [categoryId]);

  return { products, loading };
}
