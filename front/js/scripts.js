const spotifyPlayer = () => {
    const btn = document.getElementById("spotify");
    const overlay = document.getElementById("overlay");

    btn.addEventListener("click", () => {
        overlay.style.display = (overlay.style.display === "block") ? "none" : "block";
    });
}

const DEFAULT_PRODUCT_IMAGE = "/assets/logoPNGwhite.png";

// --- Cart helpers (store in localStorage under 'cart') ---
function getCart() {
    try {
        const raw = localStorage.getItem('cart');
        return raw ? JSON.parse(raw) : [];
    } catch (e) {
        return [];
    }
}

function saveCart(cart) {
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
}

function addToCart(item) {
    const cart = getCart();
    const existing = cart.find(i => i.productId === item.productId && i.size === item.size);
    if (existing) {
        existing.quantity = (existing.quantity || 1) + 1;
    } else {
        cart.push({ ...item, quantity: 1 });
    }
    saveCart(cart);
}

function clearCart() {
    localStorage.removeItem('cart');
    updateCartCount();
}

function updateCartCount() {
    const cart = getCart();
    const count = cart.reduce((s, it) => s + (it.quantity || 0), 0);
    const el = document.getElementById('cartCount');
    if (el) el.textContent = count > 0 ? `(${count})` : '';
}

function showTempMessage(text, timeout = 1500) {
    let el = document.getElementById('tempMessage');
    if (!el) {
        el = document.createElement('div');
        el.id = 'tempMessage';
        el.style.position = 'fixed';
        el.style.right = '20px';
        el.style.bottom = '20px';
        el.style.background = '#1b5e20';
        el.style.color = '#fff';
        el.style.padding = '10px 14px';
        el.style.borderRadius = '6px';
        el.style.zIndex = '9999';
        document.body.appendChild(el);
    }
    el.textContent = text;
    el.style.display = 'block';
    setTimeout(() => el.style.display = 'none', timeout);
}

function createImageElement(src, alt) {
    const img = document.createElement("img");
    img.src = src || DEFAULT_PRODUCT_IMAGE;
    img.alt = alt || "Producto";
    img.onerror = () => {
        img.onerror = null;
        img.src = DEFAULT_PRODUCT_IMAGE;
    };
    return img;
}

async function loadProductsVinsi() {
    try {
        let products;
        try {
            const res = await fetch("/api/mock/products/vinsi");
            if (!res.ok) throw new Error("API no disponible");
            products = await res.json();
        } catch {
            const res = await fetch("../JSON/productsVinsi72.json");
            products = await res.json();
        }

        const container = document.getElementById("products");
        container.innerHTML = "";

        products.forEach((p) => {
            const div = document.createElement("div");
            div.className = "product";
            let price = p.price ? p.price + "€" : "Este producto no está disponible por ahora.";
            let btnText = isNaN(p.price) ? "Ver producto" : "Añadir al carrito";
            const imageUrl = p.images?.[0]?.url || DEFAULT_PRODUCT_IMAGE;

            const image = createImageElement(imageUrl, p.name);
            const title = document.createElement("h3");
            title.textContent = p.name;
            const priceEl = document.createElement("p");
            priceEl.textContent = price;
            const button = document.createElement("button");
            button.textContent = btnText;
            if (!isNaN(p.price) && p.price !== null && p.price !== undefined) {
                button.addEventListener("click", () => {
                    addToCart({
                        productId: p.id || p.url || p.name,
                        name: p.name,
                        unitPrice: parseFloat(p.price),
                        size: null
                    });
                    showTempMessage("Producto añadido al carrito");
                });
            } else {
                button.addEventListener("click", () => window.open(`https://www.vinsi72.com${p.url}`, "_blank"));
            }

            div.append(image, title, priceEl, button);
            container.appendChild(div);
        });
    } catch (error) {
        console.error("Error cargando productos:", error);
        document.getElementById("products").innerText =
            "Error cargando productos.";
    }
}

async function loadProductsBose() {
    try {
        let data;
        try {
            const res = await fetch("/api/mock/products/bose");
            if (!res.ok) throw new Error("API no disponible");
            data = await res.json();
        } catch {
            const res = await fetch("../JSON/productsBose.json");
            data = await res.json();
        }
        const products = data.products;
        const container = document.getElementById("products");
        container.innerHTML = "";

        products.forEach((p) => {
            const div = document.createElement("div");
            div.className = "product";

            const variant = p.variants?.[0];
            const price = variant?.price
                ? variant.price + "€"
                : "Este producto no está disponible por ahora.";
            const btnText = variant?.price ? "Añadir al carrito" : "Ver producto";
            const imgSrc = p.images?.[0]?.src || variant?.featured_image?.src || DEFAULT_PRODUCT_IMAGE;
            const productUrl = `https://bosecondieresis.net/products/${p.handle}`;

            const image = createImageElement(imgSrc, p.title);
            const title = document.createElement("h3");
            title.textContent = p.title;
            const priceEl = document.createElement("p");
            priceEl.textContent = price;
            const button = document.createElement("button");
            button.textContent = btnText;
            if (variant?.price) {
                button.addEventListener("click", () => {
                    addToCart({
                        productId: p.handle || p.id || p.title,
                        name: p.title,
                        unitPrice: parseFloat(variant.price),
                        size: null
                    });
                    showTempMessage("Producto añadido al carrito");
                });
            } else {
                button.addEventListener("click", () => window.open(productUrl, "_blank"));
            }

            div.append(image, title, priceEl, button);
            container.appendChild(div);
        });
    } catch (error) {
        console.error("Error cargando productos:", error);
        document.getElementById("products").innerText =
            "Error cargando productos.";
    }
}

const _setupCrossfade = (img) => {
    const wrap = document.createElement("div");
    wrap.className = "img-crossfade-wrap";
    img.parentNode.insertBefore(wrap, img);
    wrap.appendChild(img);

    const overlay = document.createElement("img");
    overlay.alt = img.alt;
    overlay.src = img.src;
    wrap.appendChild(overlay);

    return (newSrc) => {
        img.src = newSrc;
        overlay.style.opacity = "0";
        setTimeout(() => {
            overlay.src = newSrc;
            overlay.style.transition = "none";
            overlay.style.opacity = "1";
            requestAnimationFrame(() => requestAnimationFrame(() => {
                overlay.style.transition = "";
            }));
        }, 680);
    };
};

const cambiarImagenMerchan = () => {
    const img = document.getElementById("merchan");
    if (!img) return;
    const imagenes = [
        "../assets/merchan/bbo.jpg",
        "../assets/merchan/mgLogo.jpg",
        "../assets/merchan/peelingflesh.jpg"
    ];
    let indice = 0;
    const crossfade = _setupCrossfade(img);
    setInterval(() => {
        indice = (indice + 1) % imagenes.length;
        crossfade(imagenes[indice]);
    }, 5000);
};

const cambiarImagenIndie = () => {
    const img = document.getElementById("indie");
    if (!img) return;
    const imagenes = [
        "../assets/indie/0pulenz3.jpg",
        "../assets/indie/bosecondieresis.jpg",
        "../assets/indie/vinsi72.jpg"
    ];
    let indice = 0;
    const crossfade = _setupCrossfade(img);
    setTimeout(() => {
        setInterval(() => {
            indice = (indice + 1) % imagenes.length;
            crossfade(imagenes[indice]);
        }, 5000);
    }, 2500);
};

const initContactForm = () => {
    const form = document.getElementById("contactForm");
    const artistInfoFieldset = document.getElementById("artistInfo");
    const brandInfoFieldset = document.getElementById("brandInfo");
    const userTypeRadios = document.querySelectorAll('input[name="userType"]');
    const successMessage = document.getElementById("successMessage");

    const updateFormFieldsVisibility = () => {
        const selectedType = document.querySelector('input[name="userType"]:checked')?.value;

        if (selectedType === "artist") {
            artistInfoFieldset.style.display = "block";
            brandInfoFieldset.style.display = "none";
            document.getElementById("artistName").required = true;
            document.getElementById("genre").required = true;
            document.getElementById("bio").required = true;
        } else if (selectedType === "brand") {
            artistInfoFieldset.style.display = "none";
            brandInfoFieldset.style.display = "block";
            document.getElementById("companyName").required = true;
            document.getElementById("industry").required = true;
            document.getElementById("brandBio").required = true;
        } else {
            artistInfoFieldset.style.display = "none";
            brandInfoFieldset.style.display = "none";
        }
    };

    userTypeRadios.forEach(radio => {
        radio.addEventListener("change", updateFormFieldsVisibility);
    });

    form.addEventListener("submit", (e) => {
        e.preventDefault();

        const selectedType = document.querySelector('input[name="userType"]:checked');
        if (!selectedType) {
            alert("Por favor, selecciona el tipo de usuario.");
            return;
        }

        const collaborationCheckboxes = document.querySelectorAll('input[name="collaborationType"]');
        const anyCollaborationSelected = Array.from(collaborationCheckboxes).some(cb => cb.checked);
        if (!anyCollaborationSelected) {
            alert("Por favor, selecciona al menos un tipo de colaboración.");
            return;
        }

        const fileInput = document.getElementById("files");
        if (fileInput.files.length > 0) {
            for (let file of fileInput.files) {
                if (file.size > 10 * 1024 * 1024) {
                    alert(`El archivo "${file.name}" supera el tamaño máximo de 10MB.`);
                    return;
                }
            }
            if (fileInput.files.length > 5) {
                alert("No puedes adjuntar más de 5 archivos.");
                return;
            }
        }

        console.log("Formulario válido. Datos listos para enviar:");
        const formData = new FormData(form);
        console.log(Object.fromEntries(formData));

        form.style.display = "none";
        successMessage.style.display = "block";

        setTimeout(() => {
            form.reset();
            form.style.display = "block";
            successMessage.style.display = "none";
        }, 5000);
    });

    const textareas = document.querySelectorAll("textarea");
    textareas.forEach(textarea => {
        textarea.addEventListener("input", () => {
            const maxLength = textarea.getAttribute("maxlength");
            const currentLength = textarea.value.length;
            console.log(`${currentLength}/${maxLength} caracteres`);
        });
    });
};

const initAuthForms = () => {
    const authMessage = document.getElementById("authMessage");
    const loginForm = document.getElementById("loginForm");
    const registerForm = document.getElementById("registerForm");

    const showAuthMessage = (message, success) => {
        if (!authMessage) return;
        authMessage.textContent = message;
        authMessage.style.color = success ? "#1b5e20" : "#b71c1c";
        authMessage.style.display = "block";
    };

    if (loginForm) {
        loginForm.addEventListener("submit", async (event) => {
            event.preventDefault();
            const email = document.getElementById("loginEmail").value.trim();
            const password = document.getElementById("loginPassword").value.trim();

            const response = await fetch("/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password })
            });
            const result = await response.json();
            if (response.ok && result.success) {
                showAuthMessage("Login correcto", true);
                setTimeout(() => window.location.href = 'inicio.html', 700);
            } else {
                showAuthMessage(result.message || "Usuario o contraseña incorrectos", false);
            }
        });
    }

    if (registerForm) {
        registerForm.addEventListener("submit", async (event) => {
            event.preventDefault();
            const nombre = document.getElementById("regNombre").value.trim();
            const apellido = document.getElementById("regApellido").value.trim();
            const email = document.getElementById("regEmail").value.trim();
            const password = document.getElementById("regPassword").value.trim();
            const telefono = document.getElementById("regTelefono").value.trim();

            const response = await fetch("/api/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: `${nombre} ${apellido}`,
                    email,
                    password,
                    phone: telefono
                })
            });
            const result = await response.json();
            if (response.ok && result.success) {
                showAuthMessage("Cuenta creada correctamente", true);
                registerForm.reset();
                setTimeout(() => window.location.href = 'inicio.html', 700);
            } else {
                showAuthMessage(result.message || "Error creando la cuenta", false);
            }
        });
    }
};

// Inicializar el formulario cuando el DOM esté listo
document.addEventListener("DOMContentLoaded", () => {
    if (document.getElementById("contactForm")) {
        initContactForm();
    }
    if (document.getElementById("loginForm") || document.getElementById("registerForm")) {
        initAuthForms();
    }
});
