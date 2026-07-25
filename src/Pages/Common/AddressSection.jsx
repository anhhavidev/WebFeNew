import React, { useState, useEffect } from "react";
import { GetAllUserAddresses, AddUserAddress, UpdateAddress, DeleteAddress } from "../../Service/addressApi";
import { getProvinces, getDistricts, getWards } from "../../Service/locationApi";
import toast from "react-hot-toast";
import Swal from "sweetalert2";

const initialFormData = {
  fullName: "", phone: "", province: "", district: "", ward: "", addressDetail: "", isDefault: false
};

export default function AddressSection({ token, onAddressChange }) {
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [mode, setMode] = useState("view");
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);
  const [provinceMap, setProvinceMap] = useState({});
  const [districtMap, setDistrictMap] = useState({});
  const [wardMap, setWardMap] = useState({});
  const [editAdress, setEditAdress] = useState(null);
  const [formData, setFormData] = useState(initialFormData);

  useEffect(() => {
    fetchAddresses();
  }, [token]);

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

  useEffect(() => {
    onAddressChange(selectedAddress);
  }, [selectedAddress]);

  useEffect(() => {
    const fetchProvinces = async () => {
      const data = await getProvinces();
      setProvinces(data);
      const map = {};
      data.forEach(p => map[p.id] = p.name);
      setProvinceMap(map);
    };
    fetchProvinces();
  }, []);

  async function fetchAddresses() {
    const res = await GetAllUserAddresses(token);
    const data = res?.data;
    if (!data) return;
    setAddresses(data);
    const defaultAddr = data.find((addr) => addr.isDefault);
    if (defaultAddr && !selectedAddress) setSelectedAddress(defaultAddr);
  }

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

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const handleCreateAddress = async () => {
    try {
      if (editAdress) {
        await UpdateAddress(token, formData, editAdress.userAdressId);
        setEditAdress(null);
        toast.success("Đã cập nhật địa chỉ.");
      } else {
        await AddUserAddress(token, formData);
        toast.success("Đã thêm địa chỉ.");
      }
      await fetchAddresses();
      setMode("select");
    } catch (err) {
      console.error("Lỗi thêm/sửa địa chỉ:", err);
      toast.error(err.message || "Thêm/Sửa địa chỉ thất bại!");
    }
  };

  const handleEditAddress = (addr) => {
    setEditAdress(addr);
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
      toast.success("Đã xoá địa chỉ!");
    } catch (err) {
      console.error("Lỗi xoá địa chỉ:", err);
      toast.error(err.message || "Không thể xoá địa chỉ.");
    }
  };

  return (
    <>
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
    </>
  );
}
