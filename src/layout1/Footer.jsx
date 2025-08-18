// src/Components/Footer.jsx
import React from 'react';
import styles from './Footer.module.css';

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.columns}>
        <div>
          <h4>Về chúng tôi</h4>
          <p>Shop thời trang hàng đầu tại Việt Nam. Uy tín - Chất lượng - Giá tốt</p>
        </div>
        <div>
          <h4>Hỗ trợ</h4>
          <ul>
            <li><a href="#">Hướng dẫn mua hàng</a></li>
            <li><a href="#">Chính sách đổi trả</a></li>
            <li><a href="#">Liên hệ</a></li>
          </ul>
        </div>
        <div>
          <h4>Theo dõi</h4>
          <ul>
            <li><a href="#">Facebook</a></li>
            <li><a href="#">Instagram</a></li>
            <li><a href="#">Zalo</a></li>
          </ul>
        </div>
      </div>
      <div className={styles.copy}>
        © 2025 WebClothes. All rights reserved.
      </div>
    </footer>
  );
}
