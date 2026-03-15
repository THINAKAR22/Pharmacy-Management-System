const API_BASE_URL = 'http://localhost:5000/api';
let cart = [];

async function searchMedicine() {
    const searchTerm = document.getElementById('medicineSearch').value;
    if (!searchTerm) return;

    try {
        const response = await fetch(`${API_BASE_URL}/medicines`);
        const medicines = await response.json();
        
        const filtered = medicines.filter(med => 
            med.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
            med.quantity > 0 &&
            new Date(med.expiryDate) > new Date()
        );

        displaySearchResults(filtered);
    } catch (error) {
        console.error('Error searching medicines:', error);
    }
}

function displaySearchResults(medicines) {
    const resultsDiv = document.getElementById('searchResults');
    
    if (medicines.length === 0) {
        resultsDiv.innerHTML = '<p class="text-center">No medicines found</p>';
        return;
    }

    resultsDiv.innerHTML = medicines.map(medicine => `
        <div class="search-result-item" onclick="addToCart('${medicine._id}', '${medicine.name}', ${medicine.price})">
            <div class="result-info">
                <h4>${medicine.name}</h4>
                <p>${medicine.manufacturer} | Stock: ${medicine.quantity}</p>
            </div>
            <div class="result-price">$${medicine.price}</div>
        </div>
    `).join('');
}

function addToCart(id, name, price) {
    const existingItem = cart.find(item => item.medicineId === id);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            medicineId: id,
            medicineName: name,
            quantity: 1,
            pricePerUnit: price,
            totalPrice: price
        });
    }
    
    updateCart();
    document.getElementById('medicineSearch').value = '';
    document.getElementById('searchResults').innerHTML = '';
}

function updateCart() {
    const cartBody = document.getElementById('cartItems');
    let totalItems = 0;
    let subtotal = 0;

    cartBody.innerHTML = cart.map((item, index) => {
        totalItems += item.quantity;
        subtotal += item.quantity * item.pricePerUnit;
        
        return `
            <tr>
                <td>${item.medicineName}</td>
                <td>$${item.pricePerUnit}</td>
                <td>
                    <input type="number" 
                           class="quantity-input" 
                           value="${item.quantity}" 
                           min="1" 
                           onchange="updateQuantity(${index}, this.value)">
                </td>
                <td>$${(item.quantity * item.pricePerUnit).toFixed(2)}</td>
                <td>
                    <button class="remove-btn" onclick="removeFromCart(${index})">×</button>
                </td>
            </tr>
        `;
    }).join('');

    document.getElementById('totalItems').textContent = totalItems;
    document.getElementById('subtotal').textContent = `$${subtotal.toFixed(2)}`;
    document.getElementById('total').textContent = `$${subtotal.toFixed(2)}`;
}

function updateQuantity(index, newQuantity) {
    if (newQuantity < 1) {
        removeFromCart(index);
        return;
    }
    
    cart[index].quantity = parseInt(newQuantity);
    updateCart();
}

function removeFromCart(index) {
    cart.splice(index, 1);
    updateCart();
}

function clearCart() {
    cart = [];
    updateCart();
}

async function completeSale() {
    if (cart.length === 0) {
        showMessage('Cart is empty', 'error');
        return;
    }

    const subtotal = cart.reduce((sum, item) => sum + (item.quantity * item.pricePerUnit), 0);
    
    const saleData = {
        items: cart.map(item => ({
            medicineId: item.medicineId,
            medicineName: item.medicineName,
            quantity: item.quantity,
            pricePerUnit: item.pricePerUnit,
            totalPrice: item.quantity * item.pricePerUnit
        })),
        totalAmount: subtotal,
        paymentMethod: document.getElementById('paymentMethod').value,
        customerName: document.getElementById('customerName').value || 'Walk-in Customer',
        customerPhone: document.getElementById('customerPhone').value
    };

    try {
        const response = await fetch(`${API_BASE_URL}/sales`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(saleData)
        });

        const data = await response.json();

if (response.ok) {
    showMessage('Sale completed successfully!', 'success');
    clearCart();
    document.getElementById('customerName').value = 'Walk-in Customer';
    document.getElementById('customerPhone').value = '';
} else {
    console.error("SERVER ERROR:", data);
    showMessage(data.message || 'Error completing sale', 'error');
}
    } catch (error) {
        showMessage('Error connecting to server', 'error');
        console.error('Error:', error);
    }
}

function showMessage(message, type) {
    const messageDiv = document.getElementById('message');
    messageDiv.textContent = message;
    messageDiv.className = `message ${type}`;
    messageDiv.style.display = 'block';
    
    setTimeout(() => {
        messageDiv.style.display = 'none';
    }, 3000);
}