import random
from datetime import datetime, timedelta
import pandas as pd
import numpy as np

PRODUCTS = [
    {"id": "PRD-101", "name": "Ultra-Comfort Wireless ANC Headphones", "category": "Electronics", "basePrice": 129.99},
    {"id": "PRD-102", "name": "Ergonomic Mechanical Keyboard RGB", "category": "Electronics", "basePrice": 89.50},
    {"id": "PRD-103", "name": "4K Smart Action Camera 60FPS", "category": "Electronics", "basePrice": 199.00},
    {"id": "PRD-104", "name": "Compact Fast Wireless Charging Pad", "category": "Electronics", "basePrice": 29.99},
    {"id": "PRD-105", "name": "Smart Fitness Tracker Band 5.0", "category": "Electronics", "basePrice": 59.90},
    {"id": "PRD-201", "name": "Organic Supima Cotton Crewneck Tee", "category": "Apparel", "basePrice": 34.00},
    {"id": "PRD-202", "name": "Water-Resistant Commuter Jacket", "category": "Apparel", "basePrice": 119.00},
    {"id": "PRD-203", "name": "Stretch Slim-Fit Denim Jeans", "category": "Apparel", "basePrice": 68.00},
    {"id": "PRD-301", "name": "Double-Walled Stainless Steel French Press", "category": "Home & Kitchen", "basePrice": 45.00},
    {"id": "PRD-302", "name": "Aroma Ultrasonic Essential Oil Diffuser", "category": "Home & Kitchen", "basePrice": 38.50},
    {"id": "PRD-401", "name": "Hydrating Botanical Hyaluronic Serum", "category": "Beauty & Wellness", "basePrice": 42.00},
    {"id": "PRD-501", "name": "High-Density Non-Slip Yoga Mat 6mm", "category": "Fitness & Outdoors", "basePrice": 49.00},
    {"id": "PRD-601", "name": "Artisan Single-Origin Coffee Beans 500g", "category": "Gourmet Foods", "basePrice": 19.50},
]

CITIES = ["Mumbai", "Bengaluru", "Delhi NCR", "Hyderabad", "Pune", "Chennai", "Kolkata", "Ahmedabad", "Jaipur"]
CHANNELS = ["Organic", "Google Ads", "Instagram", "Email", "Referral", "Direct"]
PAYMENT_METHODS = ["UPI", "Credit Card", "Debit Card", "Net Banking", "Wallet", "COD"]

def generate_urbancart_dataframe(n_records: int = 5240) -> pd.DataFrame:
    random.seed(42)
    np.random.seed(42)

    # 1,200 unique customers
    customer_pool = []
    for i in range(1, 1201):
        c_type = "VIP" if i <= 200 else ("Returning" if i <= 700 else ("Wholesale" if i <= 780 else "New"))
        customer_pool.append({
            "id": f"CUST-{str(i).zfill(5)}",
            "type": c_type,
            "city": random.choice(CITIES),
            "channel": random.choice(CHANNELS)
        })

    start_date = datetime(2025, 1, 1)
    end_date = datetime(2025, 6, 30)
    delta_days = (end_date - start_date).days

    records = []
    for i in range(1, n_records + 1):
        cust = random.choice(customer_pool)
        prod = random.choice(PRODUCTS)

        qty = 1
        if cust["type"] == "Wholesale":
            qty = random.randint(4, 12)
        elif random.random() > 0.8:
            qty = 2

        variance = random.uniform(-0.05, 0.05)
        price = round(prod["basePrice"] * (1 + variance), 2)

        # Intentional missing discount (~4.5%)
        discount = 0.0
        if i % 23 == 0:
            discount = np.nan
        elif random.random() > 0.65:
            discount = round(random.uniform(5.0, 20.0), 1)

        # Intentional missing city (~2%)
        city_val = cust["city"]
        if i % 47 == 0:
            city_val = np.nan

        # Order date
        random_days = random.randint(0, delta_days)
        order_date = (start_date + timedelta(days=random_days)).strftime("%Y-%m-%d")

        # Payment status
        r_status = random.random()
        status = "Completed"
        if r_status < 0.05:
            status = "Failed"
        elif r_status < 0.08:
            status = "Pending"
        elif r_status < 0.12:
            status = "Refunded"

        returned = status == "Refunded" or (status == "Completed" and random.random() < 0.04)

        records.append({
            "transaction_id": f"TXN-2025-{str(i).zfill(6)}",
            "customer_id": cust["id"],
            "order_date": order_date,
            "product_id": prod["id"],
            "product_name": prod["name"],
            "category": prod["category"],
            "quantity": qty,
            "price": price,
            "discount": discount,
            "payment_status": status,
            "customer_type": cust["type"],
            "city": city_val,
            "acquisition_channel": cust["channel"],
            "returned": returned,
            "payment_method": random.choice(PAYMENT_METHODS)
        })

    # Duplicate records injection
    for _ in range(42):
        src = random.choice(records[:500])
        records.append(dict(src))

    return pd.DataFrame(records)
