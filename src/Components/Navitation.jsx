import React, { useEffect, useState } from "react";
import { getAllCategories } from "../Service/categoryApi";
import { Link, useSearchParams } from "react-router-dom";
import '../Pages/Common/CustomerPages.css';

export default function Navitation() {
  const [categories, setCategories] = useState([]);
  const [searchParams] = useSearchParams();
  const selectedCategory = searchParams.get("category");

  useEffect(() => {
    const fetchData = async () => {
      const data = await getAllCategories();
      setCategories(data);
    };
    fetchData();
  }, []);

  return (
    <nav className="cp-nav">
      <div className="cp-nav-inner">
        <Link
          to="/?page=1"
          className={`cp-nav-link ${!selectedCategory ? "active" : ""}`}
        >
          Tất cả
        </Link>

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
