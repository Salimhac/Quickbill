// DOM Elements
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');
const addItemBtn = document.getElementById('addItem');
const downloadPdfBtn = document.getElementById('downloadPdf');
const clearInvoiceBtn = document.getElementById('clearInvoice');
const invoiceItemsTable = document.getElementById('invoiceItems');

// Form Inputs
const businessNameInput = document.getElementById('businessName');
const customerNameInput = document.getElementById('customerName');
const invoiceNumberInput = document.getElementById('invoiceNumber');
const invoiceDateInput = document.getElementById('invoiceDate');
const itemNameInput = document.getElementById('itemName');
const quantityInput = document.getElementById('quantity');
const priceInput = document.getElementById('price');
const taxInput = document.getElementById('tax');
const discountInput = document.getElementById('discount');

// Preview Elements
const previewBusinessName = document.getElementById('previewBusinessName');
const previewFrom = document.getElementById('previewFrom');
const previewTo = document.getElementById('previewTo');
const previewInvoiceNumber = document.getElementById('previewInvoiceNumber');
const previewInvoiceDate = document.getElementById('previewInvoiceDate');
const subtotalElement = document.getElementById('subtotal');
const taxTotalElement = document.getElementById('taxTotal');
const discountTotalElement = document.getElementById('discountTotal');
const grandTotalElement = document.getElementById('grandTotal');

// Invoice Data
let invoiceData = {
    businessName: '',
    customerName: '',
    invoiceNumber: '',
    invoiceDate: '',
    items: [],
    subtotal: 0,
    taxTotal: 0,
    discountTotal: 0,
    grandTotal: 0
};

// Initialize the app
document.addEventListener('DOMContentLoaded', function() {
    // Set default invoice date to today
    const today = new Date().toISOString().split('T')[0];
    invoiceDateInput.value = today;
    
    // Initialize event listeners
    initEventListeners();
    
    // Update preview with initial values
    updatePreview();
});

// Initialize all event listeners
function initEventListeners() {
    // Mobile menu toggle
    hamburger.addEventListener('click', function() {
        hamburger.classList.toggle('active');
        navMenu.classList.toggle('active');
    });
    
    // Close mobile menu when clicking on a link
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', function() {
            hamburger.classList.remove('active');
            navMenu.classList.remove('active');
        });
    });
    
    // Form input listeners for real-time preview updates
    businessNameInput.addEventListener('input', updateBusinessInfo);
    customerNameInput.addEventListener('input', updateCustomerInfo);
    invoiceNumberInput.addEventListener('input', updateInvoiceMeta);
    invoiceDateInput.addEventListener('input', updateInvoiceMeta);
    
    // Invoice actions
    addItemBtn.addEventListener('click', addItem);
    downloadPdfBtn.addEventListener('click', downloadPdf);
    clearInvoiceBtn.addEventListener('click', clearInvoice);
}

// Update business information in preview
function updateBusinessInfo() {
    const businessName = businessNameInput.value || 'Your Business Name';
    previewBusinessName.textContent = businessName;
    previewFrom.textContent = businessName;
    invoiceData.businessName = businessName;
}

// Update customer information in preview
function updateCustomerInfo() {
    const customerName = customerNameInput.value || 'Customer Name';
    previewTo.textContent = customerName;
    invoiceData.customerName = customerName;
}

// Update invoice metadata in preview
function updateInvoiceMeta() {
    const invoiceNumber = invoiceNumberInput.value || '-';
    const invoiceDate = invoiceDateInput.value 
        ? new Date(invoiceDateInput.value).toLocaleDateString() 
        : '-';
    
    previewInvoiceNumber.textContent = invoiceNumber;
    previewInvoiceDate.textContent = invoiceDate;
    
    invoiceData.invoiceNumber = invoiceNumber;
    invoiceData.invoiceDate = invoiceDate;
}

// Add item to invoice
function addItem() {
    const itemName = itemNameInput.value.trim();
    const quantity = parseInt(quantityInput.value) || 1;
    const price = parseFloat(priceInput.value) || 0;
    const tax = parseFloat(taxInput.value) || 0;
    const discount = parseFloat(discountInput.value) || 0;
    
    // Validate required fields
    if (!itemName) {
        alert('Please enter an item name');
        itemNameInput.focus();
        return;
    }
    
    if (price <= 0) {
        alert('Please enter a valid price');
        priceInput.focus();
        return;
    }
    
    // Calculate item totals
    const subtotal = quantity * price;
    const taxAmount = subtotal * (tax / 100);
    const total = subtotal + taxAmount - discount;
    
    // Create item object
    const item = {
        name: itemName,
        quantity: quantity,
        price: price,
        tax: tax,
        discount: discount,
        subtotal: subtotal,
        taxAmount: taxAmount,
        total: total
    };
    
    // Add to invoice data
    invoiceData.items.push(item);
    
    // Update invoice totals
    updateInvoiceTotals();
    
    // Update preview table
    updateItemsTable();
    
    // Clear form inputs
    clearItemForm();
    
    // Focus on item name for next entry
    itemNameInput.focus();
}

// Update invoice totals
function updateInvoiceTotals() {
    let subtotal = 0;
    let taxTotal = 0;
    let discountTotal = 0;
    
    invoiceData.items.forEach(item => {
        subtotal += item.subtotal;
        taxTotal += item.taxAmount;
        discountTotal += item.discount;
    });
    
    const grandTotal = subtotal + taxTotal - discountTotal;
    
    // Update data
    invoiceData.subtotal = subtotal;
    invoiceData.taxTotal = taxTotal;
    invoiceData.discountTotal = discountTotal;
    invoiceData.grandTotal = grandTotal;
    
    // Update UI
    subtotalElement.textContent = formatCurrency(subtotal);
    taxTotalElement.textContent = formatCurrency(taxTotal);
    discountTotalElement.textContent = formatCurrency(discountTotal);
    grandTotalElement.textContent = formatCurrency(grandTotal);
}

// Update items table in preview
function updateItemsTable() {
    // Clear existing rows except the "no items" row
    const existingRows = invoiceItemsTable.querySelectorAll('tr:not(.no-items)');
    existingRows.forEach(row => row.remove());
    
    // Remove "no items" row if there are items
    const noItemsRow = invoiceItemsTable.querySelector('.no-items');
    if (invoiceData.items.length > 0 && noItemsRow) {
        noItemsRow.remove();
    }
    
    // Add items to table
    invoiceData.items.forEach((item, index) => {
        const row = document.createElement('tr');
        
        row.innerHTML = `
            <td>${item.name}</td>
            <td>${item.quantity}</td>
            <td>${formatCurrency(item.price)}</td>
            <td>${item.tax}%</td>
            <td>${formatCurrency(item.total)}</td>
        `;
        
        invoiceItemsTable.appendChild(row);
    });
    
    // Add "no items" row if empty
    if (invoiceData.items.length === 0 && !noItemsRow) {
        const row = document.createElement('tr');
        row.className = 'no-items';
        row.innerHTML = '<td colspan="5">No items added yet</td>';
        invoiceItemsTable.appendChild(row);
    }
}

// Clear item form inputs
function clearItemForm() {
    itemNameInput.value = '';
    quantityInput.value = '1';
    priceInput.value = '';
    taxInput.value = '0';
    discountInput.value = '0';
}

// Clear entire invoice
function clearInvoice() {
    if (confirm('Are you sure you want to clear the entire invoice?')) {
        // Reset form inputs
        businessNameInput.value = '';
        customerNameInput.value = '';
        invoiceNumberInput.value = '';
        invoiceDateInput.value = new Date().toISOString().split('T')[0];
        clearItemForm();
        
        // Reset invoice data
        invoiceData = {
            businessName: '',
            customerName: '',
            invoiceNumber: '',
            invoiceDate: '',
            items: [],
            subtotal: 0,
            taxTotal: 0,
            discountTotal: 0,
            grandTotal: 0
        };
        
        // Update preview
        updatePreview();
    }
}

// Update all preview elements
function updatePreview() {
    updateBusinessInfo();
    updateCustomerInfo();
    updateInvoiceMeta();
    updateItemsTable();
    updateInvoiceTotals();
}

// Format currency
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'KSH'
    }).format(amount);
}

// Download PDF
function downloadPdf() {
    // Validate required fields
    if (!invoiceData.businessName || invoiceData.businessName === 'Your Business Name') {
        alert('Please enter your business name');
        businessNameInput.focus();
        return;
    }
    
    if (!invoiceData.customerName || invoiceData.customerName === 'Customer Name') {
        alert('Please enter customer name');
        customerNameInput.focus();
        return;
    }
    
    if (invoiceData.items.length === 0) {
        alert('Please add at least one item to the invoice');
        itemNameInput.focus();
        return;
    }
    
    // Get the invoice preview element
    const invoiceElement = document.getElementById('invoicePreview');
    
    // Options for PDF generation
    const options = {
        margin: 10,
        filename: `invoice-${invoiceData.invoiceNumber || 'quickbill'}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };
    
    // Generate and download PDF
    html2pdf().from(invoiceElement).set(options).save();
}