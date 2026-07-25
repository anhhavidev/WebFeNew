import React from "react";
import { FiSearch, FiFilter, FiPlus } from "react-icons/fi";

export default function FilterArea({
  searchInput, onSearchChange,
  categoryInput, categoryOptions, onCategoryChange,
  statusInput, onStatusChange,
  minPriceInput, maxPriceInput,
  onMinPriceChange, onMaxPriceChange,
  onFilter, onReset, onAdd
}) {
  return (
    <>
      <div className="table-header-actions">
        <div className="table-search">
          <FiSearch className="search-icon" />
          <input
            type="text"
            placeholder="Tìm kiếm theo tên, mã sản phẩm..."
            value={searchInput}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>

        <div className="table-actions">
          <button className="btn-table-action outline" onClick={() => {
            const filterMenu = document.getElementById("filter-options");
            filterMenu.classList.toggle("d-none");
          }}>
            <FiFilter className="w-5 h-5" /> Lọc
          </button>
          <button className="btn-table-action primary" onClick={onAdd}>
            <FiPlus className="w-5 h-5" /> Thêm sản phẩm
          </button>
        </div>
      </div>

      <div id="filter-options" className="d-none bg-light p-3 border-bottom border-gray-200">
        <div className="row g-2">
          <div className="col-md-3">
            <select className="form-select" value={categoryInput} onChange={(e) => onCategoryChange(e.target.value)}>
              <option value="">Danh mục</option>
              {categoryOptions.map((c) => (
                <option key={c.categoryid} value={c.categoryid}>{c.name}</option>
              ))}
            </select>
          </div>
          <div className="col-md-3">
            <select className="form-select" value={statusInput} onChange={(e) => onStatusChange(e.target.value)}>
              <option value="">Trạng thái</option>
              <option value="1">Còn hàng</option>
              <option value="2">Hết hàng</option>
              <option value="3">Ngừng kinh doanh</option>
            </select>
          </div>
          <div className="col-md-2">
            <input type="text" className="form-control" placeholder="Giá từ"
              value={minPriceInput ? Number(minPriceInput.toString().replace(/\D/g, "")).toLocaleString("vi-VN") : ""}
              onChange={(e) => onMinPriceChange(e.target.value)} />
          </div>
          <div className="col-md-2">
            <input type="text" className="form-control" placeholder="Đến giá"
              value={maxPriceInput ? Number(maxPriceInput.toString().replace(/\D/g, "")).toLocaleString("vi-VN") : ""}
              onChange={(e) => onMaxPriceChange(e.target.value)} />
          </div>
          <div className="col-md-2 d-flex gap-2">
            <button className="btn btn-primary w-100" onClick={onFilter}>Tìm</button>
            <button className="btn btn-secondary w-100" onClick={onReset}>Reset</button>
          </div>
        </div>
      </div>
    </>
  );
}
