{showForm && (
  <section className="product-section">
    <h2>{editId ? "Edit Produk" : "Tambah Produk Baru"}</h2>

    <form  onSubmit={handleSubmit}>
      <div>
        <label>Nama Produk</label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="Masukkan nama produk"
        />
      </div>

      <div>
        <label>Kategori</label>
        <select
          name="category"
          value={formData.category}
          onChange={handleChange}
        >
          <option value="Laptop">Laptop</option>
          <option value="HP">HP</option>
        </select>
      </div>

      <div>
        <label>Brand</label>
        <input
          type="text"
          name="brand"
          value={formData.brand}
          onChange={handleChange}
          placeholder="Contoh: ASUS"
        />
      </div>

      <div>
        <label>Deskripsi</label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Deskripsi produk"
        />
      </div>

      <div>
        <label>Harga</label>
        <input
          type="number"
          name="price"
          value={formData.price}
          onChange={handleChange}
          placeholder="Masukkan harga"
        />
      </div>

      <div>
        <label>Stok</label>
        <input
          type="number"
          name="stock"
          value={formData.stock}
          onChange={handleChange}
          placeholder="Masukkan jumlah stok"
        />
      </div>

    <div>
  <label>Foto Produk</label>

  <input
    type="file"
    accept="image/jpeg,image/png,image/webp"
    onChange={handleImageChange}
  />

  {imagePreview && (
    <img
      src={imagePreview}
      alt="Preview produk"
      style={{
        width: "150px",
        height: "120px",
        objectFit: "cover",
        marginTop: "10px",
        borderRadius: "8px"
      }}
    />
  )}
</div>

      <button type="submit" className="add-button">
        Simpan Produk
      </button>
    </form>
  </section>  