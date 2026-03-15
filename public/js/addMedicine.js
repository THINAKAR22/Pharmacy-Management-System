const API_BASE_URL = 'http://localhost:5000/api';

document.getElementById('addMedicineForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const medicineData = {
        name: document.getElementById('name').value,
        category: document.getElementById('category').value,
        manufacturer: document.getElementById('manufacturer').value,
        price: parseFloat(document.getElementById('price').value),
        quantity: parseInt(document.getElementById('quantity').value),
        expiryDate: document.getElementById('expiryDate').value,
        description: document.getElementById('description').value
    };

    try {
        const response = await fetch(`${API_BASE_URL}/medicines`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(medicineData)
        });

        if (response.ok) {
            showMessage('Medicine added successfully!', 'success');
            document.getElementById('addMedicineForm').reset();
        } else {
            const error = await response.json();
            showMessage(error.message || 'Error adding medicine', 'error');
        }
    } catch (error) {
        showMessage('Error connecting to server', 'error');
        console.error('Error:', error);
    }
});

function showMessage(message, type) {
    const messageDiv = document.getElementById('message');
    messageDiv.textContent = message;
    messageDiv.className = `message ${type}`;
    messageDiv.style.display = 'block';
    
    setTimeout(() => {
        messageDiv.style.display = 'none';
    }, 3000);
}