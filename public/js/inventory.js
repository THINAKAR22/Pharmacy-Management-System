const API_BASE_URL = 'http://localhost:5000/api';
let allMedicines = [];

document.addEventListener('DOMContentLoaded', () => {
    loadInventory();
    
    document.getElementById('searchInventory').addEventListener('input', filterInventory);
    document.getElementById('filterCategory').addEventListener('change', filterInventory);
    
    // Setup modal close
    document.querySelector('.close').onclick = () => {
        document.getElementById('editModal').style.display = 'none';
    };
    
    window.onclick = (event) => {
        if (event.target === document.getElementById('editModal')) {
            document.getElementById('editModal').style.display = 'none';
        }
    };
    
    document.getElementById('editMedicineForm').addEventListener('submit', updateMedicine);
});

async function loadInventory() {
    try {
        const response = await fetch(`${API_BASE_URL}/medicines`);
        allMedicines = await response.json();
        displayInventory(allMedicines);
        updateStats(allMedicines);
    } catch (error) {
        console.error('Error loading inventory:', error);
        showError('Failed to load inventory');
    }
}

function displayInventory(medicines) {
    const tableBody = document.getElementById('inventoryTable');
    
    if (medicines.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="8" class="text-center">No medicines found</td></tr>';
        return;
    }

    tableBody.innerHTML = medicines.map(medicine => {
        const status = getStockStatus(medicine.quantity);
        const expiryStatus = getExpiryStatus(medicine.expiryDate);
        
        return `
            <tr>
                <td>${medicine.name}</td>
                <td>${medicine.category}</td>
                <td>${medicine.manufacturer}</td>
                <td>$${medicine.price.toFixed(2)}</td>
                <td>
                    <span class="status-badge ${status.class}">${medicine.quantity}</span>
                </td>
                <td>
                    <span class="status-badge ${expiryStatus.class}">${new Date(medicine.expiryDate).toLocaleDateString()}</span>
                </td>
                <td>${getCombinedStatus(medicine)}</td>
                <td>
                    <button onclick="editMedicine('${medicine._id}')" class="btn btn-primary btn-small">Edit</button>
                    <button onclick="deleteMedicine('${medicine._id}')" class="btn btn-danger btn-small">Delete</button>
                </td>
            </tr>
        `;
    }).join('');
}

function getStockStatus(quantity) {
    if (quantity <= 0) return { class: 'status-critical', text: 'Out of Stock' };
    if (quantity < 5) return { class: 'status-critical', text: 'Critical' };
    if (quantity < 10) return { class: 'status-low', text: 'Low Stock' };
    return { class: 'status-normal', text: 'In Stock' };
}

function getExpiryStatus(expiryDate) {
    const today = new Date();
    const expiry = new Date(expiryDate);
    const daysUntilExpiry = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));
    
    if (daysUntilExpiry < 0) return { class: 'status-expired', text: 'Expired' };
    if (daysUntilExpiry < 30) return { class: 'status-critical', text: 'Expiring Soon' };
    if (daysUntilExpiry < 90) return { class: 'status-low', text: 'Near Expiry' };
    return { class: 'status-normal', text: 'Valid' };
}

function getCombinedStatus(medicine) {
    const stockStatus = getStockStatus(medicine.quantity);
    const expiryStatus = getExpiryStatus(medicine.expiryDate);
    
    if (expiryStatus.class === 'status-expired') return 'Expired';
    if (stockStatus.class === 'status-critical') return 'Critical Stock';
    if (stockStatus.class === 'status-low') return 'Low Stock';
    if (expiryStatus.class === 'status-critical') return 'Expiring Soon';
    return 'Good';
}

function updateStats(medicines) {
    const totalItems = medicines.length;
    const totalValue = medicines.reduce((sum, med) => sum + (med.price * med.quantity), 0);
    const lowStock = medicines.filter(med => med.quantity < 10).length;
    const expiringSoon = medicines.filter(med => {
        const days = Math.ceil((new Date(med.expiryDate) - new Date()) / (1000 * 60 * 60 * 24));
        return days > 0 && days < 30;
    }).length;

    document.getElementById('totalItems').textContent = totalItems;
    document.getElementById('totalValue').textContent = `$${totalValue.toFixed(2)}`;
    document.getElementById('lowStockCount').textContent = lowStock;
    document.getElementById('expiringCount').textContent = expiringSoon;
}

function filterInventory() {
    const searchTerm = document.getElementById('searchInventory').value.toLowerCase();
    const category = document.getElementById('filterCategory').value;
    
    const filtered = allMedicines.filter(medicine => {
        const matchesSearch = medicine.name.toLowerCase().includes(searchTerm) ||
                             medicine.manufacturer.toLowerCase().includes(searchTerm);
        const matchesCategory = !category || medicine.category === category;
        
        return matchesSearch && matchesCategory;
    });
    
    displayInventory(filtered);
    updateStats(filtered);
}

async function editMedicine(id) {
    try {
        const response = await fetch(`${API_BASE_URL}/medicines/${id}`);
        const medicine = await response.json();
        
        document.getElementById('editId').value = medicine._id;
        document.getElementById('editName').value = medicine.name;
        document.getElementById('editCategory').value = medicine.category;
        document.getElementById('editManufacturer').value = medicine.manufacturer;
        document.getElementById('editPrice').value = medicine.price;
        document.getElementById('editQuantity').value = medicine.quantity;
        document.getElementById('editExpiryDate').value = new Date(medicine.expiryDate).toISOString().split('T')[0];
        document.getElementById('editDescription').value = medicine.description || '';
        
        document.getElementById('editModal').style.display = 'block';
    } catch (error) {
        console.error('Error loading medicine:', error);
        showError('Failed to load medicine details');
    }
}

async function updateMedicine(e) {
    e.preventDefault();
    
    const id = document.getElementById('editId').value;
    const medicineData = {
        name: document.getElementById('editName').value,
        category: document.getElementById('editCategory').value,
        manufacturer: document.getElementById('editManufacturer').value,
        price: parseFloat(document.getElementById('editPrice').value),
        quantity: parseInt(document.getElementById('editQuantity').value),
        expiryDate: document.getElementById('editExpiryDate').value,
        description: document.getElementById('editDescription').value
    };

    try {
        const response = await fetch(`${API_BASE_URL}/medicines/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(medicineData)
        });

        if (response.ok) {
            document.getElementById('editModal').style.display = 'none';
            loadInventory();
            showSuccess('Medicine updated successfully');
        } else {
            const error = await response.json();
            showError(error.message || 'Error updating medicine');
        }
    } catch (error) {
        console.error('Error updating medicine:', error);
        showError('Failed to update medicine');
    }
}

async function deleteMedicine(id) {
    if (!confirm('Are you sure you want to delete this medicine?')) return;

    try {
        const response = await fetch(`${API_BASE_URL}/medicines/${id}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            loadInventory();
            showSuccess('Medicine deleted successfully');
        } else {
            showError('Error deleting medicine');
        }
    } catch (error) {
        console.error('Error deleting medicine:', error);
        showError('Failed to delete medicine');
    }
}

function showSuccess(message) {
    // You can implement a toast notification here
    alert(message);
}

function showError(message) {
    // You can implement a toast notification here
    alert('Error: ' + message);
}