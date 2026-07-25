import axiosClient from "./axiosClient";

const ENDPOINT = "/shipping";

export const calculateShipping = async (province, district, token) => {
  if (!province || !district || !token) {
    console.warn("⚠️ Thiếu dữ liệu khi gọi tính phí:", { province, district, token });
    return null;
  }
  try {
    const res = await axiosClient.post(`${ENDPOINT}/calculate`, { province, district });
    return res;
  } catch (err) {
    console.error("❌ Lỗi gọi API tính phí:", err.message);
    return null;
  }
};

export const calculateShippingBySeller = async (sellerId, province, district, token) => {
  if (!sellerId || !province || !district || !token) {
    console.warn("⚠️ Thiếu dữ liệu khi gọi tính phí theo seller:", { sellerId, province, district, token });
    return null;
  }
  try {
    const res = await axiosClient.post(`${ENDPOINT}/calculate-by-seller`, { sellerId, province, district });
    return res;
  } catch (err) {
    console.error("❌ Lỗi gọi API tính phí theo seller:", err.message);
    return null;
  }
};
