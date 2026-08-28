import pandas as pd
import numpy as np
from typing import Dict, Any, Tuple
from ..schemas.models import (
    RevenueKPIsSchema, 
    ChartsSchema, 
    InferredRolesSchema, 
    RevenueTrendPointSchema, 
    CategoryBreakdownSchema, 
    CityBreakdownSchema, 
    StatusDistributionSchema,
    ChannelPerformanceSchema
)

def calculate_kpis_and_charts(df: pd.DataFrame, roles: InferredRolesSchema) -> Tuple[RevenueKPIsSchema, ChartsSchema]:
    avail_metrics = []
    missing_metrics = []

    total_rev = None
    total_orders = len(df) if len(df) > 0 else None
    if total_orders is not None:
        avail_metrics.append("Orders")

    aov = None
    total_qty = None
    unique_custs = None
    returning_pct = None
    return_rate_pct = None
    total_disc = None

    # Calculate Revenue
    if roles.revenueColumn and roles.revenueColumn in df.columns:
        price_series = pd.to_numeric(df[roles.revenueColumn], errors='coerce').fillna(0)
        
        qty_series = 1
        if roles.quantityColumn and roles.quantityColumn in df.columns:
            qty_series = pd.to_numeric(df[roles.quantityColumn], errors='coerce').fillna(1)

        disc_series = 0
        if roles.discountColumn and roles.discountColumn in df.columns:
            disc_series = pd.to_numeric(df[roles.discountColumn], errors='coerce').fillna(0)

        # Net line total
        net_rev = (price_series * qty_series) * (1.0 - (disc_series / 100.0))
        total_rev = round(float(net_rev.sum()), 2)
        avail_metrics.append("Total Revenue")

        if total_orders and total_orders > 0:
            aov = round(total_rev / total_orders, 2)
            avail_metrics.append("Average Order Value")

        total_disc = round(float(((price_series * qty_series) * (disc_series / 100.0)).sum()), 2)
    else:
        missing_metrics.append("Total Revenue (no monetary column detected)")
        missing_metrics.append("Average Order Value (no monetary column detected)")

    # Quantity
    if roles.quantityColumn and roles.quantityColumn in df.columns:
        q_series = pd.to_numeric(df[roles.quantityColumn], errors='coerce').fillna(0)
        total_qty = round(float(q_series.sum()), 0)
        avail_metrics.append("Total Quantity")
    else:
        missing_metrics.append("Total Quantity (no quantity column detected)")

    # Customers
    if roles.customerColumn and roles.customerColumn in df.columns:
        cust_series = df[roles.customerColumn].dropna().astype(str)
        unique_custs = int(cust_series.nunique())
        avail_metrics.append("Unique Customers")

        if unique_custs > 0:
            counts = cust_series.value_counts()
            repeat_count = int((counts > 1).sum())
            returning_pct = round((repeat_count / unique_custs) * 100, 1)
            avail_metrics.append("Returning Customer %")
    else:
        missing_metrics.append("Unique Customers (no customer identifier detected)")
        missing_metrics.append("Returning Customers (no customer identifier detected)")

    # Return Rate
    if roles.returnedColumn and roles.returnedColumn in df.columns:
        ret_series = df[roles.returnedColumn].astype(str).str.lower()
        ret_count = int(ret_series.isin(['true', 'yes', '1', 'refunded']).sum())
        return_rate_pct = round((ret_count / max(1, len(df))) * 100, 1)
        avail_metrics.append("Return Rate")

    kpis = RevenueKPIsSchema(
        totalRevenue=total_rev,
        totalOrders=total_orders,
        averageOrderValue=aov,
        totalQuantity=total_qty,
        uniqueCustomers=unique_custs,
        returningCustomerPercentage=returning_pct,
        returnRatePercentage=return_rate_pct,
        totalDiscounts=total_disc,
        availableMetrics=avail_metrics,
        missingMetrics=missing_metrics
    )

    # Charts
    revenue_over_time: list[RevenueTrendPointSchema] = []
    if roles.dateColumn and roles.revenueColumn and roles.dateColumn in df.columns:
        try:
            temp_df = pd.DataFrame({
                'date': pd.to_datetime(df[roles.dateColumn], errors='coerce'),
                'revenue': net_rev if roles.revenueColumn in df.columns else 0
            }).dropna()
            
            if len(temp_df) > 0:
                temp_df['date_str'] = temp_df['date'].dt.strftime('%Y-%m-%d')
                grouped = temp_df.groupby('date_str').agg(
                    revenue=('revenue', 'sum'),
                    orders=('revenue', 'count')
                ).reset_index().sort_values('date_str')
                
                for _, row in grouped.iterrows():
                    revenue_over_time.append(RevenueTrendPointSchema(
                        date=row['date_str'],
                        revenue=round(float(row['revenue']), 2),
                        orders=int(row['orders'])
                    ))
        except Exception:
            pass

    revenue_by_category: list[CategoryBreakdownSchema] = []
    if roles.categoryColumn and roles.categoryColumn in df.columns:
        cat_df = pd.DataFrame({
            'category': df[roles.categoryColumn].fillna('Uncategorized').astype(str),
            'revenue': net_rev if roles.revenueColumn in df.columns else 0
        })
        grouped = cat_df.groupby('category').agg(
            revenue=('revenue', 'sum'),
            orders=('revenue', 'count')
        ).reset_index().sort_values('revenue', ascending=False)

        for _, row in grouped.iterrows():
            avg_p = round(float(row['revenue'] / max(1, row['orders'])), 2)
            revenue_by_category.append(CategoryBreakdownSchema(
                category=row['category'],
                revenue=round(float(row['revenue']), 2),
                orders=int(row['orders']),
                avgPrice=avg_p
            ))

    revenue_by_city: list[CityBreakdownSchema] = []
    if roles.cityColumn and roles.cityColumn in df.columns:
        city_df = pd.DataFrame({
            'city': df[roles.cityColumn].fillna('Unspecified').astype(str),
            'revenue': net_rev if roles.revenueColumn in df.columns else 0
        })
        grouped = city_df.groupby('city').agg(
            revenue=('revenue', 'sum'),
            orders=('revenue', 'count')
        ).reset_index().sort_values('revenue', ascending=False).head(10)

        for _, row in grouped.iterrows():
            revenue_by_city.append(CityBreakdownSchema(
                city=row['city'],
                revenue=round(float(row['revenue']), 2),
                orders=int(row['orders'])
            ))

    payment_status_dist: list[StatusDistributionSchema] = []
    if roles.paymentStatusColumn and roles.paymentStatusColumn in df.columns:
        status_series = df[roles.paymentStatusColumn].fillna('Unknown').astype(str)
        counts = status_series.value_counts()
        for s, c in counts.items():
            pct = round((int(c) / max(1, len(df))) * 100, 1)
            payment_status_dist.append(StatusDistributionSchema(
                status=str(s),
                count=int(c),
                percentage=pct
            ))

    channels: list[ChannelPerformanceSchema] = []
    if roles.channelColumn and roles.channelColumn in df.columns:
        chan_df = pd.DataFrame({
            'channel': df[roles.channelColumn].fillna('Direct').astype(str),
            'revenue': net_rev if roles.revenueColumn in df.columns else 0,
            'cust': df[roles.customerColumn] if (roles.customerColumn and roles.customerColumn in df.columns) else ''
        })
        grouped = chan_df.groupby('channel').agg(
            revenue=('revenue', 'sum'),
            customers=('cust', 'nunique')
        ).reset_index().sort_values('revenue', ascending=False)

        for _, row in grouped.iterrows():
            channels.append(ChannelPerformanceSchema(
                channel=row['channel'],
                revenue=round(float(row['revenue']), 2),
                customers=int(row['customers'])
            ))

    charts = ChartsSchema(
        revenueOverTime=revenue_over_time,
        revenueByCategory=revenue_by_category,
        ordersByCategory=revenue_by_category,
        revenueByCity=revenue_by_city,
        paymentStatusDistribution=payment_status_dist,
        acquisitionChannels=channels
    )

    return kpis, charts
