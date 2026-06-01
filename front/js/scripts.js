const spotifyPlayer = () => {
    const btn = document.getElementById("spotify");
    const overlay = document.getElementById("overlay");

    btn.addEventListener("click", () => {
        overlay.style.display = (overlay.style.display === "block") ? "none" : "block";
    });
}

const DEFAULT_PRODUCT_IMAGE = "/assets/logoPNGwhite.png";

let productImageViewer = null;

function getProductImageViewer() {
    if (productImageViewer) {
        return productImageViewer;
    }

    const overlay = document.createElement("div");
    overlay.className = "product-image-viewer";

    const largeImage = document.createElement("img");
    largeImage.className = "product-image-viewer__img";
    largeImage.alt = "Imagen ampliada del producto";

    overlay.appendChild(largeImage);
    document.body.appendChild(overlay);

    const close = () => {
        overlay.classList.remove("is-open");
        largeImage.src = "";
    };

    overlay.addEventListener("click", (event) => {
        if (event.target === overlay) {
            close();
        }
    });

    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape" && overlay.classList.contains("is-open")) {
            close();
        }
    });

    productImageViewer = {
        open: (src, alt) => {
            largeImage.src = src;
            largeImage.alt = alt || "Imagen ampliada del producto";
            overlay.classList.add("is-open");
        },
    };

    return productImageViewer;
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
            const imgSrc = p.src || DEFAULT_PRODUCT_IMAGE;
            const productUrl = `https://bosecondieresis.net/products/${p.handle}`;

            const image = createImageElement(imgSrc, p.title);
            const title = document.createElement("h3");
            title.textContent = p.title;
            const priceEl = document.createElement("p");
            priceEl.textContent = price;
                    const button = document.createElement("button");
                    button.textContent = btnText;
                    button.addEventListener("click", () => {
                        const sizeSelect = div.querySelector('.size-select');
                        if (btnText === 'Añadir al carrito') {
                            const selectedSize = sizeSelect ? sizeSelect.value : '';
                            if (sizeSelect && !selectedSize) {
                                showPopup('Selecciona una talla antes de añadir al carrito', false);
                                return;
                            }
                            addToCart({
                                id: p.id || p.handle || p.title,
                                name: p.title,
                                image: imgSrc,
                                unitPrice: Number(variant?.price) || 0,
                                size: selectedSize,
                                options: (p.variants || []).map(v => v.title).filter(Boolean)
                            });
                            const _orig = button.textContent;
                            button.textContent = 'Añadido';
                            button.disabled = true;
                            setTimeout(() => {
                                button.textContent = _orig;
                                button.disabled = !(sizeSelect && sizeSelect.value);
                            }, 1500);
                        } else {
                            window.open(productUrl, "_blank");
                        }
                    });

            div.append(image, title, priceEl, button);

            // Mostrar desplegable de tallas si el producto tiene variants
            if (p.variants && p.variants.length > 0) {
                const validVariants = p.variants.filter(v => {
                    const title = (v.title || "").toLowerCase();
                    return title !== "default" && title !== "default title";
                });

                if (validVariants.length > 0) {
                    const sizeSelect = document.createElement("select");
                    sizeSelect.className = "size-select";
                    
                    const defaultOption = document.createElement("option");
                    defaultOption.value = "";
                    defaultOption.textContent = "Selecciona una talla";
                    defaultOption.disabled = true;
                    defaultOption.selected = true;
                    sizeSelect.appendChild(defaultOption);

                    // Agregar cada talla al desplegable
                    validVariants.forEach((v) => {
                        const opt = document.createElement("option");
                        opt.value = v.title;
                        opt.textContent = v.title + (v.available ? "" : " (Agotado)");
                        opt.disabled = !v.available;
                        sizeSelect.appendChild(opt);
                    });

                    // Sin talla botón deshabilitado
                    button.disabled = true;
                    sizeSelect.addEventListener('change', () => {
                        button.disabled = !sizeSelect.value;
                    });
                    div.insertBefore(sizeSelect, button);
                }
            }

            container.appendChild(div);
        });
    } catch (error) {
        console.error("Error cargando productos:", error);
        document.getElementById("products").innerText =
            "Error cargando productos.";
    }
}

async function loadProductsSwyry() {
    try {
        let data;
        try {
            const res = await fetch("/api/mock/products/swyry");
            if (!res.ok) throw new Error("API no disponible");
            data = await res.json();
        } catch {
            const res = await fetch("../JSON/productsSwyry.json");
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
            const productUrl = `https://swyry.com/products/${p.handle}`;

            const image = createImageElement(imgSrc, p.title);
            const title = document.createElement("h3");
            title.textContent = p.title;
            const priceEl = document.createElement("p");
            priceEl.textContent = price;
                    const button = document.createElement("button");
                    button.textContent = btnText;
                    button.addEventListener("click", () => {
                        const sizeSelect = div.querySelector('.size-select');
                        if (btnText === 'Añadir al carrito') {
                            const selectedSize = sizeSelect ? sizeSelect.value : '';
                            if (sizeSelect && !selectedSize) {
                                showPopup('Selecciona una talla antes de añadir al carrito', false);
                                return;
                            }
                            addToCart({
                                id: p.id || p.handle || p.title,
                                name: p.title,
                                image: imgSrc,
                                unitPrice: Number(variant?.price) || 0,
                                size: selectedSize,
                                options: (p.variants || []).map(v => v.title).filter(Boolean)
                            });
                            const _orig = button.textContent;
                            button.textContent = 'Añadido';
                            button.disabled = true;
                            setTimeout(() => {
                                button.textContent = _orig;
                                button.disabled = !(sizeSelect && sizeSelect.value);
                            }, 1500);
                        } else {
                            window.open(productUrl, "_blank");
                        }
                    });

            div.append(image, title, priceEl, button);

            // Mostrar desplegable de tallas si el producto tiene variants
            if (p.variants && p.variants.length > 0) {
                const validVariants = p.variants.filter(v => {
                    const title = (v.title || "").toLowerCase();
                    return title !== "default" && title !== "default title";
                });

                if (validVariants.length > 0) {
                    const sizeSelect = document.createElement("select");
                    sizeSelect.className = "size-select";
                    
                    const defaultOption = document.createElement("option");
                    defaultOption.value = "";
                    defaultOption.textContent = "Selecciona una talla";
                    defaultOption.disabled = true;
                    defaultOption.selected = true;
                    sizeSelect.appendChild(defaultOption);

                    // Agregar cada talla al desplegable
                    validVariants.forEach((v) => {
                        const opt = document.createElement("option");
                        opt.value = v.title;
                        opt.textContent = v.title + (v.available ? "" : " (Agotado)");
                        opt.disabled = !v.available;
                        sizeSelect.appendChild(opt);
                    });

                    // Sin talla botón deshabilitado
                    button.disabled = true;
                    sizeSelect.addEventListener('change', () => {
                        button.disabled = !sizeSelect.value;
                    });
                    div.insertBefore(sizeSelect, button);
                }
            }

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

const CART_KEY = "sb_cart_v1";

function getCart() {
    try {
        return JSON.parse(localStorage.getItem(CART_KEY) || "[]");
    } catch (e) {
        console.error("Error leyendo carrito:", e);
        return [];
    }
}

function saveCart(cart) {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

function formatCurrency(n) {
    return (Number(n) || 0).toFixed(2) + "€";
}

function addToCart(item) {
    const cart = getCart();
    const existing = cart.find(ci => ci.id === item.id && ci.size === item.size);
    if (existing) {
        existing.quantity = (existing.quantity || 1) + (item.quantity || 1);
    } else {
        cart.push({...item, quantity: item.quantity || 1});
    }
    saveCart(cart);
    showPopup("Producto añadido al carrito.", true, false);
}

function removeCartItem(index) {
    const cart = getCart();
    cart.splice(index, 1);
    saveCart(cart);
    renderCartPage();
}

function animateRemoveCartItem(index, itemElement) {
    if (!itemElement) {
        removeCartItem(index);
        return;
    }

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
        removeCartItem(index);
        return;
    }

    itemElement.classList.add('is-removing');
    setTimeout(() => {
        removeCartItem(index);
    }, 220);
}

function changeQuantity(index, delta) {
    const cart = getCart();
    const item = cart[index];
    if (!item) return;
    item.quantity = Math.max(1, (item.quantity || 1) + delta);
    saveCart(cart);
    renderCartPage();
}

function updateItemSize(index, newSize) {
    const cart = getCart();
    const item = cart[index];
    if (!item) return;
    item.size = newSize;
    saveCart(cart);
    renderCartPage();
}

function renderCartPage() {
    const main = document.querySelector('main');
    if (!main) return;
    if (location.pathname.endsWith('carrito.html') || document.title.includes('Carrito')) {
        main.innerHTML = `
            <section id="cart-container"></section>
            <div class="cart-total"><p>Total: <span id="cart-total">0€</span></p><button id="checkoutBtn" class="checkout-btn">COMPRAR</button></div>
        `;
        const container = document.getElementById('cart-container');
        const cart = getCart();
        if (!cart.length) {
            container.innerHTML = '<div class="empty-state">Tu carrito está vacío. Añade productos desde la tienda.</div>';
            document.getElementById('cart-total').textContent = '0.00€';
            return;
        }

        container.innerHTML = '';
        let total = 0;
        cart.forEach((it, idx) => {
            const itemEl = document.createElement('div');
            itemEl.className = 'cart-item';
            itemEl.innerHTML = `
                <img src="${it.image || DEFAULT_PRODUCT_IMAGE}" alt="${it.name}">
                <div class="cart-item-info">
                    <h3>${it.name}</h3>
                    <p class="cart-item-size">Talla: <select data-idx="${idx}" class="cart-size-select"></select></p>
                    <p>Precio unitario: <strong>${formatCurrency(it.unitPrice)}</strong></p>
                    <p>Cantidad: <button class="qty-btn" data-idx="${idx}" data-op="dec">-</button>
                              <span class="qty">${it.quantity}</span>
                              <button class="qty-btn" data-idx="${idx}" data-op="inc">+</button></p>
                    <p>Subtotal: <strong class="item-subtotal">${formatCurrency((it.unitPrice || 0) * (it.quantity || 1))}</strong></p>
                    <p><button class="remove-btn" data-idx="${idx}">Eliminar</button></p>
                </div>
            `;
            container.appendChild(itemEl);

            const sizeSelect = itemEl.querySelector('.cart-size-select');
            const rawSizes = it.options || (it.availableSizes || []);
            const sizes = (rawSizes || []).filter(s => {
                if (!s) return false;
                const low = String(s).toLowerCase();
                return low !== 'default' && low !== 'default title';
            });
            if (!sizes.length) {
                // Si es talla única
                const sizePara = itemEl.querySelector('.cart-item-size');
                if (sizePara) sizePara.remove();
            } else {
                const defaultOpt = document.createElement('option');
                defaultOpt.value = '';
                defaultOpt.textContent = '-- seleccionar --';
                sizeSelect.appendChild(defaultOpt);
                sizes.forEach(s => {
                    const o = document.createElement('option');
                    o.value = s;
                    o.textContent = s;
                    if (s === it.size) o.selected = true;
                    sizeSelect.appendChild(o);
                });
                sizeSelect.addEventListener('change', (e) => {
                    updateItemSize(Number(e.target.dataset.idx), e.target.value);
                });
            }

            total += (it.unitPrice || 0) * (it.quantity || 1);
        });

        container.querySelectorAll('.qty-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const idx = Number(e.target.dataset.idx);
                const op = e.target.dataset.op;
                changeQuantity(idx, op === 'inc' ? 1 : -1);
            });
        });
        container.querySelectorAll('.remove-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const idx = Number(e.target.dataset.idx);
                const itemEl = e.target.closest('.cart-item');
                e.target.disabled = true;
                animateRemoveCartItem(idx, itemEl);
            });
        });

        document.getElementById('cart-total').textContent = formatCurrency(total);

        const checkoutBtn = document.getElementById('checkoutBtn');
        if (checkoutBtn) {
            checkoutBtn.addEventListener('click', () => openCheckoutPopup(total));
        }
    }
}

function isLoggedIn() {
    try {
        return !!localStorage.getItem('sb_user');
    } catch (e) {
        return false;
    }
}

function openCheckoutPopup(totalAmount) {
    const popup = document.getElementById("authPopup");
    const popupTitle = document.getElementById("authPopupTitle");
    const popupMessage = document.getElementById("authPopupMessage");
    if (!popup || !popupTitle || !popupMessage) return;

    popupTitle.textContent = 'Finalizar compra';
    const logged = isLoggedIn();
    if (logged) {
        popupMessage.innerHTML = `
            <p>Total a pagar: <strong>${formatCurrency(totalAmount)}</strong></p>
            <div class="checkout-form">
                <label>Número de tarjeta</label>
                <input id="checkoutCard" type="text" placeholder="1234 5678 9012 3456" />
                <div style="margin-top:12px"><button id="checkoutSubmit">Pagar</button></div>
            </div>
        `;
    } else {
        popupMessage.innerHTML = `
            <p>Total a pagar: <strong>${formatCurrency(totalAmount)}</strong></p>
            <div class="checkout-form">
                <label>Nombre completo</label>
                <input id="checkoutName" type="text" />
                <label>Correo electrónico</label>
                <input id="checkoutEmail" type="email" placeholder="tú@ejemplo.com" />
                <label>Ciudad</label>
                <input id="checkoutCity" type="text" />
                <label>Dirección</label>
                <input id="checkoutAddress" type="text" />
                <label>Número de tarjeta</label>
                <input id="checkoutCard" type="text" placeholder="1234 5678 9012 3456" />
                <div style="margin-top:12px"><button id="checkoutSubmit">Pagar</button></div>
            </div>
        `;
    }

    popup.classList.remove('popup-hidden');


    const submit = document.getElementById('checkoutSubmit');

    const cardInput = document.getElementById('checkoutCard');
    if (cardInput) {
        cardInput.setAttribute('inputmode', 'numeric');
        cardInput.addEventListener('input', (e) => {
            const cleaned = (e.target.value || '').replace(/\D+/g, '');
            if (e.target.value !== cleaned) e.target.value = cleaned;
        });
    }
    if (submit) {
        submit.addEventListener('click', () => {

            const card = document.getElementById('checkoutCard')?.value?.trim();
            if (!logged) {
                const name = document.getElementById('checkoutName')?.value?.trim();
                const email = document.getElementById('checkoutEmail')?.value?.trim();
                const city = document.getElementById('checkoutCity')?.value?.trim();
                const address = document.getElementById('checkoutAddress')?.value?.trim();
                const emailValid = email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
                if (!name || !email || !city || !address) {
                    showPopup('Rellena nombre, correo, ciudad y dirección.', false, false);
                    return;
                }
                if (!emailValid) {
                    showPopup('Introduce un correo electrónico válido.', false, false);
                    return;
                }
            }

            (async () => {
                const cart = getCart();
                if (!cart.length) {
                    showPopup('Tu carrito está vacío.', false, false);
                    return;
                }

                const userRaw = localStorage.getItem('sb_user');
                const userObj = userRaw ? JSON.parse(userRaw) : null;
                const userId = userObj?.id || null;
                const emailPayload = userObj?.email || document.getElementById('checkoutEmail')?.value?.trim();

                const items = cart.map(ci => ({
                    productId: ci.id,
                    size: ci.size,
                    quantity: ci.quantity || 1,
                    name: ci.name,
                    unitPrice: Number(ci.unitPrice) || 0
                }));

                const shippingInfo = logged ? null : {
                    name: document.getElementById('checkoutName')?.value?.trim(),
                    address: document.getElementById('checkoutAddress')?.value?.trim(),
                    city: document.getElementById('checkoutCity')?.value?.trim(),
                    postalCode: '',
                    country: '' ,
                    phone: ''
                };

                const payload = {
                    userId: userId,
                    email: emailPayload,
                    items,
                    shippingInfo,
                    paymentCard: card
                };

                try {
                    const resp = await fetch(`${API_BASE_URL}/api/purchases`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(payload)
                    });
                    const resJson = await resp.json();
                    if (resp.ok && resJson && resJson.success) {

                        saveCart([]);
                        renderCartPage();
                        closePopup();
                        showPopup('Compra realizada correctamente. Se ha enviado un email de confirmación.', true, true);
                    } else {
                        const msg = (resJson && resJson.message) || 'Error procesando la compra';
                        showPopup(msg, false, false);
                    }
                } catch (err) {
                    console.error('Checkout error', err);
                    showPopup('Error conectando con el servidor. Intenta más tarde.', false, false);
                }
            })();
        }, { once: true });
    }
}


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
    setTimeout(() => {
        setInterval(() => {
            indice = (indice + 1) % imagenes.length;
            crossfade(imagenes[indice]);
        }, 5000);
    }, 2500);
};

const cambiarImagenIndie = () => {
    const img = document.getElementById("indie");
    if (!img) return;
    const imagenes = [
        "../assets/indie/swyry.jpg",
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

// FORMULARIO DE CONTACTO
const initContactForm = () => {
    const form = document.getElementById("contactForm");
    const artistInfoFieldset = document.getElementById("artistInfo");
    const brandInfoFieldset = document.getElementById("brandInfo");
    const userTypeRadios = document.querySelectorAll('input[name="userType"]');

    const setFieldsetState = (fieldset, enabled) => {
        const controls = fieldset.querySelectorAll("input, select, textarea");
        controls.forEach((control) => {
            control.disabled = !enabled;
        });
    };

    // Mostrar/ocultar campos según el tipo de usuario
    const updateFormFieldsVisibility = () => {
        const selectedType = document.querySelector('input[name="userType"]:checked')?.value;

        if (selectedType === "artist") {
            artistInfoFieldset.style.display = "block";
            brandInfoFieldset.style.display = "none";
            setFieldsetState(artistInfoFieldset, true);
            setFieldsetState(brandInfoFieldset, false);
            // Marcar campos de artista como requeridos
            document.getElementById("artistName").required = true;
            document.getElementById("genre").required = true;
            document.getElementById("bio").required = true;
            document.getElementById("companyName").required = false;
            document.getElementById("industry").required = false;
            document.getElementById("brandBio").required = false;
            document.getElementById("budget").required = false;
        } else if (selectedType === "brand") {
            artistInfoFieldset.style.display = "none";
            brandInfoFieldset.style.display = "block";
            setFieldsetState(artistInfoFieldset, false);
            setFieldsetState(brandInfoFieldset, true);
            // Marcar campos de marca como requeridos
            document.getElementById("companyName").required = true;
            document.getElementById("industry").required = true;
            document.getElementById("brandBio").required = true;
            document.getElementById("budget").required = true;
            document.getElementById("artistName").required = false;
            document.getElementById("genre").required = false;
            document.getElementById("bio").required = false;
            document.getElementById("experience").required = false;
        } else {
            artistInfoFieldset.style.display = "none";
            brandInfoFieldset.style.display = "none";
            setFieldsetState(artistInfoFieldset, false);
            setFieldsetState(brandInfoFieldset, false);
            document.getElementById("artistName").required = false;
            document.getElementById("genre").required = false;
            document.getElementById("bio").required = false;
            document.getElementById("experience").required = false;
            document.getElementById("companyName").required = false;
            document.getElementById("industry").required = false;
            document.getElementById("brandBio").required = false;
            document.getElementById("budget").required = false;
        }
    };

    // Event listeners para cambiar tipo de usuario
    userTypeRadios.forEach(radio => {
        radio.addEventListener("change", updateFormFieldsVisibility);
    });

    updateFormFieldsVisibility();

    // Validación y envío del formulario
    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        // Validar que se seleccionar tipo de usuario
        const selectedType = document.querySelector('input[name="userType"]:checked');
        if (!selectedType) {
            showPopup("Por favor, selecciona el tipo de usuario.", false, false);
            return;
        }

        // Validar al menos una opción de colaboración
        const collaborationCheckboxes = document.querySelectorAll('input[name="collaborationType"]');
        const anyCollaborationSelected = Array.from(collaborationCheckboxes).some(cb => cb.checked);
        if (!anyCollaborationSelected) {
            showPopup("Por favor, selecciona al menos un tipo de colaboración.", false, false);
            return;
        }

        // Validar archivo (si lo hay)
        const fileInput = document.getElementById("files");
        if (fileInput.files.length > 0) {
            for (let file of fileInput.files) {
                if (file.size > 10 * 1024 * 1024) { // 10MB
                    showPopup(`El archivo "${file.name}" supera el tamaño máximo de 10MB.`, false, false);
                    return;
                }
            }
            if (fileInput.files.length > 5) {
                showPopup("No puedes adjuntar más de 5 archivos.", false, false);
                return;
            }
        }

        // Recopilar datos del formulario
        const formData = new FormData(form);
        const contactRequest = {
            userType: formData.get("userType"),
            name: formData.get("name"),
            email: formData.get("email"),
            phone: formData.get("phone"),
            country: formData.get("country"),
            socialMedia: formData.get("socialMedia"),
            artistName: formData.get("artistName"),
            genre: formData.get("genre"),
            bio: formData.get("bio"),
            musicLink: formData.get("musicLink"),
            experience: formData.get("experience"),
            companyName: formData.get("companyName"),
            industry: formData.get("industry"),
            brandBio: formData.get("brandBio"),
            targetAudience: formData.get("targetAudience"),
            budget: formData.get("budget"),
            collaborationType: formData.getAll("collaborationType"),
            message: formData.get("message"),
            terms: formData.get("terms") === "on",
            notifications: formData.get("notifications") === "on"
        };

        try {
            const response = await fetch(`${API_BASE_URL}/api/contact`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(contactRequest)
            });

            const result = await response.json();

            if (response.ok && result.success) {
                form.reset();
                updateFormFieldsVisibility();
                showPopup("¡Gracias por tu propuesta! Hemos recibido tu solicitud y te contactaremos pronto.", true, false);
            } else {
                showPopup(result.message || "Error al enviar el formulario. Intenta de nuevo.", false, false);
            }
        } catch (error) {
            console.error("Error:", error);
            showPopup("Error al enviar el formulario. Verifica tu conexión.", false, false);
        }
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

const API_BASE_URL = "";

const initAuthForms = () => {
    const loginForm = document.getElementById("loginForm");
    const registerForm = document.getElementById("registerForm");

    if (loginForm) {
        loginForm.addEventListener("submit", async (event) => {
            event.preventDefault();
            const email = document.getElementById("loginEmail").value.trim();
            const password = document.getElementById("loginPassword").value.trim();

            try {
                const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email, password })
                });
                const result = await response.json();

                if (response.ok && result.success) {
                    try {
                        const userObj = result.data || result.user || { email };
                        localStorage.setItem('sb_user', JSON.stringify(userObj));
                    } catch(e) {}
                    showPopup("Inicio de sesión correcto.", true);
                } else {
                    showPopup(result.message || "Usuario o contraseña incorrectos", false);
                }
            } catch (error) {
                console.error("Login error:", error);
                showPopup("No se pudo conectar al backend. Asegúrate de que el servidor esté en ejecución.", false);
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
            const direccion = document.getElementById("regDireccion").value.trim();
            const ciudad = document.getElementById("regCiudad").value.trim();
            const pais = document.getElementById("regPais").value.trim();

            try {
                const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        name: `${nombre} ${apellido}`,
                        email,
                        password,
                        phone: telefono,
                        address: direccion,
                        city: ciudad,
                        country: pais
                    })
                });
                const result = await response.json();

                if (response.ok && result.success) {
                    registerForm.reset();
                    showPopup("Tu cuenta se ha creado correctamente.", true);
                } else {
                    showPopup(result.message || "Error creando la cuenta", false);
                }
            } catch (error) {
                console.error("Register error:", error);
                showPopup("No se pudo conectar al backend. Asegúrate de que el servidor esté en ejecución.", false);
            }
        });
    }
};

function initUserNavLink() {
    const link = document.getElementById("userNavLink");
    if (!link) return;
    if (isLoggedIn()) {
        link.href = "usuario.html";
    } else {
        link.href = "iniciarSesion.html";
    }
}

function logout() {
    try {
        localStorage.removeItem('sb_user');
    } catch (e) {}
    window.location.href = "iniciarSesion.html";
}

function initUsuarioPage() {
    if (!document.getElementById("saludo")) return;

    if (!isLoggedIn()) {
        window.location.replace("iniciarSesion.html");
        return;
    }

    try {
        const userRaw = localStorage.getItem('sb_user');
        const userObj = userRaw ? JSON.parse(userRaw) : null;
        const rawName = userObj?.name || "";
        const nombre = rawName
            ? rawName.replace(/\b\w/g, c => c.toUpperCase())
            : (userObj?.email || "usuario");
        const email = userObj?.email || "";

        const saludo = document.getElementById("saludo");
        if (saludo) saludo.textContent = `Hola, ${nombre}`;

        const emailEl = document.getElementById("usuarioEmail");
        if (emailEl) emailEl.textContent = nombre;
    } catch (e) {}

    const logoutBtn = document.getElementById("logoutButton");
    if (logoutBtn) {
        logoutBtn.addEventListener("click", logout);
    }

    const editBtn = document.getElementById("editProfileButton");
    if (editBtn) {
        editBtn.addEventListener("click", () => {
            window.location.href = "editarPerfil.html";
        });
    }

    if (document.getElementById('editProfileForm')) {
        initEditProfilePage();
    }
}

function initEditProfilePage() {
    if (!isLoggedIn()) {
        window.location.replace("iniciarSesion.html");
        return;
    }

    const userRaw = localStorage.getItem('sb_user');
    const userObj = userRaw ? JSON.parse(userRaw) : null;
    const userId = userObj?.id;

    const phoneInput = document.getElementById('phoneInput');
    const addressInput = document.getElementById('addressInput');
    const cityInput = document.getElementById('cityInput');
    const countryInput = document.getElementById('countryInput');

    if (userObj) {
        phoneInput.value = userObj.phone || '';
        addressInput.value = userObj.address || '';
        cityInput.value = userObj.city || '';
        countryInput.value = userObj.country || '';
    }

    const form = document.getElementById('editProfileForm');
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const payload = {
            phone: phoneInput.value.trim(),
            address: addressInput.value.trim(),
            city: cityInput.value.trim(),
            country: countryInput.value.trim()
        };
        try {
            const resp = await fetch(`${API_BASE_URL}/api/users/${userId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const result = await resp.json();
            if (resp.ok && result.success) {
                localStorage.setItem('sb_user', JSON.stringify(result.data));
                showPopup('Perfil actualizado', true);
            } else {
                showPopup(result.message || 'Error actualizando perfil', false);
            }
        } catch (err) {
            console.error(err);
            showPopup('Error de conexión al backend', false);
        }
    });

    // change password flow using authPopup
    const changeBtn = document.getElementById('changePasswordButton');
    const authPopup = document.getElementById('authPopup');
    const popupTitle = document.getElementById('authPopupTitle');
    const popupMessage = document.getElementById('authPopupMessage');

    if (changeBtn) {
        changeBtn.addEventListener('click', () => {
            popupTitle.textContent = 'Cambiar contraseña';
            popupMessage.innerHTML = `
                <form class="checkout-form" id="cp_form">
                    <label for="cp_current">Contraseña actual</label>
                    <input id="cp_current" type="password" />
                    <button type="button" id="cp_verify">Verificar</button>
                    <div id="cp_new" style="display:none; margin-top: 12px;">
                        <label for="cp_new_input">Nueva contraseña</label>
                        <input id="cp_new_input" type="password" />
                        <button type="button" id="cp_submit">Guardar nueva contraseña</button>
                    </div>
                    <p id="cp_msg" style="color:red; margin: 0; font-size:0.95rem;"></p>
                </form>`;
            authPopup.classList.remove('popup-hidden');

            const cp_verify = document.getElementById('cp_verify');
            const cp_submit = document.getElementById('cp_submit');
            const cp_current = document.getElementById('cp_current');
            const cp_new_input = document.getElementById('cp_new_input');
            const cp_new = document.getElementById('cp_new');
            const cp_msg = document.getElementById('cp_msg');

            cp_verify.addEventListener('click', async () => {
                const current = cp_current.value || '';
                if (!current) { cp_msg.textContent = 'Introduce tu contraseña actual'; return; }
                try {
                    const resp = await fetch(`${API_BASE_URL}/api/users/${userId}/change-password`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ currentPassword: current })
                    });
                    const result = await resp.json();
                    if (resp.ok && result.success) {
                        cp_new.style.display = 'block';
                        cp_msg.textContent = 'Contraseña verificada. Introduce la nueva.';
                    } else {
                        cp_msg.textContent = result.message || 'Contraseña incorrecta';
                    }
                } catch (e) {
                    console.error(e);
                    cp_msg.textContent = 'Error de conexión';
                }
            });

            cp_submit.addEventListener('click', async () => {
                const newPass = cp_new_input.value || '';
                if (!newPass) { cp_msg.textContent = 'Introduce la nueva contraseña'; return; }
                try {
                    const resp = await fetch(`${API_BASE_URL}/api/users/${userId}/change-password`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ currentPassword: cp_current.value || '', newPassword: newPass })
                    });
                    const result = await resp.json();
                    if (resp.ok && result.success) {
                        showPopup('Contraseña actualizada', true);
                        authPopup.classList.add('popup-hidden');
                    } else {
                        cp_msg.textContent = result.message || 'No se pudo cambiar la contraseña';
                    }
                } catch (e) {
                    console.error(e);
                    cp_msg.textContent = 'Error de conexión';
                }
            });
        });
    }
}

// Inicializar el formulario cuando el DOM esté listo
document.addEventListener("DOMContentLoaded", () => {
    initPageElementFade();
    initUserNavLink();

    if (document.getElementById("contactForm")) {
        initContactForm();
    }
    if (document.getElementById("loginForm") || document.getElementById("registerForm")) {
        initAuthForms();
    }
    if (document.getElementById("saludo")) {
        initUsuarioPage();
    }
    if (document.getElementById('editProfileForm')) {
        initEditProfilePage();
    }

    const popupClose = document.getElementById("popupClose");
    if (popupClose) {
        popupClose.addEventListener("click", () => {
            closePopup();
        });
    }
    // render cart if we're on the cart page
    if (location.pathname.endsWith('carrito.html') || document.title.includes('Carrito')) {
        renderCartPage();
    }
});

let popupRedirectOnClose = false;

const showPopup = (message, success, redirectOnClose) => {
    const popup = document.getElementById("authPopup");
    const popupTitle = document.getElementById("authPopupTitle");
    const popupMessage = document.getElementById("authPopupMessage");
    if (!popup || !popupMessage || !popupTitle) return;

    if (redirectOnClose === undefined) redirectOnClose = !!success;

    popupTitle.textContent = success ? "Éxito" : "Error";
    popupMessage.textContent = message;
    popup.classList.remove("popup-hidden", "success", "error");
    popup.classList.add(success ? "success" : "error");
    popup.classList.remove("popup-hidden");
    popupRedirectOnClose = !!redirectOnClose;

    if (success && !popupRedirectOnClose) {
        setTimeout(() => {
            if (!popup.classList.contains('popup-hidden')) closePopup();
        }, 1500);
    }
};

const closePopup = () => {
    const popup = document.getElementById("authPopup");
    if (popup) {
        popup.classList.add("popup-hidden");
    }
    if (popupRedirectOnClose) {
        window.location.href = "../html/inicio.html";
    }
};

function initPageElementFade() {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const candidates = Array.from(document.querySelectorAll('header, main > *, footer, #back, #spotify'));
    const elements = Array.from(new Set(candidates)).filter(Boolean);

    elements.forEach((el, idx) => {
        el.classList.add('page-fade-item');
        el.style.setProperty('--page-fade-delay', `${Math.min(idx * 35, 210)}ms`);
    });

    requestAnimationFrame(() => {
        document.body.classList.add('page-fade-entered');
    });
}
