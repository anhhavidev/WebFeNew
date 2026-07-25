import React, { useEffect, useState } from "react";
import { useLocation, useParams, useNavigate } from "react-router-dom";
import UserLayout from "../../layout1/UserLayout";
import AddressSection from "./AddressSection";
import OrderSummary from "./OrderSummary";
import { getCartItems } from "../../Service/cartApi";
import { calculateShippingBySeller } from "../../Service/shippingApi";
import { checkoutOrder } from "../../Service/CheckoutApi";
import { createPaymentUrl } from "../../Service/paymentApi";
import { ROUTES } from "../../constants/routePaths";
import './CustomerPages.css';
import toast from "react-hot-toast";
import Swal from "sweetalert2";

export default function SimpleCheckoutPage() {
  const token = localStorage.getItem("token");
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [note, setNote] = useState("");
  const [method, setMethod] = useState("");
  const [error, setError] = useState("");
  const [shippingFees, setShippingFees] = useState({});
  const [cartItems, setCartItems] = useState([]);
  const navigate = useNavigate();
  const { orderId } = useParams();
  const location = useLocation();
  const selectedItems = location.state?.selectedItems || [];

  const sellerGroups = cartItems.reduce((groups, item) => {
    const key = item.sellerId;
    if (!groups[key]) {
      groups[key] = { sellerId: key, storeName: item.storeName, items: [], totalWeight: 0 };
    }
    groups[key].items.push(item);
    groups[key].totalWeight += (item.weight || 0) * item.soLuong;
    return groups;
  }, {});

  const sellerGroupsArray = Object.values(sellerGroups);
  const total = cartItems.reduce((acc, item) => acc + item.soLuong * item.donGia, 0);
  const totalShipping = Object.values(shippingFees).reduce((sum, fee) => sum + (fee?.shippingFee || 0), 0);

  useEffect(() => {
    if (selectedItems.length > 0) {
      setCartItems(selectedItems.map(item => ({
        ...item, soLuong: item.quantity, donGia: item.unitPrice, weight: item.weight
      })));
    } else {
      fetchCartItems();
    }
  }, [selectedItems]);

  async function fetchCartItems() {
    const res = await getCartItems(token);
    const data = res?.data?.cartItems;
    if (data) setCartItems(data);
  }

  useEffect(() => {
    if (selectedAddress?.province && selectedAddress?.district) {
      const fetchShipping = async () => {
        const newFees = {};
        for (const group of sellerGroupsArray) {
          const res = await calculateShippingBySeller(group.sellerId, selectedAddress.province, selectedAddress.district, token);
          if (res) newFees[group.sellerId] = res;
        }
        setShippingFees(newFees);
      };
      fetchShipping();
    }
  }, [selectedAddress, cartItems]);

  const handleOrder = async () => {
    if (!selectedAddress) return toast.error("Vui lòng chọn địa chỉ!");
    const payload = {
      adressId: selectedAddress.userAdressId,
      fullName: selectedAddress.fullName,
      phone: selectedAddress.phone,
      province: selectedAddress.province,
      district: selectedAddress.district,
      ward: selectedAddress.ward,
      address: selectedAddress.addressDetail,
      paymentMethod: method,
      note,
      productIds: cartItems.map(item => item.cartItemId),
    };
    try {
      const res = await checkoutOrder(payload, token);
      if (!res.isSuccess) return toast.error(" " + res.message);
      const result = res.message;
      if (method === "COD") {
        await Swal.fire({
          icon: 'success',
          title: 'Đặt hàng thành công!',
          text: 'Thanh toán khi nhận hàng.',
          confirmButtonColor: '#28a745'
        });
        const match = result.match(/#(\d+)/);
        const newOrderId = match ? match[1] : null;
        navigate(ROUTES.COD_RESULT, { state: { orderId: newOrderId } });
      } else {
        if (!result || typeof result !== "string") return toast.error("Không nhận được URL thanh toán hợp lệ.");
        window.location.href = result;
      }
    } catch (error) {
      console.error("Lỗi khi đặt hàng:", error);
      toast.error("Đặt hàng thất bại!");
    }
  };

  const handlePayment = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await createPaymentUrl(orderId, method, token);
      const url = res?.data?.url || res?.url || res;
      window.location.href = url;
    } catch (err) {
      setError(err.message || "Có lỗi xảy ra khi thanh toán.");
    }
  };

  return (
    <UserLayout>
      <div className="cp-container">
        <h1 className="cp-page-title">Thanh toán</h1>
        <div className="cp-checkout-layout">
          <div>
            <AddressSection token={token} onAddressChange={setSelectedAddress} />

            <div className="cp-card">
              <h2>💳 Phương thức thanh toán</h2>
              <label
                className={`cp-payment-option ${method === "COD" ? "selected" : ""}`}
                onClick={() => setMethod("COD")}
              >
                <input type="radio" name="payment" value="COD" checked={method === "COD"} onChange={(e) => setMethod(e.target.value)} />
                <span className="cp-payment-icon">📦</span>
                <div className="cp-payment-info">
                  <div className="cp-payment-name">Thanh toán khi nhận hàng (COD)</div>
                  <div className="cp-payment-desc">Thanh toán bằng tiền mặt khi nhận hàng</div>
                </div>
              </label>

              <label
                className={`cp-payment-option ${method === "VNPAY" ? "selected" : ""}`}
                onClick={() => setMethod("VNPAY")}
              >
                <input type="radio" name="payment" value="VNPAY" checked={method === "VNPAY"} onChange={(e) => setMethod(e.target.value)} />
                <span className="cp-payment-icon">🌐</span>
                <div className="cp-payment-info">
                  <div className="cp-payment-name">VNPAY (Ví/QR)</div>
                  <div className="cp-payment-desc">Thanh toán qua ví VNPAY hoặc quét mã QR</div>
                </div>
              </label>

              <div className="cp-form-group mt-3">
                <label className="cp-form-label">Ghi chú đơn hàng</label>
                <textarea
                  className="cp-form-textarea"
                  placeholder="Ghi chú cho đơn hàng (ví dụ: giao giờ hành chính)"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div>
            <OrderSummary
              sellerGroupsArray={sellerGroupsArray}
              shippingFees={shippingFees}
              total={total}
              totalShipping={totalShipping}
              onOrder={handleOrder}
              onBackToCart={() => navigate(ROUTES.CART)}
            />
          </div>
        </div>
      </div>
    </UserLayout>
  );
}
