/* ==================== GLOBAL APP STATE ==================== */
const state = {
    currentUser: { id: "u1", name: "Captain Sarah", handle: "@pilot_sarah" },
    previousView: 'discover',

    products: [
        { id: "p1", title: "rhjhrhhokjhoihuirh", price: 18565965900, category: "Headsets", condition: "Used", quantity: 1, images: ["image01.jpg", "image02.jpg"], description: "lrp8k575woo7p79;o;" },
        { id: "p2", title: "ryjyeyiuui", price: 429888000, category: "Drones", condition: "New", quantity: 1, images: ["image02.jpg"], description: "9p;0l799;0'-le6p;rp;7;8ll8r6l,8" },
        { id: "p3", title: "yj7jje", price: 4599700, category: "Simulators", condition: "Used", quantity: 1, images: ["image03.jpg"], description: "8lyol68mk66o" },
        { id: "p4", title: "121233", price: 3687200, category: "Glasses", condition: "New", quantity: 2, images: ["image04.jpg"], description: "yuppp98oyu6r" },
        { id: "p5", title: "12344)", price: 34467, category: "Books", condition: "Used", quantity: 1, images: ["image05.jpg"], description: "7i9i57ikl78o8ro" }
    ],
    favourites: [],
    orders: [
        { id: "ORD-9921", productId: "p3", title: "Logitech G Saitek Pro Flight Yoke", price: 4500, deliveryFee: 75, total: 4575, status: "SHIPPED", courier: "Courier Guy Lockers", tracking: "CG-882391" }
    ],
    chats: [
        { id: "c1", peerName: "Aviation Equipment Support", productId: "p1", messages: [{ sender: "them", text: "Hello! Feel free to ask any technical questions about the Bose A20." }, { sender: "me", text: "Is the battery compartment clean?" }] }
    ],
    reports: [
        { id: "r1", target: "Product: DJI Mavic Drone", reason: "Incorrect category", status: "PENDING" }
    ],
    activeProduct: null,
    uploadedPhotoCount: 0,
    activeChatIndex: 0
};

/* ==================== ROUTING / NAVIGATION ==================== */
function switchView(viewId) {
    const currentActive = document.querySelector('.page-view.active');
    if (currentActive && currentActive.id !== `view-${viewId}`) {
        state.previousView = currentActive.id.replace('view-', '');
    }

    document.querySelectorAll('.page-view').forEach(el => el.classList.remove('active'));
    const target = document.getElementById(`view-${viewId}`);
    if (target) target.classList.add('active');
    window.scrollTo(0, 0);

    if (viewId === 'discover') renderMarketplaceFeed(state.products);
    if (viewId === 'favourites') renderFavourites();
    if (viewId === 'chats') renderChats();
    if (viewId === 'admin') renderAdmin();
}

function navigateBack() {
    if (state.previousView) {
        switchView(state.previousView);
    } else {
        switchView('discover');
    }
}

/* ==================== SEARCH ENGINE ==================== */
function handleSearch(query) {
    const clearBtn = document.getElementById('clearSearch');
    const sugBox = document.getElementById('searchSuggestions');
    if (!query.trim()) {
        clearBtn.style.display = 'none';
        sugBox.style.display = 'none';
        renderMarketplaceFeed(state.products);
        return;
    }

    clearBtn.style.display = 'block';
    const q = query.toLowerCase();

    const matchedProducts = state.products.filter(p => p.title.toLowerCase().includes(q) || p.category.toLowerCase().includes(q) || p.description.toLowerCase().includes(q));

    let html = '';
    if (matchedProducts.length > 0) {
        html += `<div style="padding:8px 12px; font-weight:700; font-size:11px; color:#333333; background:#F8F9FA;">ITEMS</div>`;
        matchedProducts.forEach(p => {
            html += `<div style="padding:8px 12px; cursor:pointer; font-size:13px;" onclick="openProductPage('${p.id}')"><i class="fa-solid fa-plane"></i> ${p.title} - R${p.price}</div>`;
        });
    }

    sugBox.innerHTML = html || `<div style="padding:12px; font-size:13px; color:#333333;">No aviation equipment found</div>`;
    sugBox.style.display = 'block';

    renderMarketplaceFeed(matchedProducts);
}

function clearSearchInput() {
    document.getElementById('searchInput').value = '';
    handleSearch('');
}

/* ==================== MARKETPLACE FEED ==================== */
function renderMarketplaceFeed(productList) {
    const grid = document.getElementById('productGrid');
    if (productList.length === 0) {
        grid.innerHTML = `<div style="grid-column: 1/-1; text-align:center; padding:40px; color:#000000;">No products found matching your criteria.</div>`;
        return;
    }

    grid.innerHTML = productList.map(p => {
        const isFav = state.favourites.includes(p.id);
        return `
        <div class="product-card" onclick="openProductPage('${p.id}')">
            <div class="card-img-container">
                <img src="${p.images[0]}" alt="${p.title}">
                <button class="fav-btn ${isFav ? 'active' : ''}" onclick="toggleFavourite(event, '${p.id}')">
                    <i class="${isFav ? 'fa-solid' : 'fa-regular'} fa-heart"></i>
                </button>
            </div>
            <div class="card-details">
                <div class="card-title">${p.title}</div>
                <div class="card-price">R${p.price}</div>
                <div class="card-meta">
                    <span>${p.category}</span>
                    <span style="font-weight:600; color:var(--secondary);">${p.condition}</span>
                </div>
            </div>
        </div>`;
    }).join('');
}

function filterByCategory(cat, evt) {
    if (document.querySelector('.page-view.active')?.id !== 'view-discover') {
        switchView('discover');
    }
    document.querySelectorAll('.cat-item').forEach(el => el.classList.remove('active'));
    
    const eventObj = evt || window.event;
    if (eventObj && eventObj.target) {
        eventObj.target.classList.add('active');
    } else {
        const catElements = Array.from(document.querySelectorAll('.cat-item'));
        const targetEl = catElements.find(el => el.textContent.trim() === cat || (cat === 'All' && el.textContent.trim() === 'All Categories'));
        if (targetEl) targetEl.classList.add('active');
    }
    
    document.getElementById('feedTitle').innerText = cat === 'All' ? 'Discover Aviation Equipment' : `Category: ${cat}`;
    
    if (cat === 'All') renderMarketplaceFeed(state.products);
    else renderMarketplaceFeed(state.products.filter(p => p.category === cat));
}

function handleSort(sortVal) {
    let sorted = [...state.products];
    if (sortVal === 'price-low') sorted.sort((a,b) => a.price - b.price);
    if (sortVal === 'price-high') sorted.sort((a,b) => b.price - a.price);
    renderMarketplaceFeed(sorted);
}

/* ==================== PRODUCT DETAILS PAGE ==================== */
function openProductPage(productId) {
    const product = state.products.find(p => p.id === productId);
    if (!product) return;
    state.activeProduct = product;

    document.getElementById('pTitle').innerText = product.title;
    document.getElementById('pPrice').innerText = `R${product.price}`;
    document.getElementById('pCondition').innerText = product.condition;
    document.getElementById('pDescription').innerText = product.description;
    document.getElementById('pCategory').innerText = product.category;
    document.getElementById('pQuantity').innerText = product.quantity;

    // Gallery
    document.getElementById('galleryMain').innerHTML = `<img src="${product.images[0]}" alt="${product.title}">`;
    document.getElementById('galleryThumbs').innerHTML = product.images.map((img, idx) => `
        <div class="thumb ${idx === 0 ? 'active' : ''}" onclick="switchGalleryImg('${img}', this)">
            <img src="${img}">
        </div>
    `).join('');

    switchView('product');
}

function switchGalleryImg(imgUrl, element) {
    document.querySelectorAll('.thumb').forEach(t => t.classList.remove('active'));
    element.classList.add('active');
    document.getElementById('galleryMain').innerHTML = `<img src="${imgUrl}">`;
}

/* ==================== FAVOURITES ==================== */
function toggleFavourite(e, productId) {
    e.stopPropagation();
    const idx = state.favourites.indexOf(productId);
    if (idx > -1) state.favourites.splice(idx, 1);
    else state.favourites.push(productId);
    
    renderMarketplaceFeed(state.products);
    if (document.getElementById('view-favourites').classList.contains('active')) renderFavourites();
}

function renderFavourites() {
    const favProducts = state.products.filter(p => state.favourites.includes(p.id));
    const container = document.getElementById('favouritesGrid');
    if (favProducts.length === 0) {
        container.innerHTML = `<div style="grid-column:1/-1; text-align:center; padding:40px; color:#000000;">You have no saved equipment.</div>`;
        return;
    }
    container.innerHTML = favProducts.map(p => `
        <div class="product-card" onclick="openProductPage('${p.id}')">
            <div class="card-img-container">
                <img src="${p.images[0]}">
                <button class="fav-btn active" onclick="toggleFavourite(event, '${p.id}')"><i class="fa-solid fa-heart"></i></button>
            </div>
            <div class="card-details">
                <div class="card-title">${p.title}</div>
                <div class="card-price">R${p.price}</div>
            </div>
        </div>
    `).join('');
}

/* ==================== CHECKOUT SYSTEM ==================== */
let checkoutState = { discount: 0 };

function initiateCheckout() {
    if (!state.activeProduct) return;
    checkoutState.discount = 0;
    document.getElementById('discountRow').style.display = 'none';
    document.getElementById('promoCodeInput').value = '';
    recalculateCheckout();
    switchView('checkout');
}

function recalculateCheckout() {
    const deliverySelect = document.getElementById('checkoutDelivery');
    const deliveryCost = parseInt(deliverySelect.options[deliverySelect.selectedIndex].getAttribute('data-cost'));
    const itemPrice = state.activeProduct.price;
    const total = (itemPrice + deliveryCost) - checkoutState.discount;

    document.getElementById('summaryItemPrice').innerText = `R${itemPrice}`;
    document.getElementById('summaryDeliveryFee').innerText = `R${deliveryCost}`;
    document.getElementById('summaryTotal').innerText = `R${total}`;
}

function applyPromoCode() {
    const code = document.getElementById('promoCodeInput').value.trim().toUpperCase();
    if (code === 'FLY20') {
        checkoutState.discount = 20;
        document.getElementById('summaryDiscount').innerText = `-R20`;
        document.getElementById('discountRow').style.display = 'flex';
        recalculateCheckout();
        alert('Promo code FLY20 applied successfully!');
    } else {
        alert('Invalid promo code. Try: FLY20');
    }
}

function processPayment() {
    const fullName = document.getElementById('buyerFullName').value.trim();
    const address = document.getElementById('buyerAddress').value.trim();
    const phone = document.getElementById('buyerPhone').value.trim();
    const email = document.getElementById('buyerEmail').value.trim();

    if (!fullName || !address || !phone || !email) {
        alert('Please fill in all required buyer information fields before confirming.');
        return;
    }

    const product = state.activeProduct;
    const deliveryMethod = document.getElementById('checkoutDelivery').value;
    const deliveryCost = parseInt(document.getElementById('checkoutDelivery').selectedOptions[0].getAttribute('data-cost'));
    const total = (product.price + deliveryCost) - checkoutState.discount;

    const newOrder = {
        id: `ORD-${Math.floor(1000 + Math.random() * 9000)}`,
        productId: product.id,
        title: product.title,
        price: product.price,
        deliveryFee: deliveryCost,
        total: total,
        status: 'PAID',
        buyerName: fullName,
        buyerAddress: address,
        buyerPhone: phone,
        buyerEmail: email,
        courier: deliveryMethod,
        tracking: 'PROCESSING'
    };

    state.orders.push(newOrder);

    alert(`Order Placed Successfully! Total: R${total}. Your aviation equipment order is being processed.`);
    switchView('discover');
}

/* ==================== ADD ITEM / LISTING FORM ==================== */
function simulatePhotoUpload() {
    if (state.uploadedPhotoCount < 6) {
        state.uploadedPhotoCount++;
        document.getElementById('photoCountLabel').innerText = `${state.uploadedPhotoCount} / 6 uploaded`;
    } else {
        alert('Maximum 6 photos allowed.');
    }
}

function handleCreateListing(e) {
    e.preventDefault();
    const imgIndex = String(state.products.length + 1).padStart(2, '0');
    const newProduct = {
        id: `p${Date.now()}`,
        title: document.getElementById('formTitle').value,
        description: document.getElementById('formDescription').value,
        category: document.getElementById('formCategory').value,
        condition: document.getElementById('formCondition').value,
        quantity: parseInt(document.getElementById('formQuantity').value),
        price: parseFloat(document.getElementById('formPrice').value),
        images: [`image${imgIndex}.jpg`]
    };

    state.products.unshift(newProduct);
    alert('Aviation listing published successfully!');
    state.uploadedPhotoCount = 0;
    document.getElementById('addItemForm').reset();
    switchView('discover');
}

/* ==================== MESSAGING / CHAT SYSTEM ==================== */
function initiateChatFromProduct() {
    if (!state.activeProduct) return;
    const existingThread = state.chats.find(c => c.productId === state.activeProduct.id);
    if (!existingThread) {
        state.chats.push({
            id: `c${Date.now()}`,
            peerName: "Seller Support",
            productId: state.activeProduct.id,
            messages: [{ sender: "me", text: `Hi! Is the item "${state.activeProduct.title}" available?` }]
        });
    }
    switchView('chats');
}

function renderChats() {
    const listEl = document.getElementById('chatThreadList');
    listEl.innerHTML = state.chats.map((c, idx) => `
        <div class="chat-item ${idx === state.activeChatIndex ? 'active' : ''}" onclick="selectChatThread(${idx})">
            <div style="font-weight:700; font-size:14px;">${c.peerName}</div>
            <div style="font-size:12px; color:#333333; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">
                ${c.messages[c.messages.length - 1].text}
            </div>
        </div>
    `).join('');

    renderChatMessages();
}

function selectChatThread(idx) {
    state.activeChatIndex = idx;
    renderChats();
}

function renderChatMessages() {
    const msgArea = document.getElementById('chatMessagesArea');
    const activeThread = state.chats[state.activeChatIndex];
    if (!activeThread) return;

    msgArea.innerHTML = activeThread.messages.map(m => `
        <div class="chat-bubble ${m.sender}">${m.text}</div>
    `).join('');
    msgArea.scrollTop = msgArea.scrollHeight;
}

function sendChatMessage() {
    const input = document.getElementById('chatInput');
    const text = input.value.trim();
    if (!text) return;

    const activeThread = state.chats[state.activeChatIndex];
    if (activeThread) {
        activeThread.messages.push({ sender: 'me', text: text });
        input.value = '';
        renderChatMessages();
    }
}

/* ==================== ADMIN PANEL ==================== */
function renderAdmin() {
    switchAdminTab('users');
}

function switchAdminTab(tab) {
    const content = document.getElementById('adminContentArea');
    if (tab === 'users') {
        content.innerHTML = `
            <h3>User Management</h3>
            <table class="admin-table" style="margin-top:12px;">
                <thead><tr><th>User</th><th>Handle</th><th>Role</th><th>Status</th><th>Action</th></tr></thead>
                <tbody>
                    <tr><td>Captain Sarah</td><td>@pilot_sarah</td><td>User</td><td><span style="color:green;">Active</span></td><td><button style="padding:4px 8px; font-size:11px; background:#000000; color:#FFFFFF;">Suspend</button></td></tr>
                    <tr><td>Flight Store</td><td>@flight_store</td><td>Seller</td><td><span style="color:green;">Active</span></td><td><button style="padding:4px 8px; font-size:11px; background:#000000; color:#FFFFFF;">Suspend</button></td></tr>
                </tbody>
            </table>`;
    } else if (tab === 'listings') {
        content.innerHTML = `
            <h3>Listing Moderation</h3>
            <table class="admin-table" style="margin-top:12px;">
                <thead><tr><th>Title</th><th>Price</th><th>Category</th><th>Action</th></tr></thead>
                <tbody>
                    ${state.products.map(p => `<tr><td>${p.title}</td><td>R${p.price}</td><td>${p.category}</td><td><button style="background:var(--danger); color:white; padding:4px 8px; font-size:11px;" onclick="removeProductAdmin('${p.id}')">Remove</button></td></tr>`).join('')}
                </tbody>
            </table>`;
    } else if (tab === 'orders') {
        content.innerHTML = `
            <h3>Aviation Orders Audit Trail</h3>
            <table class="admin-table" style="margin-top:12px;">
                <thead><tr><th>Order ID</th><th>Total</th><th>Status</th><th>Delivery Courier</th></tr></thead>
                <tbody>
                    ${state.orders.map(o => `<tr><td>${o.id}</td><td>R${o.total}</td><td>${o.status}</td><td>${o.courier}</td></tr>`).join('')}
                </tbody>
            </table>`;
    } else if (tab === 'reports') {
        content.innerHTML = `
            <h3>Flagged Moderation Reports</h3>
            <table class="admin-table" style="margin-top:12px;">
                <thead><tr><th>Target</th><th>Reason</th><th>Status</th><th>Action</th></tr></thead>
                <tbody>
                    ${state.reports.map(r => `<tr><td>${r.target}</td><td>${r.reason}</td><td>${r.status}</td><td><button style="padding:4px 8px; font-size:11px; background:#000000; color:#FFFFFF;">Dismiss</button></td></tr>`).join('')}
                </tbody>
            </table>`;
    }
}

function removeProductAdmin(productId) {
    state.products = state.products.filter(p => p.id !== productId);
    switchAdminTab('listings');
}

/* ==================== INITIALIZATION ==================== */
window.addEventListener('DOMContentLoaded', () => {
    renderMarketplaceFeed(state.products);
});