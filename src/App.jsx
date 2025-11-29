import React, { useState, useEffect, useRef } from "react";
import emailjs from "@emailjs/browser";
import "./App.css";
import logo from "./assets/bioworth.jpg";
import estanteria from "./assets/estanteria.jpg";
import maceta from "./assets/maceta.jpg";
import bidet from "./assets/bidet.jpg";
import lampara from "./assets/lampara.jpg";
import cucharas from "./assets/cucharas.jpg";

import { auth, db } from "./firebase";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut
} from "firebase/auth";
import { doc, setDoc, getDoc, updateDoc } from "firebase/firestore";

function App() {
  const [view, setView] = useState("login");
  const [currentUser, setCurrentUser] = useState(null);
  const [profileData, setProfileData] = useState({
    name: "",
    address: "",
    cart: [],
    purchases: []
  });

  const [filter, setFilter] = useState({ category: "all" });
  const [priceFilter, setPriceFilter] = useState("");
  const [form, setForm] = useState({ username: "", password: "" });
  const [isLogin, setIsLogin] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const buzonForm = useRef();
  const [status, setStatus] = useState("");

  const sendEmail = (e) => {
    e.preventDefault();
    setStatus("Enviando...");

    emailjs
      .sendForm(
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

  const catalog = [
    {
      id: 1,
      name: "Estantería ecológica",
      price: 1200,
      category: "Hogar",
      description: "Hecha con materiales reciclados, resistente y moderna.",
      image: estanteria
    },
    {
      id: 2,
      name: "Maceta ecológica",
      price: 350,
      category: "Hogar",
      description:
        "Perfecta para plantas pequeñas, hecha con materiales reciclados.",
      image: maceta
    },
    {
      id: 3,
      name: "Bidet portátil",
      price: 750,
      category: "Higiene",
      description:
        "Alternativa ecológica para el baño, reutilizable y práctica.",
      image: bidet
    },
    {
      id: 4,
      name: "Lámpara ecológica",
      price: 570,
      category: "Accesorios",
      description:
        "Funciona con energía solar, ideal para interiores o exteriores.",
      image: lampara
    },
    {
      id: 5,
      name: "Cucharas de bambú",
      price: 200,
      category: "Hogar",
      description:
        "Set de cucharas biodegradables, naturales y duraderas.",
      image: cucharas
    }
  ];

  const filteredCatalog = catalog.filter(
    (p) =>
      (filter.category === "all" || p.category === filter.category) &&
      (priceFilter === "" || p.price <= parseInt(priceFilter))
  );

  const handleAuth = async () => {
    if (isLogin) {
      try {
        const userCredential = await signInWithEmailAndPassword(
          auth,
          form.username,
          form.password
        );

        const uid = userCredential.user.uid;

        const userRef = doc(db, "users", uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          setCurrentUser({ uid, ...userSnap.data() });
          setProfileData({
            ...userSnap.data(),
            cart: userSnap.data().cart || [],
            purchases: userSnap.data().purchases || []
          });

          setView("catalog");
        } else {
          alert("No se encontraron datos del usuario.");
        }
      } catch (err) {
        alert("Error al iniciar sesión: " + err.message);
      }
    } else {
      try {
        const { user } = await createUserWithEmailAndPassword(
          auth,
          form.username,
          form.password
        );

        await setDoc(doc(db, "users", user.uid), {
          email: user.email,
          name: "",
          address: "",
          cart: [],
          purchases: []
        });

        alert("Cuenta creada correctamente.");
        setIsLogin(true);
      } catch (err) {
        alert("Error al crear la cuenta: " + err.message);
      }
    }
  };

  const saveProfile = async () => {
    const updatedUser = { ...profileData };
    const uid = auth.currentUser.uid;

    await updateDoc(doc(db, "users", uid), updatedUser);

    alert("Perfil guardado correctamente.");
    setView("catalog");
  };

  const addToCart = async (product) => {
    const uid = auth.currentUser.uid;
    const newCart = [...profileData.cart, product];

    setProfileData({ ...profileData, cart: newCart });
    await updateDoc(doc(db, "users", uid), { cart: newCart });
  };

  const removeFromCart = async (index) => {
    const uid = auth.currentUser.uid;
    const newCart = profileData.cart.filter((_, i) => i !== index);

    setProfileData({ ...profileData, cart: newCart });
    await updateDoc(doc(db, "users", uid), { cart: newCart });
  };

  const finalizePurchase = async () => {
    if (profileData.cart.length === 0)
      return alert("Tu carrito está vacío.");

    const uid = auth.currentUser.uid;

    const newPurchase = {
      items: profileData.cart,
      total: profileData.cart.reduce((t, p) => t + p.price, 0),
      date: new Date().toLocaleString()
    };

    const newPurchases = [...profileData.purchases, newPurchase];

    setProfileData({ ...profileData, cart: [], purchases: newPurchases });

    await updateDoc(doc(db, "users", uid), {
      cart: [],
      purchases: newPurchases
    });

    alert("¡Compra finalizada!");
    setView("purchases");
  };

  const logout = async () => {
    await signOut(auth);
    setCurrentUser(null);
    setView("login");
  };

  const handleClearFilters = () =>
    (setFilter({ category: "all" }), setPriceFilter(""));

  return (
    <div className="App">
      {/* LOGIN */}
      {view === "login" && (
        <div className="login-container">
          <img src={logo} className="logo" />
          <h1>BioWorth</h1>
          <h3>{isLogin ? "Inicia sesión" : "Crea una cuenta"}</h3>

          <input
            type="text"
            placeholder="Correo"
            value={form.username}
            onChange={(e) =>
              setForm({ ...form, username: e.target.value })
            }
          />

          <input
            type="password"
            placeholder="Contraseña"
            value={form.password}
            onChange={(e) =>
              setForm({ ...form, password: e.target.value })
            }
          />

          <button onClick={handleAuth}>
            {isLogin ? "Entrar" : "Registrarse"}
          </button>

          {/* BOTÓN DE INVITADO */}
          <button
            style={{ marginTop: "10px" }}
            onClick={() => {
              setCurrentUser({ uid: "guest" });
              setProfileData({ name: "Invitado", address: "", cart: [], purchases: [] });
              setView("catalog");
            }}
          >
            Entrar como invitado
          </button>

          <p
            className="switch"
            onClick={() => setIsLogin(!isLogin)}
          >
            {isLogin
              ? "¿No tienes cuenta? Crear una"
              : "¿Ya tienes cuenta? Inicia sesión"}
          </p>
        </div>
      )}

      {/* CATÁLOGO */}
      {view === "catalog" && (
        <div className="catalog-container">
          <header>
            <img
              src={logo}
              className="logo small"
              onClick={() => setView("profile")}
              style={{ cursor: "pointer" }}
            />
            <h1>BioWorth</h1>
            <div className="user-controls">
              <button onClick={() => setView("cart")}>
                🛒 Carrito ({profileData.cart.length})
              </button>
              <button onClick={() => setView("purchases")}>
                Mis compras
              </button>
              <button onClick={() => setView("buzon")}>
                📩 Buzón
              </button>
              <button onClick={logout}>Cerrar sesión</button>
            </div>
          </header>

          {profileData.name && (
            <h2 style={{ margin: "10px 0" }}>
              ¡BIENVENIDO A NUESTRA TIENDA!, {profileData.name}
            </h2>
          )}

          <div className="filters">
            <label>
              Categoría:
              <select
                value={filter.category}
                onChange={(e) =>
                  setFilter({ category: e.target.value })
                }
              >
                <option value="all">Todas</option>
                <option value="Hogar">Hogar</option>
                <option value="Accesorios">Accesorios</option>
                <option value="Higiene">Higiene</option>
              </select>
            </label>

            <label>
              Precio máximo:
              <input
                type="number"
                min="0"
                value={priceFilter}
                onChange={(e) => setPriceFilter(e.target.value)}
              />
            </label>

            <button className= "clear-filters" onClick={handleClearFilters}>Limpiar</button>
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
                <img src={p.image} className="product-image" />
                <h3>{p.name}</h3>
                <p>{p.description}</p>
                <p className="price">${p.price} MXN</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* BUZÓN */}
      {view === "buzon" && (
        <div className="buzon-container">
          <h2>📩 Buzón</h2>
          <form ref={buzonForm} onSubmit={sendEmail}>
            <label>Tu nombre</label>
            <input type="text" name="user_name" required />

            <label>Tu correo</label>
            <input type="email" name="user_email" required />

            <label>Mensaje</label>
            <textarea name="message" required />

            <button type="submit" className="send-button">
              Enviar
            </button>
            <p>{status}</p>
          </form>

          <button className="back" onClick={() => setView("catalog")}>
            ⬅ Volver
          </button>
        </div>
      )}

      {/* PRODUCT DETAIL */}
      {view === "product" && selectedProduct && (
        <div className="product-view">
          <h2>{selectedProduct.name}</h2>
          <img
            src={selectedProduct.image}
            className="product-image-large"
          />
          <p className="price">${selectedProduct.price} MXN</p>
          <p>{selectedProduct.description}</p>
          <button
            className="finalize"
            onClick={() => addToCart(selectedProduct)}
          >
            🛒 Agregar al carrito
          </button>
          <button className="back" onClick={() => setView("catalog")}>
            ⬅ Volver
          </button>
        </div>
      )}

      {/* PERFIL */}
      {view === "profile" && (
        <div className="profile-container">
          <h2>Mi perfil</h2>

          <label>Dirección:</label>
          <input
            type="text"
            value={profileData.address}
            onChange={(e) =>
              setProfileData({ ...profileData, address: e.target.value })
            }
          />

          <label>Código Postal:</label>
          <input
            type="text"
            value={profileData.cp || ""}
            onChange={(e) =>
              setProfileData({ ...profileData, cp: e.target.value })
            }
          />

          <label>Estado:</label>
          <input
            type="text"
            value={profileData.state || ""}
            onChange={(e) =>
              setProfileData({ ...profileData, state: e.target.value })
            }
          />

          <label>Municipio:</label>
          <input
            type="text"
            value={profileData.municipality || ""}
            onChange={(e) =>
              setProfileData({
                ...profileData,
                municipality: e.target.value
              })
            }
          />

          <label>Localidad:</label>
          <input
            type="text"
            value={profileData.locality || ""}
            onChange={(e) =>
              setProfileData({
                ...profileData,
                locality: e.target.value
              })
            }
          />

          <label>Colonia:</label>
          <input
            type="text"
            value={profileData.cologne || ""}
            onChange={(e) =>
              setProfileData({ ...profileData, cologne: e.target.value })
            }
          />

          <label>Nombre:</label>
          <input
            type="text"
            value={profileData.name}
            onChange={(e) =>
              setProfileData({ ...profileData, name: e.target.value })
            }
          />

          <label>Teléfono:</label>
          <input
            type="text"
            value={profileData.phone || ""}
            onChange={(e) =>
              setProfileData({ ...profileData, phone: e.target.value })
            }
          />

          <label>Información adicional:</label>
          <input
            type="text"
            value={profileData.info || ""}
            onChange={(e) =>
              setProfileData({ ...profileData, info: e.target.value })
            }
          />

          <button className="save-profile" onClick={saveProfile}>
            Guardar cambios
          </button>

          <button className="back" onClick={() => setView("catalog")}>
            ⬅ Volver
          </button>
        </div>
      )}

      {/* CARRITO */}
      {view === "cart" && (
        <div className="cart-container">
          <h2>Tu carrito</h2>

          {profileData.cart.length === 0 ? (
            <>
              <p>No tienes productos en el carrito.</p>
              <button className="back" onClick={() => setView("catalog")}>
                ⬅ Volver
              </button>
            </>
          ) : (
            <>
              <ul>
                {profileData.cart.map((p, i) => (
                  <li key={i}>
                    {p.name} - ${p.price} MXN
                    <button onClick={() => removeFromCart(i)}>
                      ❌ Quitar
                    </button>
                  </li>
                ))}
              </ul>

              <h3>
                Total: $
                {profileData.cart.reduce((t, p) => t + p.price, 0)} MXN
              </h3>

              <div className="action-buttons">
                <button className="finalize" onClick={finalizePurchase}>
                  ✅ Finalizar compra
                </button>
                <button className="back" onClick={() => setView("catalog")}>
                  ⬅ Volver
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {/* HISTORIAL */}
      {view === "purchases" && (
        <div className="purchases-container">
          <h2>Historial de compras</h2>

          {profileData.purchases.length === 0 ? (
            <p>No has realizado compras todavía.</p>
          ) : (
            profileData.purchases.map((p, i) => (
              <div key={i} className="purchase">
                <h4>{p.date}</h4>
                <ul>
                  {p.items.map((item, j) => (
                    <li key={j}>
                      {item.name} - ${item.price} MXN
                    </li>
                  ))}
                </ul>
                <p>Total: ${p.total} MXN</p>
              </div>
            ))
          )}

          <button className="back" onClick={() => setView("catalog")}>
            ⬅ Volver
          </button>
        </div>
      )}
    </div>
  );
}

export default App;
