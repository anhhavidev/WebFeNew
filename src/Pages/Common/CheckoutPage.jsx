import React, { useEffect, useState } from "react";
import { GetAllUserAddresses, AddUserAddress } from "../../Service/addressApi";
import { checkoutOrder } from "../../Service/CheckoutApi";
import UserLayout from "../../layout1/UserLayout";
import { getCartItems } from "../../Service/cartApi";
import { getProvinces, getDistricts, getWards } from "../../Service/locationApi";
import { calculateShippingBySeller } from "../../Service/shippingApi";
import { useLocation } from "react-router-dom";
import { DeleteAddress, UpdateAddress } from "../../Service/addressApi";
import { useParams, useNavigate } from "react-router-dom";
import { createPaymentUrl } from "../../Service/paymentApi";
import './CustomerPages.css';
import toast from "react-hot-toast";
import Swal from "sweetalert2";

export default function SimpleCheckoutPage() {
  const token = localStorage.getItem("token");
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [note, setNote] = useState("");
  const [mode, setMode] = useState("view");
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);
  const [provinceMap, setProvinceMap] = useState({});
  const [districtMap, setDistrictMap] = useState({});
  const [shippingInfo, setShippingInfo] = useState(null);
  const [wardMap, setWardMap] = useState({});
  const [editAdress, SeteditAdress] = useState(null);
  const { orderId } = useParams();
  const [method, setMethod] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const [shippingFees, setShippingFees] = useState({});

  const location = useLocation();
  const selectedItems = location.state?.selectedItems || [];

  const handlePayment = async () => {
    try {
      const token = localStorage.getItem("token");
      const url = await createPaymentUrl(orderId, method, token);
      window.location.href = url;
    } catch (err) {
      setError(err.message || "Có lỗi xảy ra khi thanh toán.");
    }
  };

  const [formData, setFormData] = useState({
    fullName: "", phone: "", province: "", district: "", ward: "", addressDetail: "", isDefault: false
  });

  const [cartItems, setCartItems] = useState([]);

  const sellerGroups = cartItems.reduce((groups, item) => {
    const key = item.sellerId;
    if (!groups[key]) {
      groups[key] = { sellerId: key, storeName: item.storeName, items: [], totalWeight: 0 };
    }
    groups[key].items.push(item);
    groups[key].totalWeight += (item.weight || 0) * item.soLuong;
    return groups;
  }, {});

  const totalShipping = Object.values(shippingFees).reduce((sum, fee) => sum + (fee?.shippingFee || 0), 0);
  const sellerGroupsArray = Object.values(sellerGroups);
  const total = cartItems.reduce((acc, item) => acc + item.soLuong * item.donGia, 0);
  const [shippingFee, setShippingFee] = useState("Vui lòng chọn địa chỉ");

  useEffect(() => {
    const fetchInitial = async () => {
      const data = await getProvinces();
      setProvinces(data);
      const map = {};
      data.forEach(p => map[p.id] = p.name);
      setProvinceMap(map);
    };
    fetchInitial();
  }, []);

  useEffect(() => {
    const loadAllAddressMaps = async () => {
      const provinceData = await getProvinces();
      const provinceMapTemp = {};
      provinceData.forEach(p => provinceMapTemp[p.id] = p.name);
      setProvinceMap(provinceMapTemp);
      const allDistrictMap = {};
      const allWardMap = {};
      for (const addr of addresses) {
        if (addr.province && !districtMap[addr.province]) {
          const districts = await getDistricts(addr.province);
          districts.forEach(d => allDistrictMap[d.id] = d.name);
        }
        if (addr.district && !wardMap[addr.district]) {
          const wards = await getWards(addr.district);
          wards.forEach(w => allWardMap[w.id] = w.name);
        }
      }
      setDistrictMap(prev => ({ ...prev, ...allDistrictMap }));
      setWardMap(prev => ({ ...prev, ...allWardMap }));
    };
    if (addresses.length > 0) loadAllAddressMaps();
  }, [addresses]);

  const handleProvinceChange = async (e) => {
    const province = e.target.value;
    setFormData((prev) => ({ ...prev, province, district: "", ward: "" }));
    const districtData = await getDistricts(province);
    setDistricts(districtData);
    const map = {};
    districtData.forEach(d => map[d.id] = d.name);
    setDistrictMap(map);
    setWards([]);
  };

  const handleDistrictChange = async (e) => {
    const district = e.target.value;
    setFormData((prev) => ({ ...prev, district, ward: "" }));
    const data = await getWards(district);
    setWards(data);
    const wardMapping = {};
    data.forEach(w => wardMapping[w.id] = w.name);
    setWardMap(wardMapping);
  };

  useEffect(() => {
    if (selectedAddress?.province && selectedAddress?.district) {
      const provinceName = provinceMap[selectedAddress.province] || selectedAddress.province;
      const districtName = districtMap[selectedAddress.district] || selectedAddress.district;
      const fetchShipping = async () => {
        const newFees = {};
        for (const group of sellerGroupsArray) {
          const res = await calculateShippingBySeller(group.sellerId, provinceName, districtName, token);
          if (res) newFees[group.sellerId] = res;
        }
        setShippingFees(newFees);
      };
      fetchShipping();
    }
  }, [selectedAddress, provinceMap, districtMap, cartItems]);

  useEffect(() => {
    const fetchData = async () => { await fetchAddresses(); };
    fetchData();
  }, [token]);

  useEffect(() => {
    if (selectedItems.length > 0) {
      setCartItems(selectedItems.map(item => ({
        ...item, soLuong: item.quantity, donGia: item.unitPrice, weight: item.weight
      })));
    } else {
      fetchCartItems();
    }
  }, [selectedItems]);

  async function fetchAddresses() {
    const res = await GetAllUserAddresses(token);
    const data = res?.data;
    if (!data) return;
    setAddresses(data);
    const defaultAddr = data.find((addr) => addr.isDefault);
    if (defaultAddr) setSelectedAddress(defaultAddr);
  }

  async function fetchCartItems() {
    const res = await getCartItems(token);
    const data = res?.data?.cartItems;
    if (data) setCartItems(data);
  }

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

        navigate('/cod-result', { state: { orderId: newOrderId } });
      } else {
        if (!result || typeof result !== "string") return toast.error(" Không nhận được URL thanh toán hợp lệ.");
        window.location.href = result;
      }
    } catch (error) {
      console.error(" Lỗi khi đặt hàng:", error);
      toast.error("Đặt hàng thất bại!");
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const handleCreateAddress = async () => {
    try {
      if (editAdress) {
        await UpdateAddress(token, formData, editAdress.userAdressId);
        SeteditAdress(null);
        toast.success(" Đã cập nhật địa chỉ.");
      } else {
        await AddUserAddress(token, formData);
        toast.success(" Đã thêm địa chỉ.");
      }
      await fetchAddresses();
      setMode("select");
    } catch (err) {
      console.error(" Lỗi thêm/sửa địa chỉ:", err);
      toast.error(err.message || "Thêm/Sửa địa chỉ thất bại!");
    }
  };

  const handleEditAddress = (addr) => {
    SeteditAdress(addr);
    setFormData({
      fullName: addr.fullName, phone: addr.phone, province: addr.province,
      district: addr.district, ward: addr.ward, addressDetail: addr.addressDetail, isDefault: addr.isDefault
    });
    setMode("add");
  };

  const handleDeleteAddress = async (addr) => {
    const confirm = await Swal.fire({
      title: 'Bạn có chắc muốn xoá địa chỉ này?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Đồng ý',
      cancelButtonText: 'Hủy',
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
    });

    if (!confirm.isConfirmed) return;

    try {
      await DeleteAddress(token, addr.userAdressId);
      await fetchAddresses();
      toast.success(" Đã xoá địa chỉ!");
    } catch (err) {
      console.error("Lỗi xoá địa chỉ:", err);
      toast.error(err.message || "Không thể xoá địa chỉ.");
    }
  };

  return (
    <UserLayout>
      <div className="cp-container">
        <h1 className="cp-page-title">Thanh toán</h1>

        <div className="cp-checkout-layout">
          {/* Left Column */}
          <div>
            {/* Address Section */}
            {mode === "view" && (
              <div className="cp-card">
                <h2>📍 Địa chỉ giao hàng</h2>
                {selectedAddress ? (
                  <div className="cp-address-card selected">
                    <div className="cp-address-info">
                      <div className="cp-address-name">
                        {selectedAddress.fullName} — {selectedAddress.phone}
                        {selectedAddress.isDefault && <span className="cp-address-default">Mặc định</span>}
                      </div>
                      <div className="cp-address-detail">
                        {selectedAddress.addressDetail}, {wardMap[selectedAddress.ward]}, {districtMap[selectedAddress.district]}, {provinceMap[selectedAddress.province]}
                      </div>
                    </div>
                  </div>
                ) : (
                  <p style={{ color: '#6b7280' }}>Không có địa chỉ mặc định</p>
                )}
                <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
                  <button className="cp-btn cp-btn-secondary" onClick={() => setMode("select")}>📝 Thay đổi</button>
                  <button className="cp-btn cp-btn-primary" onClick={() => setMode("add")}>➕ Thêm địa chỉ mới</button>
                </div>
              </div>
            )}

            {mode === "select" && (
              <div className="cp-card">
                <h2>📋 Chọn địa chỉ giao hàng</h2>
                {addresses.length === 0 && <p style={{ color: '#6b7280' }}>Không có địa chỉ nào, vui lòng thêm mới.</p>}
                {addresses.map((addr, idx) => (
                  <div
                    key={idx}
                    className={`cp-address-card ${selectedAddress?.userAdressId === addr.userAdressId ? 'selected' : ''}`}
                    onClick={() => setSelectedAddress(addr)}
                  >
                    <input
                      type="radio"
                      name="selectedAddress"
                      checked={selectedAddress?.userAdressId === addr.userAdressId}
                      onChange={() => setSelectedAddress(addr)}
                    />
                    <div className="cp-address-info">
                      <div className="cp-address-name">
                        {addr.fullName} — {addr.phone}
                        {addr.isDefault && <span className="cp-address-default">Mặc định</span>}
                      </div>
                      <div className="cp-address-detail">
                        {addr.addressDetail}, {wardMap[addr.ward] || addr.ward}, {districtMap[addr.district] || addr.district}, {provinceMap[addr.province] || addr.province}
                      </div>
                      <div className="cp-address-actions">
                        <button onClick={(e) => { e.stopPropagation(); handleEditAddress(addr); }}>✏️ Sửa</button>
                        <button onClick={(e) => { e.stopPropagation(); handleDeleteAddress(addr); }}>🗑️ Xoá</button>
                      </div>
                    </div>
                  </div>
                ))}
                <div style={{ marginTop: '16px' }}>
                  <button className="cp-btn cp-btn-secondary" onClick={() => setMode("view")}>🔙 Quay lại</button>
                </div>
              </div>
            )}

            {mode === "add" && (
              <div className="cp-card">
                <h2>📍 {editAdress ? "Sửa địa chỉ" : "Thêm địa chỉ mới"}</h2>
                <button className="cp-btn cp-btn-secondary" onClick={() => setMode("select")} style={{ marginBottom: '20px' }}>
                  🔙 Quay lại chọn địa chỉ
                </button>

                <div className="cp-form-row">
                  <div className="cp-form-group">
                    <label className="cp-form-label">Họ và tên <span className="required">*</span></label>
                    <input className="cp-form-input" name="fullName" placeholder="Nguyễn Văn A" value={formData.fullName} onChange={handleChange} />
                  </div>
                  <div className="cp-form-group">
                    <label className="cp-form-label">Số điện thoại <span className="required">*</span></label>
                    <input className="cp-form-input" name="phone" placeholder="0123456789" value={formData.phone} onChange={handleChange} />
                  </div>
                </div>

                <div className="cp-form-group">
                  <label className="cp-form-label">Tỉnh/Thành phố <span className="required">*</span></label>
                  <select className="cp-form-select" name="province" value={formData.province} onChange={handleProvinceChange}>
                    <option value="">Chọn Tỉnh / Thành phố</option>
                    {provinces.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>

                <div className="cp-form-row">
                  <div className="cp-form-group">
                    <label className="cp-form-label">Quận/Huyện <span className="required">*</span></label>
                    <select className="cp-form-select" name="district" value={formData.district} onChange={handleDistrictChange}>
                      <option value="">Chọn Quận / Huyện</option>
                      {districts.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                    </select>
                  </div>
                  <div className="cp-form-group">
                    <label className="cp-form-label">Phường/Xã <span className="required">*</span></label>
                    <select className="cp-form-select" name="ward" value={formData.ward} onChange={handleChange}>
                      <option value="">Chọn Phường / Xã</option>
                      {wards.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                    </select>
                  </div>
                </div>

                <div className="cp-form-group">
                  <label className="cp-form-label">Địa chỉ cụ thể <span className="required">*</span></label>
                  <input className="cp-form-input" name="addressDetail" placeholder="123 Đường ABC" value={formData.addressDetail} onChange={handleChange} />
                </div>

                <label className="cp-form-checkbox">
                  <input type="checkbox" name="isDefault" checked={formData.isDefault} onChange={handleChange} />
                  Đặt làm địa chỉ mặc định
                </label>

                <button className="cp-btn cp-btn-primary" onClick={handleCreateAddress}>
                  {editAdress ? "✏️ Cập nhật địa chỉ" : "💾 Lưu địa chỉ"}
                </button>
              </div>
            )}

            {/* Payment Method */}
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

              <div className="cp-form-group" style={{ marginTop: '16px' }}>
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

          {/* Right Column - Order Summary */}
          <div>
            <div className="cp-order-summary">
              <h2>🛍️ Đơn hàng</h2>

              <div className="cp-checkout-items">
                {sellerGroupsArray.map((group, idx) => (
                  <div key={idx} className="cp-checkout-seller">
                    <div className="cp-checkout-seller-name">🏬 {group.storeName}</div>
                    {shippingFees[group.sellerId] && (
                      <div className="cp-checkout-shipping">
                        🚚 Phí ship: {shippingFees[group.sellerId].shippingFee.toLocaleString()} đ · Trọng lượng: {group.totalWeight}g
                      </div>
                    )}
                    {group.items.map((item, index) => (
                      <div key={index} className="cp-checkout-item">
                        <div className="cp-checkout-item-img">
                          <img src={item.productImage} alt={item.productName} />
                        </div>
                        <div className="cp-checkout-item-info">
                          <div className="cp-checkout-item-name">{item.productName}</div>
                          <div className="cp-checkout-item-qty">
                            x{item.soLuong} · {item.donGia.toLocaleString()} đ
                          </div>
                          <div style={{ fontSize: '12px', color: '#6b7280' }}>Trọng lượng: {item.weight} kg</div>
                        </div>
                        <div className="cp-checkout-item-price">
                          {(item.soLuong * item.donGia).toLocaleString()} đ
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>

              <hr className="cp-summary-divider" />
              <div className="cp-summary-row">
                <span>Tạm tính</span>
                <span>{total.toLocaleString()} đ</span>
              </div>
              <div className="cp-summary-row">
                <span>Vận chuyển</span>
                <span>{totalShipping.toLocaleString()} đ</span>
              </div>
              <div className="cp-summary-row" style={{ fontSize: '12px' }}>
                <span>Đơn vị vận chuyển</span>
                <span>GHTK</span>
              </div>
              <hr className="cp-summary-divider" />
              <div className="cp-summary-total">
                <span className="cp-summary-total-label">Tổng cộng</span>
                <span className="cp-summary-total-value">{(total + totalShipping).toLocaleString()}đ</span>
              </div>

              <button className="cp-btn-checkout" onClick={handleOrder}>
                🛒 ĐẶT HÀNG NGAY
              </button>
              <button className="cp-btn-continue" onClick={() => navigate("/cart")}>
                🔙 Quay lại giỏ hàng
              </button>
            </div>
          </div>
        </div>
      </div>
    </UserLayout>
  );
}
