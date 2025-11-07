import React, { useEffect, useState } from "react";
import styles from "./Navitation.module.css";
import { getAllCategories } from "../Service/categoryApi";
import { Link, useSearchParams } from "react-router-dom";

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
    <nav className={styles.navbar}>
      <ul className={styles.navList}>
        <li className={styles.navItem}>
          <Link
            to="/?page=1"
            className={`${styles.navLink} ${!selectedCategory ? styles.active : ""}`}
          >
            Tất cả
          </Link>
        </li>

        {categories.map((category) => (
          <li key={category.categoryid} className={styles.navItem}>
            <Link
              to={`/?page=1&category=${encodeURIComponent(category.categoryid)}`}
              className={`${styles.navLink} ${
                selectedCategory === category.categoryid.toString() ? styles.active : ""
              }`}
            >
              {category.name}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
