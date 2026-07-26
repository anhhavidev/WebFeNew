import axiosClient from "./axiosClient";

const ENDPOINT = "/location";

export const getProvinces = async () => {
  try {
    const res = await axiosClient.get(`${ENDPOINT}/provinces`);
    return res?.data || [];
  } catch (err) {
    console.error("Lỗi lấy tỉnh/thành phố:", err);
    return [];
  }
};

export const getDistricts = async (provinceId) => {
  try {
    const res = await axiosClient.get(`${ENDPOINT}/districts/${provinceId}`);
    return res?.data || [];
  } catch (err) {
    console.error("Lỗi lấy quận/huyện:", err);
    return [];
  }
};

export const getWards = async (districtId) => {
  try {
    const res = await axiosClient.get(`${ENDPOINT}/wards/${districtId}`);
    return res?.data || [];
  } catch (err) {
    console.error("Lỗi lấy phường/xã:", err);
    return [];
  }
};
