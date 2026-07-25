import axiosClient from "./axiosClient";

const ENDPOINT = "/UserAddress";

export async function GetAllUserAddresses(token) {
  try {
    const response = await axiosClient.get(`${ENDPOINT}`);
    return response;
  } catch (error) {
    console.error("Lỗi khi gọi API địa chỉ:", error);
    return null;
  }
}

export async function AddUserAddress(token, userAddress) {
  const response = await axiosClient.post(`${ENDPOINT}`, {
    fullName: userAddress.fullName,
    phone: userAddress.phone,
    province: userAddress.province,
    district: userAddress.district,
    ward: userAddress.ward,
    addressDetail: userAddress.addressDetail,
    isDefault: userAddress.isDefault,
  });
  return response;
}

export async function UpdateAddress(token, userAddress, id) {
  const response = await axiosClient.put(`${ENDPOINT}/${id}`, {
    fullName: userAddress.fullName,
    phone: userAddress.phone,
    province: userAddress.province,
    district: userAddress.district,
    ward: userAddress.ward,
    addressDetail: userAddress.addressDetail,
    isDefault: userAddress.isDefault,
  });
  return response;
}

export async function DeleteAddress(token, id) {
  const response = await axiosClient.delete(`${ENDPOINT}/${id}`);
  return response;
}
