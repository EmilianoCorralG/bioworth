import React, { useState, useEffect, useRef } from "react";
import emailjs from "@emailjs/browser";
import "./App.css";
import logo from "./assets/bioworth.jpg";
import estanteria from "./assets/estanteria.jpg";
import maceta from "./assets/maceta.jpg";
import bidet from "./assets/bidet.jpg";
import lampara from "./assets/lampara.jpg";
import cucharas from "./assets/cucharas.jpg";

function App() {
  const [view, setView] = useState("login");
  const [users, setUsers] = useState(() => JSON.parse(localStorage.getItem("users")) || []);
  const [currentUser, setCurrentUser] = useState(() => JSON.parse(localStorage.getItem("currentUser")) || null);
  const [cart, setCart] = useState(() => JSON.parse(localStorage.getItem("cart")) || []);
  const [purchases, setPurchases] = useState(() => JSON.parse(localStorage.getItem("purchases")) || []);
  const [filter, setFilter] = useState({ category: "all" });
  const [priceFilter, setPriceFilter] = useState("");
  const [form, setForm] = useState({ username: "", password: "" });
  const [isLogin, setIsLogin] = useState(true);
  const [profileData, setProfileData] = useState(currentUser?.profile || { name: "", address: "" });
  const [selectedProduct, setSelectedProduct] = useState(null);

  const buzonForm = useRef();
  const [status, setStatus] = useState("");

  const sendEmail = (e) => {
    e.preventDefault();
    setStatus("Enviando...");

    emailjs.sendForm(
      "service_q1zdm4f",
      "template_ldysfto",
      buzonForm.current,
      "ns07ThLPu0Lt1UR0j"
    )
    .then(() => {
      setStatus("¡Mensaje enviado con éxito!");
      buzonForm.current.reset();
    })
    .catch((error) => {
      console.error(error);
      setStatus("Error al enviar mensaje.");
    });
  };

  useEffect(() => localStorage.setItem("users", JSON.stringify(users)), [users]);
  useEffect(() => localStorage.setItem("currentUser", JSON.stringify(currentUser)), [currentUser]);
  useEffect(() => localStorage.setItem("cart", JSON.stringify(cart)), [cart]);
  useEffect(() => localStorage.setItem("purchases", JSON.stringify(purchases)), [purchases]);

  const catalog = [
    { id: 1, name: "Estantería ecológica", price: 1200, category: "Hogar", description: "Hecha con materiales reciclados, resistente y moderna.", image: estanteria },
    { id: 2, name: "Maceta ecológica", price: 350, category: "Hogar", description: "Perfecta para plantas pequeñas, hecha con materiales reciclados.", image: maceta },
    { id: 3, name: "Bidet portátil", price: 750, category: "Higiene", description: "Alternativa ecológica para el baño, reutilizable y práctica.", image: bidet },
    { id: 4, name: "Lámpara ecológica", price: 570, category: "Accesorios", description: "Funciona con energía solar, ideal para interiores o exteriores.", image: lampara },
    { id: 5, name: "Cucharas de bambú", price: 200, category: "Hogar", description: "Set de cucharas biodegradables, naturales y duraderas.", image: cucharas },
  ];

  const filteredCatalog = catalog.filter(
    (p) =>
      (filter.category === "all" || p.category === filter.category) &&
      (priceFilter === "" || p.price <= parseInt(priceFilter))
  );

  const handleAuth = () => {
    if (isLogin) {
      const user = users.find(
        (u) => u.username === form.username && u.password === form.password
      );
      if (user) {
        setCurrentUser(user);
        setProfileData(user.profile || { name: "", address: "" });
        setView("catalog");
      } else alert("Usuario o contraseña incorrectos.");
    } else {
      if (users.some((u) => u.username === form.username)) {
        alert("El usuario ya existe.");
      } else {
        const newUser = { username: form.username, password: form.password };
        setUsers([...users, newUser]);
        alert("Cuenta creada correctamente.");
        setIsLogin(true);
      }
    }
  };

  const saveProfile = () => {
    const updatedUser = { ...currentUser, profile: profileData };
    setCurrentUser(updatedUser);

    const updatedUsers = users.map((u) =>
      u.username === currentUser.username ? updatedUser : u
    );

    setUsers(updatedUsers);
    alert("Perfil guardado correctamente.");
    setView("catalog");
  };

  const addToCart = (product) => setCart([...cart, product]);
  const removeFromCart = (index) => setCart(cart.filter((_, i) => i !== index));
  const finalizePurchase = () => {
    if (cart.length === 0) return alert("Tu carrito está vacío.");
    const newPurchase = {
      user: currentUser.username,
      items: cart,
      total: cart.reduce((t, p) => t + p.price, 0),
      date: new Date().toLocaleString(),
    };
    setPurchases([...purchases, newPurchase]);
    setCart([]);
    alert("¡Compra finalizada!");
    setView("purchases");
  };

  const logout = () => {
    setCurrentUser(null);
    setView("login");
  };

  const handleClearFilters = () => {
    setFilter({ category: "all" });
    setPriceFilter("");
  };

  return (
    <div className="App">

      {/* LOGIN*/}
      {view === "login" && (
        <div className="login-container">
          <img src={logo} alt="BioWorth logo" className="logo" />
          <h1>BioWorth</h1>
          <h3>{isLogin ? "Inicia sesión" : "Crea una cuenta"}</h3>

          <input type="text" placeholder="Correo"
            value={form.username}
            onChange={(e) => setForm({ ...form, username: e.target.value })} />

          <input type="password" placeholder="Contraseña"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })} />

          <button onClick={handleAuth}>{isLogin ? "Entrar" : "Registrarse"}</button>

          <p onClick={() => setIsLogin(!isLogin)} className="switch">
            {isLogin ? "¿No tienes cuenta? Crear una" : "¿Ya tienes cuenta? Inicia sesión"}
          </p>
        </div>
      )}

      {/* CATÁLOGO*/}
      {view === "catalog" && (
        <div className="catalog-container">
          <header>
            <img
              src={logo}
              alt="BioWorth logo"
              className="logo small"
              onClick={() => setView("profile")}
              style={{ cursor: "pointer" }}
            />
            <h1>BioWorth</h1>
            <div className="user-controls">
              <button onClick={() => setView("cart")}>🛒 Carrito ({cart.length})</button>
              <button onClick={() => setView("purchases")}> Mis compras</button>
              <button onClick={() => setView("buzon")}>📩 Buzón</button>
              <button onClick={logout}> Cerrar sesión</button>
            </div>
          </header>

          {currentUser?.profile?.name && (
            <h2 className="welcome-text" style={{ margin: "10px 0" }}>
              ¡BIENVENIDO A NUESTRA TIENDA!, {currentUser.profile.name}!
            </h2>
          )}

          <div className="filters">
            <label>
              Categoría:
              <select
                value={filter.category}
                onChange={(e) => setFilter({ ...filter, category: e.target.value })}
              >
                <option value="all">Todas</option>
                <option value="Hogar">Hogar</option>
                <option value="Accesorios">Accesorios</option>
                <option value="Higiene">Higiene</option>
              </select>
            </label>

            <label className="price-filter">
              Precio máximo:
              <input
                type="number"
                value={priceFilter}
                onChange={(e) => setPriceFilter(e.target.value)}
                min="0"
              />
            </label>

            <button className="clear-filters" onClick={handleClearFilters}>
              Limpiar filtros
            </button>
          </div>

          <div className="products">
            {filteredCatalog.map((p) => (
              <div
                key={p.id}
                className="product"
                onClick={() => {
                  setSelectedProduct(p);
                  setView("product");
                }}
                style={{ cursor: "pointer" }}
              >
                <img src={p.image} alt={p.name} className="product-image" />
                <h3>{p.name}</h3>
                <p>{p.description}</p>
                <p className="price">${p.price} MXN</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* BUZÓN*/}
      {view === "buzon" && (
        <div className="buzon-container">
          <h2>📩 Buzón de Quejas y Sugerencias</h2>
          <form ref={buzonForm} onSubmit={sendEmail}>
            <label>Tu nombre</label>
            <input type="text" name="user_name" required />

            <label>Tu correo</label>
            <input type="email" name="user_email" required />

            <label>Mensaje</label>
            <textarea name="message" required />

            <button type="submit" className="back send-btn">Enviar</button>
            <p>{status}</p>
          </form>

          <button className="back" onClick={() => setView("catalog")}>⬅ Volver</button>
        </div>
      )}
      
      {/* PRODUCTO INDIVIDUAL */}
      {view === "product" && selectedProduct && (
        <div className="product-view">
          <h2>{selectedProduct.name}</h2>
          <img
            src={selectedProduct.image}
            alt={selectedProduct.name}
            className="product-image-large"
          />
          <p className="price">${selectedProduct.price} MXN</p>
          <p className="description">{selectedProduct.description}</p>
          <button className="finalize" onClick={() => addToCart(selectedProduct)}>
            🛒 Agregar al carrito
          </button>
          <button className="back" onClick={() => setView("catalog")}>⬅ Volver</button>
        </div>
      )}

      {/* PERFIL */}
      {view === "profile" && (
        <div className="profile-container">
          <h2>Mi perfil</h2>
          <label>Dirección:</label>
          <input type="text" value={profileData.address} onChange={(e) => setProfileData({ ...profileData, address: e.target.value })} />
          <label>Código Postal:</label>
          <input type="text" value={profileData.cp} onChange={(e) => setProfileData({ ...profileData, cp: e.target.value })} />
          <label>Estado:</label>
          <input type="text" value={profileData.state} onChange={(e) => setProfileData({ ...profileData, state: e.target.value })} />
          <label>Municipio:</label>
          <input type="text" value={profileData.municipality} onChange={(e) => setProfileData({ ...profileData, municipality: e.target.value })} />
          <label>Localidad:</label>
          <input type="text" value={profileData.locality} onChange={(e) => setProfileData({ ...profileData, locality: e.target.value })} />
          <label>Colonia:</label>
          <input type="text" value={profileData.cologne} onChange={(e) => setProfileData({ ...profileData, cologne: e.target.value })} />
          <label>Nombre:</label>
          <input type="text" value={profileData.name} onChange={(e) => setProfileData({ ...profileData, name: e.target.value })} />
          <label>num teléfono:</label>
          <input type="text" value={profileData.phone} onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })} />
          <label>Información adicional:</label>
          <input type="text" value={profileData.info} onChange={(e) => setProfileData({ ...profileData, info: e.target.value })} />
          <button className="save-profile" onClick={saveProfile}>Guardar cambios</button>
          <button className="back" onClick={() => setView("catalog")}>⬅ Volver</button>
        </div>
      )}

      {/* CARRITO */}
      {view === "cart" && (
        <div className="cart-container">
          <h2> Tu carrito</h2>
          {cart.length === 0 ? (
            <>
              <p>No tienes productos en el carrito.</p>
              <button className="back" onClick={() => setView("catalog")}>⬅ Volver</button>
            </>
          ) : (
            <>
              <ul>
                {cart.map((p, i) => (
                  <li key={i}>
                    {p.name} - ${p.price} MXN
                    <button onClick={() => removeFromCart(i)}>❌ Quitar</button>
                  </li>
                ))}
              </ul>
              <h3>Total: ${cart.reduce((t, p) => t + p.price, 0)} MXN</h3>
              <div className="action-buttons">
                <button className="finalize" onClick={finalizePurchase}>✅Finalizar compra</button>
                <button className="back" onClick={() => setView("catalog")}>⬅ Volver</button>
              </div>
            </>
          )}
        </div>
      )}

      {/* HISTORIAL */}
      {view === "purchases" && (
        <div className="purchases-container">
          <h2> Historial de compras</h2>
          {purchases.filter(p => p.user === currentUser.username).length === 0 ? (
            <p>No has realizado compras todavía.</p>
          ) : (
            purchases.filter((p) => p.user === currentUser.username).map((p, i) => (
              <div key={i} className="purchase">
                <h4>{p.date}</h4>
                <ul>
                  {p.items.map((item, j) => (
                    <li key={j}>{item.name} - ${item.price} MXN</li>
                  ))}
                </ul>
                <p>Total: ${p.total} MXN</p>
              </div>
            ))
          )}
          <div className="action-buttons">
            <button className="back" onClick={() => setView("catalog")}>⬅ Volver</button>
          </div>
        </div>
      )}

    </div>
  );
}

export default App;
