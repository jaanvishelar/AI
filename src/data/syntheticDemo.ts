import { MerchantTransaction, PaymentStatus, CustomerType, AcquisitionChannel } from '../types';

export const URBAN_CART_PRODUCTS = [
  { id: 'PRD-101', name: 'Ultra-Comfort Wireless ANC Headphones', category: 'Electronics', basePrice: 129.99 },
  { id: 'PRD-102', name: 'Ergonomic Mechanical Keyboard RGB', category: 'Electronics', basePrice: 89.50 },
  { id: 'PRD-103', name: '4K Smart Action Camera 60FPS', category: 'Electronics', basePrice: 199.00 },
  { id: 'PRD-104', name: 'Compact Fast Wireless Charging Pad', category: 'Electronics', basePrice: 29.99 },
  { id: 'PRD-105', name: 'Smart Fitness Tracker Band 5.0', category: 'Electronics', basePrice: 59.90 },
  { id: 'PRD-201', name: 'Organic Supima Cotton Crewneck Tee', category: 'Apparel', basePrice: 34.00 },
  { id: 'PRD-202', name: 'Water-Resistant Commuter Jacket', category: 'Apparel', basePrice: 119.00 },
  { id: 'PRD-203', name: 'Stretch Slim-Fit Denim Jeans', category: 'Apparel', basePrice: 68.00 },
  { id: 'PRD-204', name: 'Merino Wool Lightweight Beanie', category: 'Apparel', basePrice: 24.50 },
  { id: 'PRD-205', name: 'Breathable Running Tech Socks (3-Pack)', category: 'Apparel', basePrice: 18.00 },
  { id: 'PRD-301', name: 'Double-Walled Stainless Steel French Press', category: 'Home & Kitchen', basePrice: 45.00 },
  { id: 'PRD-302', name: 'Aroma Ultrasonic Essential Oil Diffuser', category: 'Home & Kitchen', basePrice: 38.50 },
  { id: 'PRD-303', name: 'Non-Stick Ceramic Chef Pan 10-inch', category: 'Home & Kitchen', basePrice: 54.00 },
  { id: 'PRD-304', name: 'Bamboo Cutting & Serving Board Set', category: 'Home & Kitchen', basePrice: 27.90 },
  { id: 'PRD-401', name: 'Hydrating Botanical Hyaluronic Serum', category: 'Beauty & Wellness', basePrice: 42.00 },
  { id: 'PRD-402', name: 'SPF 50+ Invisible Daily Sunscreen', category: 'Beauty & Wellness', basePrice: 26.50 },
  { id: 'PRD-403', name: 'Natural Sulfate-Free Volumizing Shampoo', category: 'Beauty & Wellness', basePrice: 22.00 },
  { id: 'PRD-501', name: 'High-Density Non-Slip Yoga Mat 6mm', category: 'Fitness & Outdoors', basePrice: 49.00 },
  { id: 'PRD-502', name: 'Insulated 1L Mountain Water Bottle', category: 'Fitness & Outdoors', basePrice: 32.00 },
  { id: 'PRD-503', name: 'Adjustable Resistance Bands Set (5-in-1)', category: 'Fitness & Outdoors', basePrice: 28.50 },
  { id: 'PRD-601', name: 'Artisan Single-Origin Coffee Beans 500g', category: 'Gourmet Foods', basePrice: 19.50 },
  { id: 'PRD-602', name: 'Cold-Pressed Extra Virgin Olive Oil 750ml', category: 'Gourmet Foods', basePrice: 24.00 },
];

export const CITIES = ['Mumbai', 'Bengaluru', 'Delhi NCR', 'Hyderabad', 'Pune', 'Chennai', 'Kolkata', 'Ahmedabad', 'Jaipur', 'Chandigarh'];
export const CHANNELS: AcquisitionChannel[] = ['Organic', 'Google Ads', 'Instagram', 'Email', 'Referral', 'Direct'];
export const PAYMENT_METHODS = ['UPI', 'Credit Card', 'Debit Card', 'Net Banking', 'Wallet', 'COD'];

/**
 * Generates ~5,500 realistic synthetic records for UrbanCart demo dataset.
 * Includes deliberate data quality imperfections (missing values, duplicates, outliers)
 * to showcase data profiling and data quality scoring.
 */
export function generateUrbanCartDataset(recordCount = 5240): MerchantTransaction[] {
  const transactions: MerchantTransaction[] = [];
  
  // Create pool of 1,200 unique customers to simulate realistic repeat behavior
  const customerPool: { id: string; type: CustomerType; city: string; channel: AcquisitionChannel }[] = [];
  for (let i = 1; i <= 1200; i++) {
    const custType: CustomerType = i <= 200 ? 'VIP' : i <= 700 ? 'Returning' : i <= 80 ? 'Wholesale' : 'New';
    customerPool.push({
      id: `CUST-${String(i).padStart(5, '0')}`,
      type: custType,
      city: CITIES[Math.floor(Math.random() * CITIES.length)],
      channel: CHANNELS[Math.floor(Math.random() * CHANNELS.length)],
    });
  }

  const startDate = new Date('2025-01-01T08:00:00Z').getTime();
  const endDate = new Date('2025-06-30T20:00:00Z').getTime();

  for (let i = 1; i <= recordCount; i++) {
    const cust = customerPool[Math.floor(Math.random() * customerPool.length)];
    const product = URBAN_CART_PRODUCTS[Math.floor(Math.random() * URBAN_CART_PRODUCTS.length)];
    
    // Quantity distribution
    let quantity = 1;
    const qRand = Math.random();
    if (cust.type === 'Wholesale') {
      quantity = Math.floor(Math.random() * 8) + 4; // 4 to 11 units
    } else if (qRand > 0.85) {
      quantity = 3;
    } else if (qRand > 0.60) {
      quantity = 2;
    }

    // Price with minor historical variance +/- 5%
    const priceVariance = (Math.random() * 0.1 - 0.05);
    const price = Math.round((product.basePrice * (1 + priceVariance)) * 100) / 100;

    // Intentional missing discounts or numeric values (approx 4.5% missing)
    let discount: any = 0;
    if (i % 23 === 0) {
      discount = null; // intentional missing
    } else if (Math.random() > 0.65) {
      discount = Math.round((Math.random() * 15 + 5) * 10) / 10; // 5% to 20% discount
    }

    // Date generation
    const randomTime = startDate + Math.random() * (endDate - startDate);
    const dateObj = new Date(randomTime);
    const orderDate = dateObj.toISOString().split('T')[0];

    // Status distribution
    const sRand = Math.random();
    let paymentStatus: PaymentStatus = 'Completed';
    if (sRand < 0.05) paymentStatus = 'Failed';
    else if (sRand < 0.08) paymentStatus = 'Pending';
    else if (sRand < 0.12) paymentStatus = 'Refunded';

    // Returned flag
    const returned = paymentStatus === 'Refunded' || (paymentStatus === 'Completed' && Math.random() < 0.04);

    // Intentional missing city (approx 2% missing)
    const city = (i % 47 === 0) ? '' : cust.city;

    transactions.push({
      transaction_id: `TXN-2025-${String(i).padStart(6, '0')}`,
      customer_id: cust.id,
      order_date: orderDate,
      product_id: product.id,
      product_name: product.name,
      category: product.category,
      quantity,
      price,
      discount: discount !== null ? Number(discount) : (NaN as any),
      payment_status: paymentStatus,
      customer_type: cust.type,
      city: city || 'Unspecified',
      acquisition_channel: cust.channel,
      returned: returned,
      payment_method: PAYMENT_METHODS[Math.floor(Math.random() * PAYMENT_METHODS.length)],
    });
  }

  // Inject ~42 duplicate records intentionally to demonstrate duplicate detection
  const duplicatesToInject = 42;
  for (let d = 0; d < duplicatesToInject; d++) {
    const sourceIdx = Math.floor(Math.random() * 500);
    if (transactions[sourceIdx]) {
      transactions.push({ ...transactions[sourceIdx] });
    }
  }

  return transactions;
}
