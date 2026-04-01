import React from 'react';
import '../Pages/Common/CustomerPages.css';

export default function Footer() {
  return (
    <footer className="cp-footer">
      <div className="cp-footer-inner">
        <div>
          <h4>Về chúng tôi</h4>
          <p>Shop thời trang hàng đầu tại Việt Nam. Uy tín - Chất lượng - Giá tốt nhất.</p>
          <div className="cp-footer-social">
            <a href="#">📘</a>
            <a href="#">📸</a>
            <a href="#">💬</a>
          </div>
        </div>
        <div>
          <h4>Hỗ trợ khách hàng</h4>
          <ul className="cp-footer-links">
            <li><a href="#">Hướng dẫn mua hàng</a></li>
            <li><a href="#">Chính sách đổi trả</a></li>
            <li><a href="#">Phương thức thanh toán</a></li>
            <li><a href="#">Chính sách bảo mật</a></li>
          </ul>
        </div>
        <div>
          <h4>Liên hệ</h4>
          <ul className="cp-footer-links">
            <li>📍 123 Đường ABC, Quận 1, TP.HCM</li>
            <li>📞 093.934.8888</li>
            <li>✉️ support@webclothes.vn</li>
          </ul>
        </div>
      </div>
      <div className="cp-footer-bottom">
        © 2026 WebClothes. All rights reserved.
      </div>
    </footer>
  );
}
