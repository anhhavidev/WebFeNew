import { faExplosion } from "@fortawesome/free-solid-svg-icons";

const API = "http://localhost:5230/api";
export async function GetAllUserAddresses(token) {
  try {
    const response = await fetch(`${API}/UserAddress`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      alert("Call API thất bại");
      return null;
    }

    const data = await response.json(); // ✅ cần await
    return data;
  } catch (error) {
    console.error("Lỗi khi gọi API địa chỉ:", error);
    return null;
  }
}
export async function AddUserAddress(token, userAddress) {
  const response = await fetch(`${API}/UserAddress`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      fullName: userAddress.fullName,
      phone: userAddress.phone,
      province: userAddress.province,
      district: userAddress.district,
      ward: userAddress.ward,
      addressDetail: userAddress.addressDetail,
      isDefault: userAddress.isDefault,
    }),
  });

  if (!response.ok) {
    let errMsg = "Thêm địa chỉ thất bại";
    try {
      const err = await response.json();
      errMsg = err.message || errMsg;
    } catch (e) {}
    throw new Error(errMsg);
  }

  const data = await response.json();
  return data;
}

export async function UpdateAddress(token, userAddress, id) {
  const response = await fetch(`${API}/UserAddress/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({
      fullName: userAddress.fullName,
      phone: userAddress.phone,
      province: userAddress.province,
      district: userAddress.district,
      ward: userAddress.ward,
      addressDetail: userAddress.addressDetail,
      isDefault: userAddress.isDefault
    })
  });

  if (!response.ok) {
    let errMsg = "Cập nhật địa chỉ thất bại";
    try {
      const err = await response.json();
      errMsg = err.message || errMsg;
    } catch (e) {}
    throw new Error(errMsg);
  }

  const data = await response.json();
  return data;
}

export async function DeleteAddress(token, id) {
  const response = await fetch(`${API}/UserAddress/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  if (!response.ok) {
    let errMsg = "Xóa địa chỉ thất bại";
    try {
      const err = await response.json();
      errMsg = err.message || errMsg;
    } catch (e) {}
    throw new Error(errMsg);
  }

  try {
    const data = await response.json();
    return data;
  } catch (e) {
    return true;
  }
}
