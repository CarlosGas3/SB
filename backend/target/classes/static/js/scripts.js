const spotifyPlayer = () => {
    const btn = document.getElementById("spotify");
    const overlay = document.getElementById("overlay");

    btn.addEventListener("click", () => {
        overlay.style.display = (overlay.style.display === "block") ? "none" : "block";
    });
}

const DEFAULT_PRODUCT_IMAGE = "/assets/logoPNGwhite.png";
const CART_STORAGE_KEY = "cart";
const CURRENT_USER_KEY = "currentUser";

function getStoredUser() {
    try {
        return JSON.parse(localStorage.getItem(CURRENT_USER_KEY) || "null");
    } catch {
        return null;
    }
}

function saveStoredUser(user) {
    if (!user) {
        localStorage.removeItem(CURRENT_USER_KEY);
        return;
    }
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
}

function clearStoredUser() {
    localStorage.removeItem(CURRENT_USER_KEY);
}

// --- Cart helpers (store in localStorage under 'cart') ---
function getCart() {
    try {
        const raw = localStorage.getItem(CART_STORAGE_KEY);
        return raw ? JSON.parse(raw) : [];
    } catch (e) {
        return [];
    }
}

function saveCart(cart) {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    updateCartCount();
}

function addToCart(item) {
    const cart = getCart();
    const existing = cart.find(i => i.productId === item.productId && i.size === item.size);
    if (existing) {
        existing.quantity = (existing.quantity || 1) + 1;
        if (!existing.image && item.image) {
            existing.image = item.image;
        }
    } else {
        cart.push({
            ...item,
            quantity: 1,
            image: item.image || DEFAULT_PRODUCT_IMAGE,
            unitPrice: Number(item.unitPrice) || 0
        });
    }
    saveCart(cart);
}

function updateCartItem(productId, size, quantity) {
    const cart = getCart();
    const nextCart = cart
        .map(item => {
            if (item.productId === productId && item.size === size) {
                const nextQuantity = Number(quantity);
                if (nextQuantity <= 0) {
                    return null;
                }
                return { ...item, quantity: nextQuantity };
            }
            return item;
        })
        .filter(Boolean);
    saveCart(nextCart);
}

function removeCartItem(productId, size) {
    const cart = getCart().filter(item => !(item.productId === productId && item.size === size));
    saveCart(cart);
}

function clearCart() {
    localStorage.removeItem(CART_STORAGE_KEY);
    updateCartCount();
}

function updateCartCount() {
    const cart = getCart();
    const count = cart.reduce((s, it) => s + (it.quantity || 0), 0);
    const el = document.getElementById('cartCount');
    if (el) el.textContent = count > 0 ? `(${count})` : '';
}

function formatCurrency(value) {
    return new Intl.NumberFormat('es-ES', {
        style: 'currency',
        currency: 'EUR'
    }).format(Number(value) || 0);
}

function isValidEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value || '');
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
                        image: imageUrl,
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
                        image: imgSrc,
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

    // overlay = capa superior (frente); img = capa inferior (fondo, siempre opacity:1)
    // Solo se anima la capa superior 1→0, evitando el oscurecimiento por compositing
    const overlay = document.createElement("img");
    overlay.alt = img.alt;
    overlay.src = img.src;
    wrap.appendChild(overlay);

    return (newSrc) => {
        // Cargar nueva imagen en el fondo (oculta bajo el frente)
        img.src = newSrc;
        // Desvanecer el frente para revelar el fondo → crossfade sin oscurecimiento
        overlay.style.opacity = "0";
        setTimeout(() => {
            // Restaurar el frente instantáneamente al nuevo src (sin transición visible)
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

// ===== FORMULARIO DE CONTACTO =====
const initContactForm = () => {
    const form = document.getElementById("contactForm");
    const artistInfoFieldset = document.getElementById("artistInfo");
    const brandInfoFieldset = document.getElementById("brandInfo");
    const userTypeRadios = document.querySelectorAll('input[name="userType"]');
    const successMessage = document.getElementById("successMessage");

    // Mostrar/ocultar campos según el tipo de usuario
    const updateFormFieldsVisibility = () => {
        const selectedType = document.querySelector('input[name="userType"]:checked')?.value;

        if (selectedType === "artist") {
            artistInfoFieldset.style.display = "block";
            brandInfoFieldset.style.display = "none";
            // Marcar campos de artista como requeridos
            document.getElementById("artistName").required = true;
            document.getElementById("genre").required = true;
            document.getElementById("bio").required = true;
        } else if (selectedType === "brand") {
            artistInfoFieldset.style.display = "none";
            brandInfoFieldset.style.display = "block";
            // Marcar campos de marca como requeridos
            document.getElementById("companyName").required = true;
            document.getElementById("industry").required = true;
            document.getElementById("brandBio").required = true;
        } else {
            artistInfoFieldset.style.display = "none";
            brandInfoFieldset.style.display = "none";
        }
    };

    // Event listeners para cambiar tipo de usuario
    userTypeRadios.forEach(radio => {
        radio.addEventListener("change", updateFormFieldsVisibility);
    });

    // Validación y envío del formulario
    form.addEventListener("submit", (e) => {
        e.preventDefault();

        // Validar que se seleccionar tipo de usuario
        const selectedType = document.querySelector('input[name="userType"]:checked');
        if (!selectedType) {
            alert("Por favor, selecciona el tipo de usuario.");
            return;
        }

        // Validar al menos una opción de colaboración
        const collaborationCheckboxes = document.querySelectorAll('input[name="collaborationType"]');
        const anyCollaborationSelected = Array.from(collaborationCheckboxes).some(cb => cb.checked);
        if (!anyCollaborationSelected) {
            alert("Por favor, selecciona al menos un tipo de colaboración.");
            return;
        }

        // Validar archivo (si lo hay)
        const fileInput = document.getElementById("files");
        if (fileInput.files.length > 0) {
            for (let file of fileInput.files) {
                if (file.size > 10 * 1024 * 1024) { // 10MB
                    alert(`El archivo "${file.name}" supera el tamaño máximo de 10MB.`);
                    return;
                }
            }
            if (fileInput.files.length > 5) {
                alert("No puedes adjuntar más de 5 archivos.");
                return;
            }
        }

        // Si todas las validaciones pasan, mostrar mensaje de éxito
        // En un caso real, aquí enviarías los datos al servidor
        console.log("Formulario válido. Datos listos para enviar:");
        const formData = new FormData(form);
        console.log(Object.fromEntries(formData));

        // Ocultar formulario y mostrar mensaje de éxito
        form.style.display = "none";
        successMessage.style.display = "block";

        // Opcional: Recargar después de 5 segundos
        setTimeout(() => {
            form.reset();
            form.style.display = "block";
            successMessage.style.display = "none";
        }, 5000);
    });

    // Mostrar contador de caracteres en los textareas
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
                saveStoredUser(result.data);
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
                saveStoredUser(result.data);
                showAuthMessage("Cuenta creada correctamente", true);
                registerForm.reset();
                setTimeout(() => window.location.href = 'inicio.html', 700);
            } else {
                showAuthMessage(result.message || "Error creando la cuenta", false);
            }
        });
    }

    function showAuthMessage(message, success) {
        if (!authMessage) return;
        authMessage.textContent = message;
        authMessage.style.color = success ? "#1b5e20" : "#b71c1c";
        authMessage.style.display = "block";
    }
};

function renderCartPage() {
    const cartItemsContainer = document.getElementById("cart-items");
    const cartFooter = document.getElementById("cart-footer");
    const cartAlert = document.getElementById("cart-alert");
    const cartTotal = document.getElementById("cart-total");
    const paymentCardSelect = document.getElementById("paymentCard");
    const newPaymentCardInput = document.getElementById("newPaymentCard");
    const guestEmailContainer = document.getElementById("guestEmailContainer");
    const guestEmailInput = document.getElementById("guestEmail");
    const checkoutHint = document.getElementById("checkoutHint");

    if (!cartItemsContainer) {
        return;
    }

    const cart = getCart();
    const currentUser = getStoredUser();

    cartItemsContainer.innerHTML = "";

    if (!cart.length) {
        cartItemsContainer.innerHTML = '<div class="empty-state">Tu carrito está vacío. Añade productos desde el menú y vuelve aquí para finalizar la compra.</div>';
        cartFooter.classList.add("hidden");
        cartAlert.classList.add("hidden");
        return;
    }

    const subtotal = cart.reduce((sum, item) => sum + Number(item.unitPrice || 0) * Number(item.quantity || 1), 0);
    cartTotal.textContent = formatCurrency(subtotal);
    cartFooter.classList.remove("hidden");

    cart.forEach(item => {
        const itemTotal = Number(item.unitPrice || 0) * Number(item.quantity || 1);
        const wrapper = document.createElement("article");
        wrapper.className = "cart-item";

        wrapper.innerHTML = `
            <img src="${item.image || DEFAULT_PRODUCT_IMAGE}" alt="${item.name || 'Producto'}">
            <div class="cart-item-info">
                <h3>${item.name || 'Producto'}</h3>
                <p>Precio unitario: ${formatCurrency(item.unitPrice || 0)}</p>
                <p>Subtotal: ${formatCurrency(itemTotal)}</p>
            </div>
            <div class="cart-item-actions">
                <label>
                    Cantidad
                    <input type="number" min="1" value="${item.quantity || 1}" data-product-id="${item.productId}" data-size="${item.size || ''}">
                </label>
                <button type="button" class="secondary-button" data-remove-product-id="${item.productId}" data-remove-size="${item.size || ''}">Eliminar</button>
            </div>`;

        cartItemsContainer.appendChild(wrapper);
    });

    cartItemsContainer.querySelectorAll('input[type="number"]').forEach(input => {
        input.addEventListener('change', (event) => {
            const quantity = Number(event.target.value);
            updateCartItem(event.target.dataset.productId, event.target.dataset.size, quantity);
            renderCartPage();
        });
    });

    cartItemsContainer.querySelectorAll('[data-remove-product-id]').forEach(button => {
        button.addEventListener('click', () => {
            removeCartItem(button.dataset.removeProductId, button.dataset.removeSize);
            renderCartPage();
        });
    });

    paymentCardSelect.innerHTML = "";

    const placeholderOption = document.createElement("option");
    placeholderOption.value = "";
    placeholderOption.textContent = currentUser?.tarjetaCredito ? "Usar tarjeta guardada" : "Selecciona una tarjeta guardada";
    paymentCardSelect.appendChild(placeholderOption);

    if (currentUser?.tarjetaCredito) {
        const savedOption = document.createElement("option");
        savedOption.value = currentUser.tarjetaCredito;
        savedOption.textContent = currentUser.tarjetaCredito;
        paymentCardSelect.appendChild(savedOption);
        paymentCardSelect.value = currentUser.tarjetaCredito;
    }

    if (guestEmailContainer && guestEmailInput) {
        const isGuest = !currentUser?.email;
        guestEmailContainer.classList.toggle("hidden", !isGuest);
        if (!isGuest) {
            guestEmailInput.value = "";
        }
    }

    if (currentUser?.email) {
        if (currentUser.tarjetaCredito) {
            checkoutHint.textContent = `Puedes usar la tarjeta guardada de ${currentUser.email} o añadir una nueva para esta compra.`;
            cartAlert.classList.add("hidden");
        } else {
            checkoutHint.textContent = "No tienes una tarjeta guardada. Añade una nueva tarjeta para completar la compra.";
            cartAlert.classList.remove("hidden");
            cartAlert.textContent = "No tienes una tarjeta guardada. Puedes añadir una nueva tarjeta en el campo de abajo.";
        }
    } else {
        checkoutHint.textContent = "Introduce tu correo electrónico y una tarjeta para recibir la confirmación de la compra.";
        cartAlert.classList.remove("hidden");
        cartAlert.textContent = "No has iniciado sesión. Introduce tu correo y una tarjeta para continuar.";
    }

    if (newPaymentCardInput) {
        newPaymentCardInput.value = "";
    }
}

async function handleCheckout(event) {
    event.preventDefault();

    const currentUser = getStoredUser();
    const cart = getCart();
    const paymentCardSelect = document.getElementById("paymentCard");
    const newPaymentCardInput = document.getElementById("newPaymentCard");
    const guestEmailInput = document.getElementById("guestEmail");
    const successModal = document.getElementById("successModal");
    const successText = document.getElementById("successMessageText");
    const checkoutEmail = (currentUser?.email || guestEmailInput?.value || "").trim();
    const selectedCard = ((newPaymentCardInput?.value || "").trim() || (paymentCardSelect?.value || "").trim());

    if (!checkoutEmail) {
        alert("Introduce tu correo electrónico para recibir la confirmación.");
        return;
    }

    if (!isValidEmail(checkoutEmail)) {
        alert("Introduce un correo electrónico válido.");
        return;
    }

    if (!selectedCard) {
        alert("Añade una tarjeta válida o selecciona una tarjeta guardada para continuar.");
        return;
    }

    if (!cart.length) {
        alert("Tu carrito está vacío.");
        return;
    }

    const payload = {
        email: checkoutEmail,
        items: cart.map(item => ({
            productId: item.productId,
            name: item.name,
            unitPrice: Number(item.unitPrice) || 0,
            quantity: item.quantity || 1,
            size: item.size || null
        })),
        shippingInfo: {
            name: currentUser?.name || checkoutEmail.split("@")[0] || "Cliente",
            address: currentUser?.address || "Sin dirección",
            city: currentUser?.city || "Sin ciudad",
            postalCode: "",
            country: currentUser?.country || "España",
            phone: currentUser?.phone || ""
        },
        paymentCard: selectedCard
    };

    if (currentUser?.id) {
        payload.userId = currentUser.id;
    }

    try {
        const response = await fetch("/api/purchases", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        const result = await response.json();
        if (!response.ok || !result.success) {
            throw new Error(result.message || "No se pudo completar la compra");
        }

        clearCart();
        successText.textContent = `Tu compra se ha realizado correctamente. Se ha enviado un correo a ${checkoutEmail}.`;
        successModal.classList.remove("hidden");

        setTimeout(() => {
            window.location.href = "inicio.html";
        }, 1800);
    } catch (error) {
        alert(error.message || "No se pudo completar la compra.");
    }
}

function initCartPage() {
    const checkoutForm = document.getElementById("checkoutForm");
    const goHomeButton = document.getElementById("goHomeButton");

    renderCartPage();

    if (checkoutForm) {
        checkoutForm.addEventListener("submit", handleCheckout);
    }

    if (goHomeButton) {
        goHomeButton.addEventListener("click", () => {
            window.location.href = "inicio.html";
        });
    }
}

// Inicializar el formulario cuando el DOM esté listo
document.addEventListener("DOMContentLoaded", () => {
    if (document.getElementById("contactForm")) {
        initContactForm();
    }
    if (document.getElementById("loginForm") || document.getElementById("registerForm")) {
        initAuthForms();
    }
    if (document.getElementById("checkoutForm")) {
        initCartPage();
    }
});

