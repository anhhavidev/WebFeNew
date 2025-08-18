import React from 'react';
import { useLocation } from 'react-router-dom';
import UserLayout from '../../layout1/UserLayout';

export default function PaymentResultPage() {
  const { search } = useLocation();
  const query = new URLSearchParams(search);

  const success = query.get('success') === 'true';
  const orderId = query.get('orderId');
  const transactionId = query.get('transactionId');
  const vnPayCode = query.get('vnPayCode');

  return (
    <UserLayout>
      <div className="container my-5">
        <div className="card p-4 shadow" style={{ maxWidth: '600px', margin: '0 auto' }}>
          <h3 className={`text-center ${success ? 'text-success' : 'text-danger'}`}>
            {success ? '✅ Thanh toán thành công' : '❌ Thanh toán thất bại'}
          </h3>

          <hr />

          <div>
            <p><strong>Mã đơn hàng:</strong> {orderId}</p>
            <p><strong>Mã giao dịch:</strong> {transactionId}</p>
            <p><strong>Mã phản hồi VNPAY:</strong> {vnPayCode}</p>
          </div>

          <div className="text-center mt-4">
            <a href="/" className="btn btn-primary">Về trang chủ</a>
          </div>
        </div>
      </div>
    </UserLayout>
  );
}
