

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import CustomerService from "../components/CustomerService.jsx";
export default function Catalog({ cart, setCart }) {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [category, setCategory] = useState("Semua");
  const [search, setSearch] = useState("");
  // const [showCheckout, setShowCheckout] = useState(false);
  

  const addToCart = (product) => {
  const existingProduct = cart.find(
    (item) => item.id === product.id
  );

  const currentQuantity = existingProduct
    ? existingProduct.quantity
    : 0;

  if (currentQuantity >= product.stock) {
    alert("Jumlah produk sudah mencapai batas stok!");
    return;
  }

  setCart((currentCart) => {
    const existing = currentCart.find(
      (item) => item.id === product.id
    );

    if (existing) {
      return currentCart.map((item) =>
        item.id === product.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      );
    }

    return [...currentCart, { ...product, quantity: 1 }];
  });

  alert(`${product.name} berhasil ditambahkan ke keranjang!`);
};

    const removeFromCart = (productId) => {
  setCart((currentCart) =>
    currentCart.filter((item) => item.id !== productId)
  );
};

  const fetchProducts = async () => {
    try {
      const response = await fetch(
        "http://127.0.0.1:5000/api/products"
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Gagal mengambil produk");
      }

      setProducts(data.products || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const totalPrice = cart.reduce(
  (total, item) => total + Number(item.price) * item.quantity,
  0
);

  const filteredProducts = products.filter((product) => {
  const matchCategory =
    category === "Semua" || product.category === category;

  const matchSearch =
    product.name.toLowerCase().includes(search.toLowerCase()) ||
    product.brand.toLowerCase().includes(search.toLowerCase());

  return matchCategory && matchSearch;
});
  return (
    <main className="catalog-page">
      
    <header className="catalog-header">
      <div className="catalog-header-content">
        <div>
          <h1>GadgetKu ID</h1>
          <p>Pilih laptop dan HP sesuai kebutuhan Anda.</p>
        </div>

       <button
        className="header-cart"
       onClick={() => navigate("/keranjang")}>
        🛒
        <span>
          {cart.reduce((total, item) => total + item.quantity, 0)}
        </span>
      </button>
      </div>
    </header>

        <CustomerService />

<div className="catalog-slider">
  <div className="catalog-slider-track">
    {[
  ...products,
  ...products,
  ...products,
  ...products,
  ...products,
  ...products
]

  .filter((product) => product.image)
  .map((product, index) => (
        <div className="catalog-slide" key={`${product.id}-${index}`}>
          <img
            src={`http://127.0.0.1:5000/uploads/${product.image}`}
            alt={product.name}
          />
          
        </div>
      ))}
  </div>

  <div className="catalog-banner-text">
    <h2>Temukan Laptop & HP Impianmu</h2>
    <p>Pilihan produk berkualitas untuk kebutuhan Anda.</p>
  </div>
</div>



      <section className="catalog-content">
        <h2>Katalog Produk</h2>
        <div className="catalog-search">
  <input
    type="text"
    placeholder="Cari nama laptop atau HP..."
    value={search}
    onChange={(e) => setSearch(e.target.value)}
  />
</div>
        <div className="catalog-filter">
          {["Semua", "Laptop", "HP"].map((item) => (
            <button
              key={item}
              className={category === item ? "active" : ""}
              onClick={() => setCategory(item)}
            >
              {item}
            </button>
          ))}
        </div>
        

        {loading ? (
          <p>Memuat produk...</p>
        ) : error ? (
          <p>{error}</p>
        ) : (
          <div className="catalog-grid">
            {filteredProducts.length > 0 ? (
              filteredProducts.map((product) => (
                <article className="catalog-card" key={product.id}>
                  {product.image ? (
                    <img
                      src={`http://127.0.0.1:5000/uploads/${product.image}`}
                      alt={product.name}
                    />
                  ) : (
                    <div className="catalog-no-image">
                      Foto belum tersedia
                    </div>
                  )}

                  <div className="catalog-card-info">
                    <span>{product.category}</span>
                    <h3>{product.name}</h3>
                    <p>{product.brand}</p>

                    <button
                      className="product-detail-btn"
                      onClick={() => navigate(`/produk/${product.id}`)}>
                      Lihat Detail
                    </button>

                    <h4>
                      Rp {Number(product.price).toLocaleString("id-ID")}
                    </h4>
                 <button
                  className="catalog-checkout-btn"
                  onClick={() => navigate("/keranjang")}>
                  🛒 Checkout
                </button>

                    <p>Stok: {product.stock}</p>

                    <button
                    className="catalog-add-btn"
                    disabled={product.stock <= 0}
                    onClick={() => addToCart(product)}>
                    {product.stock > 0 ? "＋ Pilih Produk" : "Stok Habis"}
                  </button>
                  </div>
                  

                </article>
                
              ))
            ) : (
              <p>Belum ada produk tersedia.</p>
            )}
          </div>
        )}
      </section>
      <footer className="catalog-footer">
        <h2>GadgetKu ID By IbnuGG</h2>
        <p>Temukan perangkat teknologi sesuai kebutuhan Anda.</p>

        <div className="footer-info">
          <span>💻 Laptop Berkualitas</span>
          <span>📱 HP Pilihan</span>
          <span>🛒 Belanja Mudah</span>
        </div>

        <p className="footer-copyright">
          © 2026 GadgetKu ID. All Rights Reserved.
        </p>
        </footer>
    </main>
  );
}
