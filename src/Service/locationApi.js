const API_URL = "http://localhost:5230/api/location"; // ✅ chỉnh lại baseURL nếu khác

export const getProvinces = async () => {
  const res = await fetch(`${API_URL}/provinces`);
  return await res.json();
};

export const getDistricts = async (provinceId) => {
  const res = await fetch(`${API_URL}/districts/${provinceId}`);
  return await res.json();
};

export const getWards = async (districtId) => {
  const res = await fetch(`${API_URL}/wards/${districtId}`);
  return await res.json();
};
