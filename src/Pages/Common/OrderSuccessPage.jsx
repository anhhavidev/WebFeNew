// src/pages/order/OrderSuccessPage.jsx
import UserLayout from '../../layout1/UserLayout';

export default function OrderSuccessPage() {
  return (
    <UserLayout>
      <div className="container my-5">
        <div className="card p-4 shadow" style={{ maxWidth: '600px', margin: '0 auto' }}>
          <h3 className="text-center text-success">✅ Đặt hàng thành công</h3>
          <hr />
          <p>Cảm ơn bạn đã đặt hàng. Chúng tôi sẽ liên hệ và giao hàng trong thời gian sớm nhất.</p>
          <div className="text-center mt-4">
            <a href="/" className="btn btn-primary">Về trang chủ</a>
          </div>
        </div>
      </div>
    </UserLayout>
  );
}
