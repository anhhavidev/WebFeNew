import React from 'react';
import { Link } from 'react-router-dom';
import UserLayout from '../../layout1/UserLayout';
import { FaCheckCircle, FaReceipt, FaShoppingBag } from 'react-icons/fa';
import styles from './VnpayResultPage.module.css'; // Reusing the same beautiful styles

export default function OrderSuccessPage() {
  return (
    <UserLayout>
      <div className={styles.resultContainer}>
        <div className={styles.resultCard}>
          <div className={styles.iconWrapper}>
            <FaCheckCircle className={styles.successIcon} />
          </div>

          <h1 className={styles.title}>Đặt hàng thành công!</h1>
          <p className="text-muted">
            Cảm ơn bạn đã tin tưởng mua sắm. Đơn hàng của bạn đã được tiếp nhận và đang trong quá trình xử lý.
          </p>

          <div className={styles.infoList}>
            <div className="text-center py-2">
              <p className="mb-0 text-muted small">Chúng tôi sẽ liên hệ sớm nhất để xác nhận đơn hàng của bạn.</p>
            </div>
          </div>

          <div className={styles.actions}>
            <Link to="/" className={styles.btnHome}>
              <FaShoppingBag className="me-2" /> Tiếp tục mua sắm
            </Link>
            <Link to="/user/orders" className={styles.btnOrder}>
              <FaReceipt className="me-2" /> Xem đơn hàng của tôi
            </Link>
          </div>
        </div>
      </div>
    </UserLayout>
  );
}
