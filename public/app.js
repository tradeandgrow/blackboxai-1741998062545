// Global variables
let currentRates = {};
let updateInterval;

// Check authentication on page load
document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    initializeApp();
});

// Initialize the application
function initializeApp() {
    // Start fetching rates
    fetchRates();
    updateInterval = setInterval(fetchRates, 5000); // Update every 5 seconds

    // Add event listeners
    const tradeForm = document.getElementById('tradeForm');
    if (tradeForm) {
        tradeForm.addEventListener('submit', handleTradeSubmit);
    }
}

// Check if user is authenticated
function checkAuth() {
    const token = localStorage.getItem('token');
    const userSection = document.getElementById('userSection');
    const authSection = document.getElementById('authSection');
    const tradingSection = document.getElementById('tradingSection');
    const historySection = document.getElementById('historySection');

    if (token) {
        // User is logged in
        userSection.classList.remove('hidden');
        authSection.classList.add('hidden');
        tradingSection.classList.remove('hidden');
        historySection.classList.remove('hidden');
        
        // Display username
        const username = localStorage.getItem('username');
        document.getElementById('username').textContent = username;

        // Fetch trade history
        fetchTradeHistory();
    } else {
        // User is not logged in
        userSection.classList.add('hidden');
        authSection.classList.remove('hidden');
        tradingSection.classList.add('hidden');
        historySection.classList.add('hidden');
    }
}

// Fetch latest forex rates
async function fetchRates() {
    try {
        const response = await fetch('/api/trades/rates');
        const data = await response.json();

        if (data.success) {
            updateRatesDisplay(data.data);
        } else {
            showToast('Error fetching rates', 'error');
        }
    } catch (error) {
        console.error('Error fetching rates:', error);
        showToast('Error fetching rates', 'error');
    }
}

// Update the rates display
function updateRatesDisplay(rates) {
    const ratesGrid = document.getElementById('ratesGrid');
    ratesGrid.innerHTML = '';

    Object.entries(rates).forEach(([pair, rate]) => {
        const previousRate = currentRates[pair];
        const rateChange = previousRate ? (rate - previousRate) : 0;
        const flashClass = rateChange > 0 ? 'flash-green' : rateChange < 0 ? 'flash-red' : '';

        const card = document.createElement('div');
        card.className = `rate-card bg-white p-4 rounded-lg shadow-sm ${flashClass}`;
        card.innerHTML = `
            <h3 class="text-lg font-semibold text-gray-800">${pair}</h3>
            <p class="text-2xl font-bold ${rateChange > 0 ? 'text-green-600' : rateChange < 0 ? 'text-red-600' : 'text-gray-900'}">
                ${rate.toFixed(4)}
            </p>
            ${rateChange !== 0 ? `
                <p class="text-sm ${rateChange > 0 ? 'text-green-600' : 'text-red-600'}">
                    ${rateChange > 0 ? '▲' : '▼'} ${Math.abs(rateChange).toFixed(4)}
                </p>
            ` : ''}
        `;
        ratesGrid.appendChild(card);
    });

    currentRates = { ...rates };
}

// Handle trade form submission
async function handleTradeSubmit(event) {
    event.preventDefault();

    const pair = document.getElementById('pair').value;
    const amount = document.getElementById('amount').value;
    const type = document.getElementById('type').value;
    const price = currentRates[pair];

    if (!price) {
        showToast('Invalid currency pair', 'error');
        return;
    }

    try {
        const response = await fetch('/api/trades', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({ pair, amount, type, price })
        });

        const data = await response.json();

        if (data.success) {
            showToast('Trade executed successfully', 'success');
            fetchTradeHistory(); // Refresh trade history
        } else {
            showToast(data.error || 'Error executing trade', 'error');
        }
    } catch (error) {
        console.error('Error executing trade:', error);
        showToast('Error executing trade', 'error');
    }
}

// Fetch trade history
async function fetchTradeHistory() {
    try {
        const response = await fetch('/api/trades/history', {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });

        const data = await response.json();

        if (data.success) {
            updateTradeHistory(data.data);
        } else {
            showToast('Error fetching trade history', 'error');
        }
    } catch (error) {
        console.error('Error fetching trade history:', error);
        showToast('Error fetching trade history', 'error');
    }
}

// Update trade history display
function updateTradeHistory(trades) {
    const tbody = document.getElementById('tradeHistory');
    tbody.innerHTML = '';

    trades.forEach(trade => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                ${new Date(trade.timestamp).toLocaleString()}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${trade.pair}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm">
                <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                    ${trade.type === 'buy' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}">
                    ${trade.type.toUpperCase()}
                </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${trade.amount}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${trade.price}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm">
                <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                    ${trade.status}
                </span>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// Show toast notification
function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast ${type === 'error' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`;
    toast.textContent = message;
    document.body.appendChild(toast);

    // Show the toast
    setTimeout(() => toast.classList.add('show'), 100);

    // Hide and remove the toast
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Logout function
function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    window.location.href = '/login.html';
}
