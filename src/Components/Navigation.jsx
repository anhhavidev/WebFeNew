// Component hiển thị thanh điều hướng danh mục sản phẩm
import React, { useEffect, useState } from "react";
import { getAllCategories } from "../Service/categoryApi";
import { Link, useSearchParams } from "react-router-dom";
import { ROUTES } from "../constants/routePaths";
import '../Pages/Common/CustomerPages.css';

export default function Navigation() {
  // State lưu danh sách danh mục từ API
  const [categories, setCategories] = useState([]);
  const [searchParams] = useSearchParams();
  // Lấy category hiện tại từ URL params
  const selectedCategory = searchParams.get("category");

  // Gọi API lấy danh mục khi component mount
  useEffect(() => {
    const fetchData = async () => {
      const data = await getAllCategories();
      setCategories(data?.data || []);
    };
    fetchData();
  }, []);

  return (
    <nav className="cp-nav">
      <div className="cp-nav-inner">
        {/* Link "Tất cả" - hiển thị khi không có category nào được chọn */}
        <Link
          to={ROUTES.HOME + "?page=1"}
          className={`cp-nav-link ${!selectedCategory ? "active" : ""}`}
        >
          Tất cả
        </Link>

        {/* Duyệt danh sách danh mục và tạo link cho từng category */}
        {categories.map((category) => (
          <Link
            key={category.categoryid}
            to={`/?page=1&category=${encodeURIComponent(category.categoryid)}`}
            className={`cp-nav-link ${
              selectedCategory === category.categoryid.toString() ? "active" : ""
            }`}
          >
            {category.name}
          </Link>
        ))}
      </div>
    </nav>
  );
}
