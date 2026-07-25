import axiosClient from "./axiosClient";

const ENDPOINT = "/location";

export const getProvinces = async () => {
  const res = await axiosClient.get(`${ENDPOINT}/provinces`);
  return res?.data || [];
};

export const getDistricts = async (provinceId) => {
  const res = await axiosClient.get(`${ENDPOINT}/districts/${provinceId}`);
  return res?.data || [];
};

export const getWards = async (districtId) => {
  const res = await axiosClient.get(`${ENDPOINT}/wards/${districtId}`);
  return res?.data || [];
};
