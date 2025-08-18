// src/api/categoryApi.js

const API_BASE_URL = 'http://localhost:5230/api/Category';

export const getAllCategories = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/all`);
    if (!response.ok) throw new Error('Lỗi khi gọi API danh mục');

    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('Lỗi fetch danh mục:', error);
    return [];
  }
};
