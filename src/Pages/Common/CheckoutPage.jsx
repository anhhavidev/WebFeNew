import React, { useEffect, useState } from "react";
import { GetAllUserAddresses, AddUserAddress } from "../../Service/addressApi";
import { checkoutOrder } from "../../Service/CheckoutApi";
import styles from "./CheckoutPage.module.css";
import UserLayout from "../../layout1/UserLayout";
import { getCartItems } from "../../Service/cartApi";
import { getProvinces, getDistricts, getWards } from "../../Service/locationApi";
import { calculateShipping } from "../../Service/shippingApi";
import { useLocation } from "react-router-dom";
import { DeleteAddress, UpdateAddress } from "../../Service/addressApi"
import { useParams, useNavigate } from "react-router-dom";
import { createPaymentUrl } from "../../Service/paymentApi";
export default function SimpleCheckoutPage() {
  const token = localStorage.getItem("token");
  // const navigate = useNavigate();
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [note, setNote] = useState("");
  const [mode, setMode] = useState("view");
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);
  const [provinceMap, setProvinceMap] = useState({});
  const [districtMap, setDistrictMap] = useState({});
  const [shippingInfo, setShippingInfo] = useState(null); // thêm dòng này
  const [wardMap, setWardMap] = useState({});
  const [editAdress, SeteditAdress] = useState(null);
  const { orderId } = useParams();
  const [method, setMethod] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();


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
    fullName: "",
    phone: "",
    province: "",
    district: "",
    ward: "",
    addressDetail: "",
    // email: "",
    // note: "Giao trong giờ hành chính",
    // isGift: false,
    // voucherCode: "",
    isDefault: false
  });

  const [cartItems, setCartItems] = useState([]);

  const total = cartItems.reduce((acc, item) => acc + item.soLuong * item.donGia, 0);
  // 👉 THÊM DÒNG NÀY Ở ĐÂY:
  const [shippingFee, setShippingFee] = useState("Vui lòng chọn địa chỉ");
  const point = 49000;
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
  // hiển thị tỉnh xã huyện tahy vì số 
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

    if (addresses.length > 0) {
      loadAllAddressMaps();
    }
  }, [addresses]);


  const handleProvinceChange = async (e) => {
    const province = e.target.value; // là chuỗi 
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
    const province = formData.province;

    setFormData((prev) => ({ ...prev, district, ward: "" }));
    const data = await getWards(district);
    setWards(data);
    const wardMapping = {};
    data.forEach(w => wardMapping[w.id] = w.name);
    setWardMap(wardMapping);


    // 👉 Tính phí ship nếu đủ tỉnh và huyện
    if (province && district) {
      const res = await calculateShipping(
        provinceMap[province],
        districtMap[district],
        token
      );
      if (res) {
        setShippingInfo(res);
        setShippingFee(`${res.shippingFee.toLocaleString()} đ`);
      }
    }
  };
  useEffect(() => {
    if (selectedAddress?.province && selectedAddress?.district) {
      const provinceName = provinceMap[selectedAddress.province] || selectedAddress.province;
      const districtName = districtMap[selectedAddress.district] || selectedAddress.district;

      calculateShipping(provinceName, districtName, token)
        .then(res => {
          if (res) {
            setShippingInfo(res);
            setShippingFee(`${res.shippingFee.toLocaleString()} đ`);
          }
        });
    }
  }, [selectedAddress, provinceMap, districtMap]);
  ////useeffect data 
  useEffect(() => {
    const fetchData = async () => {
      await fetchAddresses();
     //await fetchCartItems();
    };
    fetchData();
  }, [token]);
  useEffect(() => {
  if (selectedItems.length > 0) {
    // ✅ Đồng bộ lại field để code cũ tính toán được
    setCartItems(selectedItems.map(item => ({
      ...item,
      soLuong: item.quantity,   // alias để giữ chung format
      donGia: item.unitPrice,
    })));
  } else {
    // ✅ Vào trực tiếp checkout thì load full cart
    fetchCartItems();
  }
}, [selectedItems]);

  ///ca;l; api dia chi 
  async function fetchAddresses() {
    const res = await GetAllUserAddresses(token);
    const data = res?.data;
    if (!data) return;
    setAddresses(data);
    const defaultAddr = data.find((addr) => addr.isDefault);
    if (defaultAddr) setSelectedAddress(defaultAddr); // chọn  ra địa chỉ mặc địn hsawxn từ truoc 
  }
  // call api   cartitem
  async function fetchCartItems() {
    const res = await getCartItems(token);
    const data = res?.data?.cartItems;
    if (data) setCartItems(data);
  }
  //xử lý sự kiện order 
  const handleOrder = async () => {
    if (!selectedAddress) return alert("Vui lòng chọn địa chỉ!"); // nếu ko có địa chỉ mặc định 

    const payload = {
      adressId: selectedAddress.userAdressId,
      fullName: selectedAddress.fullName,
      phone: selectedAddress.phone,
      // email: selectedAddress.email || "test@gmail.com",
      province: selectedAddress.province,
      district: selectedAddress.district,
      ward: selectedAddress.ward,
      address: selectedAddress.addressDetail,
      paymentMethod: method,
      note,

      // items: cartItems,
      productIds: cartItems.map(item => item.cartItemId),
    };

    try {
      const res = await checkoutOrder(payload, token);
      console.log("📦 Đáp trả từ checkoutOrder:", res);
      if (!res.isSuccess) {
        return alert("❌ " + res.message);
      }

      const result = res.message;

      if (method === "COD") {
        alert("🎉 Đặt hàng thành công! Thanh toán khi nhận hàng.");
        navigate('/cod-result');

      } else {
        if (!result || typeof result !== "string") {
          return alert("❌ Không nhận được URL thanh toán hợp lệ.");
        }

        // 👉 Redirect sang URL thanh toán (VNPAY, MOMO, ...)
        window.location.href = result;
      }

    } catch (error) {
      console.error("❌ Lỗi khi đặt hàng:", error);
      alert("❌ Đặt hàng thất bại!");
    }
  };


  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // const handleCreateAddress = async () => {
  //   try {
  //     await AddUserAddress(token, formData);
  //     await fetchAddresses();
  //     const res = await GetAllUserAddresses(token); // 🛠 Lấy lại dữ liệu đúng
  //     const newDefault = formData.isDefault
  //       ? formData
  //       : res.data.find((a) => a.isDefault); // ✅ Fix ở đây
  //     if (newDefault) setSelectedAddress(newDefault);
  //     setMode("select");
  //   } catch (err) {
  //     console.error("Lỗi thêm địa chỉ:", err);
  //     alert("❌ Thêm địa chỉ thất bại!");
  //   }
  // };
  const handleCreateAddress = async () => {
    try {
      if (editAdress) {
        // 👉 Đang ở chế độ sửa
        await UpdateAddress(token, formData, editAdress.userAdressId);
        SeteditAdress(null);
        alert("✏️ Đã cập nhật địa chỉ.");
      } else {
        // 👉 Đang ở chế độ thêm
        await AddUserAddress(token, formData);
        alert("✅ Đã thêm địa chỉ.");
      }

      await fetchAddresses();
      setMode("select"); // quay về màn chọn địa chỉ
    } catch (err) {
      console.error("❌ Lỗi thêm/sửa địa chỉ:", err);
      alert("❌ Thêm/Sửa địa chỉ thất bại!");
    }
  };

  const handleEditAddress = (addr) => {
    SeteditAdress(addr); // lưu lại địa chỉ đang sửa

    setFormData({
      fullName: addr.fullName,
      phone: addr.phone,
      province: addr.province,
      district: addr.district,
      ward: addr.ward,
      addressDetail: addr.addressDetail,
      // email: addr.email || "",
      // note: addr.note || "",
      // isGift: false,
      // voucherCode: "",
      isDefault: addr.isDefault
    });

    setMode("add"); // dùng lại form thêm để sửa
  };

  const handleDeleteAddress = async (addr) => {
    const confirm = window.confirm("Bạn có chắc muốn xoá địa chỉ này?");
    if (!confirm) return;

    try {
      await DeleteAddress(token, addr.userAdressId); // 🛠 Dùng hàm Delete đã sửa
      await fetchAddresses();
      alert("🗑️ Đã xoá địa chỉ!");
    } catch (err) {
      console.error("❌ Lỗi xoá địa chỉ:", err);
      alert("❌ Không thể xoá địa chỉ.");
    }
  };

  return (
    <UserLayout>
      <div className={styles.checkoutContainer}>
        <h2 className={styles.checkoutHeader}>📦 Trang Đặt Hàng</h2>
        {/* ✅ NÚT QUAY LẠI */}
        <button
          onClick={() => navigate("/cart")}
          style={{
            padding: "6px 12px",
            backgroundColor: "#ddd",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer"
          }}
        >
          🔙 Quay lại giỏ hàng
        </button>
        <hr />
        <div className={styles.checkoutContent}>
          <div className={styles.leftColumn}>
            {mode === "view" && (
              <div className={styles.addressSection}>
                <strong>Địa chỉ giao hàng:</strong>
                {selectedAddress ? (
                  <div>
                    <div> Họ và tên: {selectedAddress.fullName} -SĐT: {selectedAddress.phone}</div>
                    <div>Địa chỉ chi tiết :
                      {selectedAddress.addressDetail},
                      {wardMap[selectedAddress.ward]},
                      {districtMap[selectedAddress.district]},
                      {provinceMap[selectedAddress.province]}


                    </div>
                  </div>
                ) : (
                  <div>Không có địa chỉ mặc định</div>
                )}
                <div>
                  <button onClick={() => setMode("select")} style={{ marginRight: 10 }}>📝 Thay đổi</button>
                  <button onClick={() => setMode("add")}>➕ Thêm địa chỉ mới</button>
                </div>
              </div>
            )}

            {mode === "select" && (
              <div>
                <h3>📋 Chọn địa chỉ giao hàng</h3>
                {addresses.length === 0 && <p>Không có địa chỉ nào, vui lòng thêm mới.</p>}
                {addresses.map((addr, idx) => (
                  <div
                    key={idx}
                    style={{
                      border: selectedAddress?.userAdressId === addr.userAdressId ? "2px solid #007bff" : "1px solid #ccc",
                      padding: "10px 15px",
                      borderRadius: 8,
                      marginBottom: 10,
                      background: selectedAddress?.userAdressId === addr.userAdressId ? "#e9f3ff" : "#f9f9f9",
                      cursor: "pointer"
                    }}
                    onClick={() => setSelectedAddress(addr)} // đia chjir người dùng chọn 
                  >
                    <label style={{ display: "flex", alignItems: "center" }}>
                      <input
                        type="radio"
                        name="selectedAddress"
                        checked={selectedAddress?.userAdressId === addr.userAdressId}
                        onChange={() => setSelectedAddress(addr)}
                        style={{ marginRight: 10 }}
                      />
                      <div>
                        <strong>{addr.fullName}</strong> - {addr.phone}{" "}
                        {addr.isDefault && (
                          <span style={{ color: "green", fontWeight: "bold", marginLeft: 8 }}>[Mặc định]</span>
                        )}
                        <div style={{ fontSize: 14, color: "#333", marginTop: 4 }}>
                          {addr.addressDetail},

                          {wardMap[addr.ward] || addr.ward},
                          {districtMap[addr.district] || addr.district},
                          {provinceMap[addr.province] || addr.province}
                        </div>

                      </div>
                    </label>
                    {/* ✅ Thêm 2 nút này */}
                    <div style={{ marginTop: 6 }}>
                      <button style={{ padding: '4px', borderRadius: '4px' }} onClick={() => handleEditAddress(addr)}>✏️ Sửa</button>
                      <button style={{ padding: '4px', marginLeft: '8px', borderRadius: '4px' }} onClick={() => handleDeleteAddress(addr)}>🗑️ Xoá</button>
                    </div>

                  </div>
                ))}
                <div style={{ marginTop: 12 }}>
                  <button onClick={() => setMode("view")}>🔙 Quay lại</button>
                </div>
              </div>
            )}
            {mode === "add" && (
              <div className={styles.newAddressForm}>
                <button onClick={() => setMode("select")} style={{ marginBottom: 12 }}>
                  🔙 Quay lại chọn địa chỉ
                </button>
                <h3>📍 Thông Tin Nhận Hàng</h3>
                <input className={styles.inputField} name="fullName" placeholder="Họ và tên" value={formData.fullName} onChange={handleChange} />
                <input className={styles.inputField} name="phone" placeholder="Số điện thoại" value={formData.phone} onChange={handleChange} />
                <select className={styles.selectField} name="province" value={formData.province} onChange={handleProvinceChange}>
                  <option value="">Chọn Tỉnh / Thành phố</option>
                  {provinces.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>

                <select className={styles.selectField} name="district" value={formData.district} onChange={handleDistrictChange}>
                  <option value="">Chọn Quận / Huyện</option>
                  {districts.map(d => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>

                <select className={styles.selectField} name="ward" value={formData.ward} onChange={handleChange}>
                  <option value="">Chọn Phường / Xã</option>
                  {wards.map(w => (
                    <option key={w.id} value={w.id}>{w.name}</option>
                  ))}
                </select>

                <input className={styles.inputField} name="addressDetail" placeholder="Địa chỉ cụ thể" value={formData.addressDetail} onChange={handleChange} />
                {/* <input className={styles.inputField} name="email" placeholder="Email" value={formData.email} onChange={handleChange} /> */}
                {/* <input className={styles.inputField} name="note" placeholder="Ghi chú giao hàng" value={formData.note} onChange={handleChange} /> */}

                <label className={styles.checkboxLabel}>
                  <input type="checkbox" name="isDefault" checked={formData.isDefault} onChange={handleChange} /> Đặt làm địa chỉ mặc định
                </label>
                <button onClick={handleCreateAddress}>
                  {editAdress ? "✏️ Cập nhật địa chỉ" : "💾 Lưu địa chỉ"}
                </button>

              </div>
            )}
          </div>

          <div className={styles.rightColumn}>
            <div className={styles.discountSection}>
              <h3>🏷️ Mã Giảm Giá</h3>
              <input className={styles.voucherInput} name="voucherCode" value={formData.voucherCode} onChange={handleChange} placeholder="Nhập mã khuyến mãi" />
              <button>Áp dụng</button>
            </div>

            <div className={styles.cartPreview}>
              <h3>🛍️ Sản phẩm trong giỏ</h3>
              <ul className={styles.cartItemList}>
                {cartItems.map((item, index) => (
                  <li key={index} className={styles.cartItem}>
                    <img src={item.productImage} alt={item.productName} className={styles.cartItemImage} />
                    <div>
                      <div><strong>{item.productName}</strong></div>
                      <div>Đơn giá: {item.donGia.toLocaleString()} đ</div>
                      <div>Số lượng: x{item.soLuong}</div>
                      <div>Thành tiền: {(item.soLuong * item.donGia).toLocaleString()} đ</div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div className={styles.summarySection}>
              <h4>Tạm tính: {total.toLocaleString()} đ</h4>
              <h4>Vận chuyển: {shippingInfo ? `${shippingInfo.shippingFee.toLocaleString()} đ` : shippingFee}</h4>
              {shippingInfo && (
                <div style={{ fontSize: 14, color: "#555" }}>
                  <div>Tổng trọng lượng: {shippingInfo.totalWeight}g</div>
                  <div>Số sản phẩm: {shippingInfo.totalItems}</div>
                  <div>Đơn vị vận chuyển: {shippingInfo.shippingProvider}</div>
                </div>
              )}

              <h4>Điểm tích lũy: {point.toLocaleString()}</h4>
              <h3 style={{ color: "red" }}>
                Tiền phải trả: {(total + (shippingInfo?.shippingFee || 0)).toLocaleString()} đ
              </h3>
              <h5 className="text-center fw-bold text-primary mb-3">Phương thức thanh toán</h5>

              <div className="form-group mb-3">
                <label className="form-label fw-semibold">Chọn phương thức:</label>
                <select
                  className="form-select form-select-sm"
                  value={method}
                  onChange={(e) => setMethod(e.target.value)}
                  required
                >
                  <option value="">-- Chọn phương thức --</option>
                  <option value="VNPAY">🌐 VNPAY (Ví/QR)</option>
                  <option value="COD">📦 COD (Nhận hàng trả tiền)</option>
                </select>
                <textarea
                  placeholder="Ghi chú cho đơn hàng (ví dụ: giao giờ hành chính)"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  style={{ width: "100%", minHeight: 60, marginTop: 10, padding: 8 }}
                />

                {/* <div className="card-body px-3 py-4"> */}
                {/* </div> */}

                {/* {error && (
      <div className="alert alert-danger text-center py-2 px-3 mb-2">{error}</div>
    )}

    <button className="btn btn-sm btn-primary w-100 mb-2 fw-semibold" onClick={handlePayment}>
      ✅ Thanh toán
    </button>

    <button className="btn btn-sm btn-outline-secondary w-100" onClick={() => navigate("/checkout")}>
      ⬅ Quay lại
    </button> */}

                {/* <div className="text-center mt-3">
      <img
        src="https://i.imgur.com/3u1OgMb.png"
        alt="VNPAY"
        style={{ height: "30px" }}
      />
      <p className="mt-1 text-muted small">Hỗ trợ bởi VNPAY</p>
    </div> */}
              </div>
              <button className={styles.orderButton} onClick={handleOrder}>
                🛒 ĐẶT HÀNG NGAY
              </button>
              <div className="card border-0 shadow-sm rounded-4 p-3">
              </div>

            </div>
          </div>
        </div>
      </div>
    </UserLayout>
  );
}
