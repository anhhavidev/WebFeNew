import React from 'react';

export default function FilterBar({
  minPriceInput, maxPriceInput,
  onMinPriceChange, onMaxPriceChange,
  sortValue, onSortChange,
  onFilter, onReset
}) {
  return (
    <div className="cp-filter-bar">
      <div className="cp-filter-group">
        <label>Sắp xếp:</label>
        <select onChange={(e) => onSortChange(e.target.value)} value={sortValue}>
          <option value="">Mặc định</option>
          <option value="price-asc">Giá tăng dần</option>
          <option value="price-desc">Giá giảm dần</option>
          <option value="name-asc">Tên A-Z</option>
          <option value="name-desc">Tên Z-A</option>
        </select>
      </div>

      <div className="cp-filter-group">
        <label>Giá từ:</label>
        <input type="number" value={minPriceInput} onChange={(e) => onMinPriceChange(e.target.value)} placeholder="0" />
      </div>

      <div className="cp-filter-group">
        <label>Đến:</label>
        <input type="number" value={maxPriceInput} onChange={(e) => onMaxPriceChange(e.target.value)} placeholder="999.999" />
      </div>

      <button className="cp-btn-filter primary" onClick={onFilter}>Lọc</button>
      <button className="cp-btn-filter secondary" onClick={onReset}>Đặt lại</button>
    </div>
  );
}
