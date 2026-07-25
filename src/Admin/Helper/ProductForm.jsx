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
  const [validationErrors, setValidationErrors] = useState({});

  const renderError = (field) => {
    const errorList = validationErrors[field] || validationErrors[field.charAt(0).toUpperCase() + field.slice(1)];
    if (errorList && errorList.length > 0) {
      return <div className="text-danger small mt-1">{errorList[0]}</div>;
    }
    return null;
  };

  useEffect(() => {
    if (productId) {
      const fetchProduct = async () => {
        try {
          const res = await getProductById(productId);
          const data = res.data || res;
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setValidationErrors({});
    const payload = { ...formData };
    if (!productId) delete payload.productId;
    try {
      await onSave(payload);
    } catch (err) {
      if (err.validationErrors) {
        setValidationErrors(err.validationErrors);
      }
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="row">
        <div className="col-md-8 mb-2">
          <label className="form-label fw-semibold">Tên sản phẩm</label>
          <input
            type="text"
            name="name"
            className={`form-control form-control-sm ${renderError("name") ? "is-invalid" : ""}`}
            value={formData.name}
            onChange={handleChange}
            required
          />
          {renderError("name")}
        </div>
        <div className="col-md-4 mb-2">
          <label className="form-label fw-semibold">Danh mục</label>
          <select
            name="categoryId"
            className={`form-select form-select-sm ${renderError("categoryId") ? "is-invalid" : ""}`}
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
          {renderError("categoryId")}
        </div>
      </div>

      <div className="mb-2">
        <label className="form-label fw-semibold">Mô tả</label>
        <textarea
          name="description"
          className={`form-control form-control-sm ${renderError("description") ? "is-invalid" : ""}`}
          value={formData.description}
          onChange={handleChange}
          rows="2"
        />
        {renderError("description")}
      </div>

      <div className="row">
        <div className="col-md-3 mb-2">
          <label className="form-label fw-semibold">Giá gốc</label>
          <input
            type="text"
            name="originalPrice"
            className={`form-control form-control-sm ${renderError("originalPrice") ? "is-invalid" : ""}`}
            value={formatCurrency(formData.originalPrice)}
            onChange={handleChange}
            required
          />
          {renderError("originalPrice")}
        </div>
        <div className="col-md-3 mb-2">
          <label className="form-label fw-semibold">Giảm (%)</label>
          <input
            type="number"
            name="discountPercent"
            className={`form-control form-control-sm ${renderError("discountPercent") ? "is-invalid" : ""}`}
            value={formData.discountPercent}
            onChange={handleChange}
          />
          {renderError("discountPercent")}
        </div>
        <div className="col-md-3 mb-2">
          <label className="form-label fw-semibold">Giá sau giảm</label>
          <input
            type="text"
            className="form-control form-control-sm"
            value={formatCurrency(formData.discountedPrice)}
            readOnly
          />
        </div>
        <div className="col-md-3 mb-2">
          <label className="form-label fw-semibold">Tồn kho</label>
          <input
            type="number"
            name="stockQuantity"
            className={`form-control form-control-sm ${renderError("stockQuantity") ? "is-invalid" : ""}`}
            value={formData.stockQuantity}
            onChange={handleChange}
            required
          />
          {renderError("stockQuantity")}
        </div>
      </div>

      <div className="row">
        <div className="col-md-6 mb-2">
          <label className="form-label fw-semibold">Trọng lượng (gram)</label>
          <input
            type="number"
            name="weight"
            className={`form-control form-control-sm ${renderError("weight") ? "is-invalid" : ""}`}
            value={formData.weight}
            onChange={handleChange}
          />
          {renderError("weight")}
        </div>
        <div className="col-md-6 mb-2 d-flex align-items-end">
          <div className="form-check mb-1">
            <input
              type="checkbox"
              name="isActive"
              className="form-check-input"
              checked={formData.isActive}
              onChange={handleChange}
            />
            <label className="form-check-label fw-semibold">Kích hoạt sản phẩm</label>
          </div>
        </div>
      </div>

      <div className="row">
        <div className="col-md-6 mb-3">
          <label className="form-label fw-semibold">Ảnh sản phẩm</label>
          <input
            type="file"
            name="image"
            className="form-control form-control-sm"
            onChange={handleFileChange}
            accept="image/*"
          />
          {(preview || formData.image) && (
            <img
              src={preview || formData.image}
              alt="Preview"
              style={{ width: "60px", height: "60px", objectFit: "cover", marginTop: "5px", borderRadius: "5px" }}
            />
          )}
        </div>

        <div className="col-md-6 mb-3">
          <label className="form-label fw-semibold">Ảnh phụ (gallery)</label>
          <input
            type="file"
            name="imageGallery"
            className="form-control form-control-sm"
            onChange={handleGalleryChange}
            accept="image/*"
            multiple
          />
          {galleryPreview.length > 0 && (
            <div style={{ display: "flex", gap: "5px", marginTop: "5px" }}>
              {galleryPreview.map((url, idx) => (
                <img key={idx} src={url} alt={`Gallery ${idx}`} style={{ width: "60px", height: "60px", objectFit: "cover", borderRadius: "5px" }} />
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="d-flex justify-content-end gap-2 mt-1">
        <button type="button" className="btn btn-secondary btn-sm px-4" onClick={onCancel}>
          Hủy
        </button>
        <button type="submit" className="btn btn-primary btn-sm px-4">
          {productId ? "Cập nhật" : "Thêm mới"}
        </button>
      </div>
    </form>
  );
};

export default ProductForm;
