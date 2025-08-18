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
  try {
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
      const err = await response.json();
      alert("Thêm địa chỉ thất bại: " + err.message || response.status);
      return null;
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Lỗi khi gọi API thêm địa chỉ:", error);
    return null;
  }
}
export async function UpdateAddress(token, userAddress, id) {
  try {
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
      alert("Cập nhật địa chỉ thất bại");
      return;
    }

    const data = await response.json();
    return data;

  } catch (error) {
    console.error("Lỗi khi gọi API cập nhật địa chỉ:", error);
    return null;
  }
}
export async function DeleteAddress(token, id) {
  try {
    const response = await fetch(`${API}/UserAddress/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if (!response.ok) {
      alert("Xóa địa chỉ thất bại");
      return;
    }

    const data = await response.json();
    return data;

  } catch (error) {
    console.error("Lỗi khi gọi API xóa địa chỉ:", error);
    return null;
  }
}
