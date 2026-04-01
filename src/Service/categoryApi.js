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

export const getCategories = async () => {
  return getAllCategories();
};

export const addCategory = async (categoryData) => {
  try {
    const response = await fetch(`${API_BASE_URL}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(categoryData),
    });
    if (!response.ok) throw new Error('Lỗi khi thêm danh mục');

    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('Lỗi thêm danh mục:', error);
    throw error;
  }
};

export const updateCategory = async (id, categoryData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(categoryData),
    });
    if (!response.ok) throw new Error('Lỗi khi cập nhật danh mục');

    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('Lỗi cập nhật danh mục:', error);
    throw error;
  }
};

export const deleteCategory = async (id) => {
  try {
    const response = await fetch(`${API_BASE_URL}/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) throw new Error('Lỗi khi xóa danh mục');

    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('Lỗi xóa danh mục:', error);
    throw error;
  }
};