import { FaFacebookF, FaInstagram, FaYoutube, FaMapMarkerAlt, FaPhoneAlt, FaEnvelope, FaPaperPlane } from 'react-icons/fa';

export default function Footer() {
  return (
    <footer className="cp-footer">
      <div className="cp-footer-inner">
        <div className="cp-footer-col">
          <h4 className="cp-footer-logo">WEBCLOTHES</h4>
          <p className="cp-footer-about">
            Định nghĩa lại phong cách của bạn với những bộ trang phục được thiết kế riêng. 
            Sứ mệnh của chúng tôi là mang lại sự tự tin qua thời trang cao cấp.
          </p>
          <div className="cp-footer-social">
            <a href="#" className="facebook"><FaFacebookF /></a>
            <a href="#" className="instagram"><FaInstagram /></a>
            <a href="#" className="youtube"><FaYoutube /></a>
          </div>
        </div>

        <div className="cp-footer-col">
          <h4>Dịch vụ khách hàng</h4>
          <ul className="cp-footer-links">
            <li><a href="#">Hướng dẫn mua hàng</a></li>
            <li><a href="#">Chính sách đổi trả</a></li>
            <li><a href="#">Phương thức thanh toán</a></li>
            <li><a href="#">Theo dõi đơn hàng</a></li>
            <li><a href="#">Hệ thống cửa hàng</a></li>
          </ul>
        </div>

        <div className="cp-footer-col">
          <h4>Thông tin liên hệ</h4>
          <ul className="cp-footer-contact">
            <li><FaMapMarkerAlt className="icon" /> 123 Đường ABC, Quận 1, TP.HCM</li>
            <li><FaPhoneAlt className="icon" /> 093.934.8888</li>
            <li><FaEnvelope className="icon" /> support@webclothes.vn</li>
          </ul>
        </div>

        <div className="cp-footer-newsletter">
          <h4>Đăng ký nhận tin</h4>
          <p>Nhận ngay thông báo về bộ sưu tập mới nhất và các ưu đãi độc quyền.</p>
          <div className="cp-newsletter-form">
            <input type="email" placeholder="Email của bạn..." />
            <button><FaPaperPlane /></button>
          </div>
        </div>
      </div>
      <div className="cp-footer-bottom">
        <div className="cp-footer-bottom-inner">
          <p>© 2026 WEBCLOTHES. Phát triển bởi AI Tư vấn Fashion.</p>
          <div className="cp-footer-payment-methods">
            <img src="https://img.icons8.com/color/48/000000/visa.png" alt="Visa" />
            <img src="https://img.icons8.com/color/48/000000/mastercard.png" alt="Mastercard" />
            <img src="https://img.icons8.com/color/48/000000/paypal.png" alt="Paypal" />
          </div>
        </div>
      </div>
    </footer>
  );
}
