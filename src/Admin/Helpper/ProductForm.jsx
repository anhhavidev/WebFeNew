import React, { useState, useEffect } from "react";
import { getProductById } from "../../Service/ProductApi";
const ProductForm = ({ categories, productId, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    originalPrice: "",
    discountPercent: "",
    discountedPrice: "", // thêm
    stockQuantity: "",
    categoryId: "",
    isActive: true,
    weight: "",
    image: null,
    imageGallery: []
  });

  const [preview, setPreview] = useState(null);
  const [galleryPreview, setGalleryPreview] = useState([]);

  useEffect(() => {
    if (productId) {
      const fetchProduct = async () => {
        try {
          const data = await getProductById(productId);
          const discount = data.discountPercent || 0;
          const originalPrice = data.originalPrice || 0;

          setFormData({
            productId: data.productId,
            name: data.name || "",
            description: data.description || "",
            originalPrice,
            discountPercent: discount,
            discountedPrice: originalPrice - (originalPrice * discount) / 100,
            stockQuantity: data.stockQuantity || "",
            categoryId: data.categoryId || "",
            isActive: data.isActive ?? true,
            weight: data.weight || "",
            image: data.linkImage || null,
            imageGallery: [] // để file mới upload
          });

          if (data.linkImage) setPreview(data.linkImage);

          if (data.imageGallery) setGalleryPreview(data.imageGallery); // gallery URL cũ
        } catch (error) {
          console.error("Lỗi khi load chi tiết sản phẩm:", error);
        }
      };

      fetchProduct();
    }
  }, [productId]);

  const formatCurrency = (value) => {
    if (!value) return "";
    // chuyển string -> number
    const numberValue = typeof value === "string" ? parseFloat(value.replace(/\D/g, "")) : value;
    // format với dấu chấm và thêm đ
    return numberValue.toLocaleString("vi-VN") + "đ";
  };

  // lấy lại số nguyên từ input đã format
  const parseCurrency = (value) => {
    return parseFloat(value.replace(/\D/g, "")) || 0;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => {
      const newData = { ...prev };

      if (type === "checkbox") {
        newData[name] = checked;
      } else if (name === "originalPrice") {
        // lưu giá số vào state
        const numberValue = parseCurrency(value);
        newData.originalPrice = numberValue;

        // tính giá giảm
        const discount = parseFloat(newData.discountPercent) || 0;
        newData.discountedPrice = numberValue - (numberValue * discount) / 100;
      } else if (name === "discountPercent") {
        const discount = parseFloat(value) || 0;
        newData.discountPercent = discount;

        const original = parseFloat(newData.originalPrice) || 0;
        newData.discountedPrice = original - (original * discount) / 100;
      } else {
        newData[name] = value;
      }

      return newData;
    });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setFormData((prev) => ({ ...prev, image: file }));
    if (file) setPreview(URL.createObjectURL(file));
  };


  // const handleGalleryChange = (e) => {
  //   setFormData((prev) => ({
  //     ...prev,
  //     imageGallery: Array.from(e.target.files)
  //   }));
  // };
  const handleGalleryChange = (e) => {
    const files = Array.from(e.target.files);
    setFormData(prev => ({ ...prev, imageGallery: files }));
    setGalleryPreview(files.map(f => URL.createObjectURL(f))); // preview file mới
  };

  const handleSubmit = (e) => {
    // e.preventDefault();
    // const payload = new FormData();

    // payload.append("Name", formData.name);
    // payload.append("Description", formData.description);
    // payload.append("OriginalPrice", formData.originalPrice);
    // if (formData.discountPercent) {
    //   payload.append("DiscountPercent", formData.discountPercent);
    // }
    // payload.append("StockQuantity", formData.stockQuantity);
    // payload.append("CategoryId", formData.categoryId);
    // payload.append("IsActive", formData.isActive);
    // payload.append("Weight", formData.weight);
    // if (formData.image) payload.append("Image", formData.image);
    // if (formData.imageGallery && formData.imageGallery.length > 0) {
    //   formData.imageGallery.forEach((file) => payload.append("ImageGallery", file));
    // }

    // onSave(payload);
    e.preventDefault();
    // onSave(formData); // truyền object chứ không phải FormData
    const payload = { ...formData };
  if (!productId) delete payload.productId;
  onSave(payload);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-3">
        <label className="form-label">Tên sản phẩm</label>
        <input
          type="text"
          name="name"
          className="form-control"
          value={formData.name}
          onChange={handleChange}
          required
        />
      </div>

      <div className="mb-3">
        <label className="form-label">Mô tả</label>
        <textarea
          name="description"
          className="form-control"
          value={formData.description}
          onChange={handleChange}
          rows="3"
        />
      </div>

      <div className="row">
        <div className="col-md-4 mb-3">
          <label className="form-label">Giá gốc</label>
          <input
            type="text"
            name="originalPrice"
            className="form-control"
            value={formatCurrency(formData.originalPrice)}
            onChange={handleChange}
            required
          />

        </div>
        <div className="col-md-4 mb-3">
          <label className="form-label">Phần trăm giảm (%)</label>
          <input
            type="number"
            name="discountPercent"
            className="form-control"
            value={formData.discountPercent}
            onChange={handleChange}
          />
        </div>
        <div className="col-md-4 mb-3">
          <label className="form-label">Giá sau giảm</label>
          <input
            type="text"
            className="form-control"
            value={formatCurrency(formData.discountedPrice)}
            readOnly
          />
        </div>
      </div>

      <div className="row">
        <div className="col-md-6 mb-3">
          <label className="form-label">Số lượng tồn kho</label>
          <input
            type="number"
            name="stockQuantity"
            className="form-control"
            value={formData.stockQuantity}
            onChange={handleChange}
            required
          />
        </div>
        <div className="col-md-6 mb-3">
          <label className="form-label">Danh mục</label>
          <select
            name="categoryId"
            className="form-select"
            value={formData.categoryId}
            onChange={handleChange}
            required
          >
            <option value="">Chọn danh mục</option>
            {categories.map((c) => (
              <option key={c.categoryid} value={c.categoryid}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="row">
        <div className="col-md-6 mb-3">
          <div className="form-check mt-4">
            <input
              type="checkbox"
              name="isActive"
              className="form-check-input"
              checked={formData.isActive}
              onChange={handleChange}
            />
            <label className="form-check-label">Kích hoạt</label>
          </div>
        </div>
        <div className="col-md-6 mb-3">
          <label className="form-label">Trọng lượng (gram)</label>
          <input
            type="number"
            name="weight"
            className="form-control"
            value={formData.weight}
            onChange={handleChange}
          />
        </div>
      </div>

      <div className="mb-3">
        <label className="form-label">Ảnh sản phẩm</label>
        <input
          type="file"
          name="image"
          className="form-control"
          onChange={handleFileChange}
          accept="image/*"
        />
        {/* Nếu có ảnh cũ từ DB hoặc ảnh mới chọn */}
        {(preview || formData.image) && (
          <img
            src={preview || formData.image}
            alt="Preview"
            style={{ width: "100px", marginTop: "10px" }}
          />
        )}
      </div>

      <div className="mb-3">
        <label className="form-label">Ảnh phụ (gallery)</label>
        <input
          type="file"
          name="imageGallery"
          className="form-control"
          onChange={handleGalleryChange}
          accept="image/*"
          multiple
        />

        {/* Hiển thị preview */}
        {galleryPreview.length > 0 && (
          <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
            {galleryPreview.map((url, idx) => (
              <img key={idx} src={url} alt={`Gallery ${idx}`} style={{ width: "100px" }} />
            ))}
          </div>
        )}
      </div>


      <div className="d-flex justify-content-end gap-2">
        <button type="button" className="btn btn-secondary" onClick={onCancel}>
          Hủy
        </button>
        <button type="submit" className="btn btn-primary">
          {productId ? "Cập nhật" : "Thêm mới"}
        </button>
      </div>
    </form>
  );
};

export default ProductForm;
