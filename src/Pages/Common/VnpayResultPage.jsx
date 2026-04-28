import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import UserLayout from '../../layout1/UserLayout';
import { FaCheckCircle, FaTimesCircle, FaReceipt, FaUndo } from 'react-icons/fa';
import styles from './VnpayResultPage.module.css';

export default function PaymentResultPage() {
  const { search } = useLocation();
  const query = new URLSearchParams(search);

  const success = query.get('success') === 'true';
  const orderId = query.get('orderId');
  const transactionId = query.get('transactionId');
  const vnPayCode = query.get('vnPayCode');

  return (
    <UserLayout>
      <div className={styles.resultContainer}>
        <div className={styles.resultCard}>
          <div className={styles.iconWrapper}>
            {success ? (
              <FaCheckCircle className={styles.successIcon} />
            ) : (
              <FaTimesCircle className={styles.errorIcon} />
            )}
          </div>

          <h1 className={styles.title}>
            {success ? 'Thanh toán thành công!' : 'Thanh toán thất bại'}
          </h1>
          <p className="text-muted">
            {success 
              ? 'Cảm ơn bạn đã tin tưởng mua sắm tại cửa hàng của chúng tôi.' 
              : 'Giao dịch của bạn không thể hoàn tất. Vui lòng thử lại hoặc chọn phương thức khác.'}
          </p>

          <div className={styles.infoList}>
            <div className={styles.infoItem}>
              <span className={styles.label}>Mã đơn hàng:</span>
              <span className={styles.value}>#{orderId}</span>
            </div>
            {transactionId && (
              <div className={styles.infoItem}>
                <span className={styles.label}>Mã giao dịch:</span>
                <span className={styles.value}>{transactionId}</span>
              </div>
            )}
            <div className={styles.infoItem}>
              <span className={styles.label}>Phản hồi VNPAY:</span>
              <span className={styles.value}>{vnPayCode}</span>
            </div>
          </div>

          <div className={styles.actions}>
            <Link to="/" className={styles.btnHome}>
              Tiếp tục mua sắm
            </Link>
            {success ? (
              <Link to={`/user/orders/${orderId}`} className={styles.btnOrder}>
                <FaReceipt className="me-1" /> Chi tiết đơn hàng
              </Link>
            ) : (
              <Link to={`/payment/retry/${orderId}`} className={styles.btnOrder}>
                <FaUndo className="me-1" /> Thử lại
              </Link>
            )}
          </div>
        </div>
      </div>
    </UserLayout>
  );
}
