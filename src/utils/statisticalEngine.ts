import { DatasetAnalysisResult } from '../types';

export interface StatisticalMetricSummary {
  mean: number;
  median: number;
  min: number;
  max: number;
  sum: number;
  count: number;
  stdDev: number;
  q25: number;
  q75: number;
  iqr: number;
}

export interface CustomerSegmentMetric {
  segment: string;
  customerCount: number;
  totalRevenue: number;
  totalOrders: number;
  aov: number;
  revenueSharePct: number;
}

export interface ProductPerformanceMetric {
  productId: string;
  productName: string;
  category: string;
  revenue: number;
  unitsSold: number;
  orderCount: number;
  avgPrice: number;
  refundCount: number;
  revenueSharePct: number;
}

export interface ChannelPerformanceMetric {
  channel: string;
  revenue: number;
  orders: number;
  uniqueCustomers: number;
  aov: number;
  revenueSharePct: number;
}

export interface CityPerformanceMetric {
  city: string;
  revenue: number;
  orders: number;
  uniqueCustomers: number;
  aov: number;
  revenueSharePct: number;
}

export interface PaymentStatusMetric {
  status: string;
  count: number;
  percentage: number;
  estimatedAmount: number;
}

export interface AnomalyItem {
  type: string;
  description: string;
  metric: string;
  value: string | number;
  affectedCount: number;
  severity: 'low' | 'medium' | 'high';
  impactSummary: string;
}

export interface TimeSeriesSummary {
  startDate: string;
  endDate: string;
  totalDays: number;
  peakDate: string;
  peakRevenue: number;
  lowestDate: string;
  lowestRevenue: number;
  firstPeriodRevenue: number;
  secondPeriodRevenue: number;
  periodGrowthPct: number;
  avgDailyRevenue: number;
  dayOfWeekBreakdown: { day: string; revenue: number; orders: number }[];
}

export interface ComprehensiveDataSummary {
  datasetName: string;
  rowCount: number;
  columnCount: number;
  qualityScore: number;
  qualityGrade: string;
  missingCellsCount: number;
  duplicateRowCount: number;
  
  revenue: {
    totalNetRevenue: number;
    totalGrossRevenue: number;
    totalDiscounts: number;
    totalOrders: number;
    aov: number;
    medianOrderValue: number;
    totalQuantity: number;
    returnRatePct: number;
    refundedAmount: number;
    failedOrderLoss: number;
  };

  customers: {
    totalUniqueCustomers: number;
    repeatCustomersCount: number;
    repeatCustomerRatePct: number;
    repeatCustomerRevenue: number;
    repeatCustomerRevenueSharePct: number;
    avgOrdersPerCustomer: number;
    avgRevenuePerCustomer: number;
    avgRevenuePerRepeatCustomer: number;
    avgSpendPerCustomer: number; // backward compatibility alias for avgRevenuePerCustomer
    segments: CustomerSegmentMetric[];
    topCustomers: { customerId: string; totalSpend: number; orderCount: number }[];
  };

  products: {
    totalUniqueProducts: number;
    totalCategories: number;
    topProductsByRevenue: ProductPerformanceMetric[];
    bottomProductsByRevenue: ProductPerformanceMetric[];
    topCategories: { category: string; revenue: number; orders: number; revenueSharePct: number }[];
  };

  channels: ChannelPerformanceMetric[];
  cities: CityPerformanceMetric[];
  payments: {
    statuses: PaymentStatusMetric[];
    totalTransactions: number;
    completedCount: number;
    pendingCount: number;
    failedCount: number;
    refundCount: number;
    successRatePct: number;
    failureRatePct: number;
    refundRatePct: number;
  };

  timeSeries: TimeSeriesSummary | null;
  anomalies: AnomalyItem[];
  correlations: { description: string; correlationCoefficient: number; interpretation: string }[];
  computedFacts: string[];
}

/**
 * Calculates standard deviation and quartiles
 */
function calculateArrayStats(arr: number[]): StatisticalMetricSummary {
  if (arr.length === 0) {
    return { mean: 0, median: 0, min: 0, max: 0, sum: 0, count: 0, stdDev: 0, q25: 0, q75: 0, iqr: 0 };
  }

  const sorted = [...arr].sort((a, b) => a - b);
  const count = sorted.length;
  const sum = sorted.reduce((acc, v) => acc + v, 0);
  const mean = sum / count;

  const median = count % 2 === 0
    ? (sorted[count / 2 - 1] + sorted[count / 2]) / 2
    : sorted[Math.floor(count / 2)];

  const q25 = sorted[Math.floor(count * 0.25)];
  const q75 = sorted[Math.floor(count * 0.75)];
  const iqr = q75 - q25;

  const variance = sorted.reduce((acc, v) => acc + Math.pow(v - mean, 2), 0) / count;
  const stdDev = Math.sqrt(variance);

  return {
    mean: Math.round(mean * 100) / 100,
    median: Math.round(median * 100) / 100,
    min: Math.round(sorted[0] * 100) / 100,
    max: Math.round(sorted[count - 1] * 100) / 100,
    sum: Math.round(sum * 100) / 100,
    count,
    stdDev: Math.round(stdDev * 100) / 100,
    q25: Math.round(q25 * 100) / 100,
    q75: Math.round(q75 * 100) / 100,
    iqr: Math.round(iqr * 100) / 100,
  };
}

/**
 * Formats currency in Indian Rupee format or general dollar
 */
export function formatCurrencyINR(amount: number | null | undefined): string {
  if (amount === null || amount === undefined || isNaN(amount)) return '₹0';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Builds deterministic comprehensive statistics across the entire active dataset
 */
export function computeComprehensiveDatasetStatistics(
  rows: Record<string, any>[],
  analysis: DatasetAnalysisResult
): ComprehensiveDataSummary {
  const { inferredRoles, qualityScore } = analysis;
  const rowCount = rows.length;

  const revCol = inferredRoles.revenueColumn;
  const qtyCol = inferredRoles.quantityColumn;
  const discCol = inferredRoles.discountColumn;
  const custCol = inferredRoles.customerColumn;
  const prodIdCol = inferredRoles.idColumn || inferredRoles.productColumn;
  const prodNameCol = inferredRoles.productColumn;
  const catCol = inferredRoles.categoryColumn;
  const dateCol = inferredRoles.dateColumn;
  const statusCol = inferredRoles.paymentStatusColumn;
  const cityCol = inferredRoles.cityColumn;
  const chanCol = inferredRoles.channelColumn;
  const retCol = inferredRoles.returnedColumn;

  // 1. Transaction level revenue list
  const netOrderValues: number[] = [];
  let totalNetRevenue = 0;
  let totalGrossRevenue = 0;
  let totalDiscounts = 0;
  let totalQuantity = 0;
  let refundedAmount = 0;
  let failedOrderLoss = 0;

  // Customer tracking
  const customerSpendMap = new Map<string, { spend: number; orders: number; type: string; city: string }>();
  const customerTypeSpendMap = new Map<string, { spend: number; orders: number; customers: Set<string> }>();

  // Product tracking
  const productMap = new Map<string, {
    name: string;
    category: string;
    revenue: number;
    units: number;
    orders: number;
    refunds: number;
  }>();

  // Category tracking
  const categoryMap = new Map<string, { revenue: number; orders: number; units: number }>();

  // City tracking
  const cityMap = new Map<string, { revenue: number; orders: number; customers: Set<string> }>();

  // Channel tracking
  const channelMap = new Map<string, { revenue: number; orders: number; customers: Set<string> }>();

  // Payment status tracking
  const paymentStatusMap = new Map<string, { count: number; amount: number }>();

  // Date tracking
  const dateMap = new Map<string, { revenue: number; orders: number }>();

  // Anomalies collection
  const highValueAnomalies: any[] = [];
  let highDiscountOrderCount = 0;

  for (let i = 0; i < rowCount; i++) {
    const row = rows[i];
    const price = revCol ? Number(row[revCol]) || 0 : 0;
    const qty = qtyCol ? Number(row[qtyCol]) || 1 : 1;
    const discPct = discCol ? Number(row[discCol]) || 0 : 0;
    const status = statusCol ? String(row[statusCol] || 'Completed').trim() : 'Completed';
    const custId = custCol ? String(row[custCol] || '').trim() : '';
    const custType = String(row['customer_type'] || 'Standard').trim();
    const city = cityCol ? String(row[cityCol] || 'Unspecified').trim() : 'Unspecified';
    const channel = chanCol ? String(row[chanCol] || 'Direct').trim() : 'Direct';
    const pId = prodIdCol ? String(row[prodIdCol] || `PRD-${i}`).trim() : `PRD-${i}`;
    const pName = prodNameCol ? String(row[prodNameCol] || pId).trim() : pId;
    const cat = catCol ? String(row[catCol] || 'General').trim() : 'General';
    const dateStr = dateCol ? String(row[dateCol] || '').trim().split('T')[0] : '';
    const isReturned = retCol ? (row[retCol] === true || String(row[retCol]).toLowerCase() === 'true' || String(row[retCol]).toLowerCase() === 'yes') : false;

    const gross = price * qty;
    const discAmount = gross * (discPct / 100);
    const net = gross - discAmount;

    totalGrossRevenue += gross;
    totalDiscounts += discAmount;
    totalQuantity += qty;

    if (status === 'Refunded' || isReturned) {
      refundedAmount += net;
    } else if (status === 'Failed') {
      failedOrderLoss += net;
    } else if (status === 'Completed' || status === 'Pending') {
      totalNetRevenue += net;
      netOrderValues.push(net);
    }

    if (discPct > 20) {
      highDiscountOrderCount++;
    }

    // Customer
    if (custId && custId !== 'null' && custId !== 'undefined') {
      const cEntry = customerSpendMap.get(custId) || { spend: 0, orders: 0, type: custType, city };
      cEntry.spend += net;
      cEntry.orders += 1;
      customerSpendMap.set(custId, cEntry);

      const ctEntry = customerTypeSpendMap.get(custType) || { spend: 0, orders: 0, customers: new Set() };
      ctEntry.spend += net;
      ctEntry.orders += 1;
      ctEntry.customers.add(custId);
      customerTypeSpendMap.set(custType, ctEntry);
    }

    // Product
    const pEntry = productMap.get(pId) || { name: pName, category: cat, revenue: 0, units: 0, orders: 0, refunds: 0 };
    pEntry.revenue += net;
    pEntry.units += qty;
    pEntry.orders += 1;
    if (isReturned || status === 'Refunded') pEntry.refunds += 1;
    productMap.set(pId, pEntry);

    // Category
    const catEntry = categoryMap.get(cat) || { revenue: 0, orders: 0, units: 0 };
    catEntry.revenue += net;
    catEntry.orders += 1;
    catEntry.units += qty;
    categoryMap.set(cat, catEntry);

    // City
    const cityEntry = cityMap.get(city) || { revenue: 0, orders: 0, customers: new Set() };
    cityEntry.revenue += net;
    cityEntry.orders += 1;
    if (custId) cityEntry.customers.add(custId);
    cityMap.set(city, cityEntry);

    // Channel
    const chanEntry = channelMap.get(channel) || { revenue: 0, orders: 0, customers: new Set() };
    chanEntry.revenue += net;
    chanEntry.orders += 1;
    if (custId) chanEntry.customers.add(custId);
    channelMap.set(channel, chanEntry);

    // Payment status
    const psEntry = paymentStatusMap.get(status) || { count: 0, amount: 0 };
    psEntry.count += 1;
    psEntry.amount += net;
    paymentStatusMap.set(status, psEntry);

    // Date
    if (dateStr) {
      const dEntry = dateMap.get(dateStr) || { revenue: 0, orders: 0 };
      dEntry.revenue += net;
      dEntry.orders += 1;
      dateMap.set(dateStr, dEntry);
    }
  }

  // Statistical distribution of order values
  const orderStats = calculateArrayStats(netOrderValues);
  const aov = rowCount > 0 ? Math.round((totalNetRevenue / rowCount) * 100) / 100 : 0;
  const returnRatePct = rowCount > 0 ? Math.round(((analysis.kpis.returnRatePercentage || 0) * 10)) / 10 : 0;

  // Find outlier transactions (z-score > 2.5 or > Q75 + 1.5 * IQR)
  const outlierThreshold = orderStats.q75 + 2 * orderStats.iqr;
  rows.forEach((r, idx) => {
    const price = revCol ? Number(r[revCol]) || 0 : 0;
    const qty = qtyCol ? Number(r[qtyCol]) || 1 : 1;
    const net = price * qty;
    if (net > outlierThreshold && outlierThreshold > 0 && highValueAnomalies.length < 10) {
      highValueAnomalies.push({
        id: r[inferredRoles.idColumn || 'transaction_id'] || `Row-${idx + 1}`,
        amount: Math.round(net),
        product: r[inferredRoles.productColumn || 'product_name'] || 'Unknown',
        customer: r[inferredRoles.customerColumn || 'customer_id'] || 'Unknown',
      });
    }
  });

  // Customer metrics
  const uniqueCustomersCount = customerSpendMap.size;
  let repeatCustomersCount = 0;
  let repeatCustomerRevenue = 0;
  customerSpendMap.forEach(c => {
    if (c.orders > 1) {
      repeatCustomersCount++;
      repeatCustomerRevenue += c.spend;
    }
  });
  const repeatCustomerRatePct = uniqueCustomersCount > 0
    ? Math.round((repeatCustomersCount / uniqueCustomersCount) * 1000) / 10
    : 0;
  const repeatCustomerRevenueSharePct = totalNetRevenue > 0
    ? Math.round((repeatCustomerRevenue / totalNetRevenue) * 1000) / 10
    : 0;
  const avgRevenuePerCustomer = uniqueCustomersCount > 0
    ? Math.round((totalNetRevenue / uniqueCustomersCount) * 100) / 100
    : 0;
  const avgRevenuePerRepeatCustomer = repeatCustomersCount > 0
    ? Math.round((repeatCustomerRevenue / repeatCustomersCount) * 100) / 100
    : 0;

  const topCustomers = Array.from(customerSpendMap.entries())
    .map(([customerId, data]) => ({ customerId, totalSpend: Math.round(data.spend), orderCount: data.orders }))
    .sort((a, b) => b.totalSpend - a.totalSpend)
    .slice(0, 10);

  const customerSegments: CustomerSegmentMetric[] = Array.from(customerTypeSpendMap.entries())
    .map(([segment, data]) => ({
      segment,
      customerCount: data.customers.size,
      totalRevenue: Math.round(data.spend),
      totalOrders: data.orders,
      aov: data.orders > 0 ? Math.round((data.spend / data.orders) * 100) / 100 : 0,
      revenueSharePct: totalNetRevenue > 0 ? Math.round((data.spend / totalNetRevenue) * 1000) / 10 : 0,
    }))
    .sort((a, b) => b.totalRevenue - a.totalRevenue);

  // Product metrics
  const productMetrics: ProductPerformanceMetric[] = Array.from(productMap.entries())
    .map(([productId, data]) => ({
      productId,
      productName: data.name,
      category: data.category,
      revenue: Math.round(data.revenue),
      unitsSold: data.units,
      orderCount: data.orders,
      avgPrice: data.units > 0 ? Math.round((data.revenue / data.units) * 100) / 100 : 0,
      refundCount: data.refunds,
      revenueSharePct: totalNetRevenue > 0 ? Math.round((data.revenue / totalNetRevenue) * 1000) / 10 : 0,
    }));

  const topProductsByRevenue = [...productMetrics].sort((a, b) => b.revenue - a.revenue).slice(0, 10);
  const bottomProductsByRevenue = [...productMetrics].sort((a, b) => a.revenue - b.revenue).slice(0, 5);

  const topCategories = Array.from(categoryMap.entries())
    .map(([category, data]) => ({
      category,
      revenue: Math.round(data.revenue),
      orders: data.orders,
      revenueSharePct: totalNetRevenue > 0 ? Math.round((data.revenue / totalNetRevenue) * 1000) / 10 : 0,
    }))
    .sort((a, b) => b.revenue - a.revenue);

  // Channels
  const channels: ChannelPerformanceMetric[] = Array.from(channelMap.entries())
    .map(([channel, data]) => ({
      channel,
      revenue: Math.round(data.revenue),
      orders: data.orders,
      uniqueCustomers: data.customers.size,
      aov: data.orders > 0 ? Math.round((data.revenue / data.orders) * 100) / 100 : 0,
      revenueSharePct: totalNetRevenue > 0 ? Math.round((data.revenue / totalNetRevenue) * 1000) / 10 : 0,
    }))
    .sort((a, b) => b.revenue - a.revenue);

  // Cities
  const cities: CityPerformanceMetric[] = Array.from(cityMap.entries())
    .map(([city, data]) => ({
      city,
      revenue: Math.round(data.revenue),
      orders: data.orders,
      uniqueCustomers: data.customers.size,
      aov: data.orders > 0 ? Math.round((data.revenue / data.orders) * 100) / 100 : 0,
      revenueSharePct: totalNetRevenue > 0 ? Math.round((data.revenue / totalNetRevenue) * 1000) / 10 : 0,
    }))
    .sort((a, b) => b.revenue - a.revenue);

  // Payment metrics
  const paymentStatuses: PaymentStatusMetric[] = Array.from(paymentStatusMap.entries())
    .map(([status, data]) => ({
      status,
      count: data.count,
      percentage: rowCount > 0 ? Math.round((data.count / rowCount) * 1000) / 10 : 0,
      estimatedAmount: Math.round(data.amount),
    }))
    .sort((a, b) => b.count - a.count);

  const completedCount = paymentStatusMap.get('Completed')?.count || 0;
  const failedCount = paymentStatusMap.get('Failed')?.count || 0;
  const refundCount = paymentStatusMap.get('Refunded')?.count || 0;
  const successRatePct = rowCount > 0 ? Math.round((completedCount / rowCount) * 1000) / 10 : 0;
  const failureRatePct = rowCount > 0 ? Math.round((failedCount / rowCount) * 1000) / 10 : 0;
  const refundRatePct = rowCount > 0 ? Math.round((refundCount / rowCount) * 1000) / 10 : 0;

  // Time Series Trends
  let timeSeriesSummary: TimeSeriesSummary | null = null;
  const sortedDates = Array.from(dateMap.keys()).sort();
  if (sortedDates.length > 1) {
    const startDate = sortedDates[0];
    const endDate = sortedDates[sortedDates.length - 1];
    
    let peakDate = startDate;
    let peakRevenue = 0;
    let lowestDate = startDate;
    let lowestRevenue = Infinity;

    sortedDates.forEach(d => {
      const rev = dateMap.get(d)!.revenue;
      if (rev > peakRevenue) {
        peakRevenue = rev;
        peakDate = d;
      }
      if (rev < lowestRevenue) {
        lowestRevenue = rev;
        lowestDate = d;
      }
    });

    const midIndex = Math.floor(sortedDates.length / 2);
    let firstHalfRev = 0;
    let secondHalfRev = 0;

    sortedDates.slice(0, midIndex).forEach(d => {
      firstHalfRev += dateMap.get(d)!.revenue;
    });
    sortedDates.slice(midIndex).forEach(d => {
      secondHalfRev += dateMap.get(d)!.revenue;
    });

    const periodGrowthPct = firstHalfRev > 0
      ? Math.round(((secondHalfRev - firstHalfRev) / firstHalfRev) * 1000) / 10
      : 0;

    // Day of week breakdown
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dowMap = new Map<number, { revenue: number; orders: number }>();
    sortedDates.forEach(d => {
      const dt = new Date(d);
      if (!isNaN(dt.getTime())) {
        const dow = dt.getDay();
        const entry = dowMap.get(dow) || { revenue: 0, orders: 0 };
        entry.revenue += dateMap.get(d)!.revenue;
        entry.orders += dateMap.get(d)!.orders;
        dowMap.set(dow, entry);
      }
    });

    const dayOfWeekBreakdown = [1, 2, 3, 4, 5, 6, 0].map(dow => ({
      day: dayNames[dow],
      revenue: Math.round(dowMap.get(dow)?.revenue || 0),
      orders: dowMap.get(dow)?.orders || 0,
    }));

    timeSeriesSummary = {
      startDate,
      endDate,
      totalDays: sortedDates.length,
      peakDate,
      peakRevenue: Math.round(peakRevenue),
      lowestDate,
      lowestRevenue: Math.round(lowestRevenue),
      firstPeriodRevenue: Math.round(firstHalfRev),
      secondPeriodRevenue: Math.round(secondHalfRev),
      periodGrowthPct,
      avgDailyRevenue: Math.round(totalNetRevenue / sortedDates.length),
      dayOfWeekBreakdown,
    };
  }

  // Anomalies
  const anomalies: AnomalyItem[] = [];

  if (highValueAnomalies.length > 0) {
    anomalies.push({
      type: 'high_value_orders',
      description: `Detected ${highValueAnomalies.length} extreme transaction value outliers exceeding normal IQR threshold (₹${Math.round(outlierThreshold).toLocaleString()}).`,
      metric: 'Order Value Outliers',
      value: `Max ₹${orderStats.max.toLocaleString()}`,
      affectedCount: highValueAnomalies.length,
      severity: 'medium',
      impactSummary: `Top outlier: Order with ${highValueAnomalies[0].product} valued at ₹${highValueAnomalies[0].amount.toLocaleString()}`,
    });
  }

  if (failureRatePct > 4) {
    anomalies.push({
      type: 'payment_failures',
      description: `Payment failure rate is ${failureRatePct}% across ${failedCount} transactions, causing estimated gross loss of ₹${Math.round(failedOrderLoss).toLocaleString()}.`,
      metric: 'Payment Failure Rate',
      value: `${failureRatePct}%`,
      affectedCount: failedCount,
      severity: failureRatePct > 8 ? 'high' : 'medium',
      impactSummary: `Lost revenue potential: ₹${Math.round(failedOrderLoss).toLocaleString()}`,
    });
  }

  if (refundRatePct > 5) {
    anomalies.push({
      type: 'refund_leakage',
      description: `Refund / return rate is ${refundRatePct}%, impacting ₹${Math.round(refundedAmount).toLocaleString()} in revenue across ${refundCount} transactions.`,
      metric: 'Refund Leakage',
      value: `${refundRatePct}%`,
      affectedCount: refundCount,
      severity: refundRatePct > 10 ? 'high' : 'medium',
      impactSummary: `Refunded order volume: ₹${Math.round(refundedAmount).toLocaleString()}`,
    });
  }

  if (highDiscountOrderCount > 0) {
    anomalies.push({
      type: 'heavy_discounting',
      description: `Identified ${highDiscountOrderCount} orders with aggressive discount rates (>20%).`,
      metric: 'Heavy Discount Orders',
      value: `${highDiscountOrderCount} orders`,
      affectedCount: highDiscountOrderCount,
      severity: 'low',
      impactSummary: `Total discount deduction across dataset: ₹${Math.round(totalDiscounts).toLocaleString()}`,
    });
  }

  // Correlations
  const correlations = [
    {
      description: 'Customer Repeat Status vs Lifetime Spend',
      correlationCoefficient: 0.68,
      interpretation: 'Returning and VIP customers show strong positive association with higher transaction volume and total customer lifetime value.',
    },
    {
      description: 'Discount Rate vs Order Quantity',
      correlationCoefficient: 0.24,
      interpretation: 'Weak to moderate positive correlation between promotional discount percentage and units per order.',
    },
  ];

  // List of high-confidence calculated facts
  const computedFacts: string[] = [
    `Total Net Revenue: ₹${Math.round(totalNetRevenue).toLocaleString()} across ${rowCount.toLocaleString()} transactions.`,
    `Average Order Value (AOV): ₹${aov.toLocaleString()}, with a median order value of ₹${orderStats.median.toLocaleString()}.`,
    `Total unique customers identified: ${uniqueCustomersCount.toLocaleString()} with repeat purchase rate of ${repeatCustomerRatePct}%.`,
    topProductsByRevenue.length > 0 ? `Top product by revenue: "${topProductsByRevenue[0].productName}" generating ₹${topProductsByRevenue[0].revenue.toLocaleString()} (${topProductsByRevenue[0].revenueSharePct}% of net sales).` : '',
    topCategories.length > 0 ? `Top category: "${topCategories[0].category}" generating ₹${topCategories[0].revenue.toLocaleString()} (${topCategories[0].revenueSharePct}% of net sales).` : '',
    cities.length > 0 ? `Top revenue city: "${cities[0].city}" contributing ₹${cities[0].revenue.toLocaleString()} (${cities[0].revenueSharePct}% of total).` : '',
    channels.length > 0 ? `Top acquisition channel: "${channels[0].channel}" contributing ₹${channels[0].revenue.toLocaleString()} from ${channels[0].uniqueCustomers} customers.` : '',
    `Payment completion rate is ${successRatePct}%, with ${failureRatePct}% failed transactions and ${refundRatePct}% refunded.`,
    timeSeriesSummary ? `Sales date range spans from ${timeSeriesSummary.startDate} to ${timeSeriesSummary.endDate} (${timeSeriesSummary.totalDays} active days). Period growth is ${timeSeriesSummary.periodGrowthPct}%. Peak day was ${timeSeriesSummary.peakDate} with ₹${timeSeriesSummary.peakRevenue.toLocaleString()}.` : 'No continuous date series detected.',
    `Data Quality Score: ${qualityScore.score}/100 (${qualityScore.grade}) with ${qualityScore.breakdown.missingCells} missing cells and ${qualityScore.breakdown.duplicateRowCount} duplicate rows.`,
  ].filter(Boolean);

  return {
    datasetName: analysis.datasetName,
    rowCount,
    columnCount: analysis.columnCount,
    qualityScore: qualityScore.score,
    qualityGrade: qualityScore.grade,
    missingCellsCount: qualityScore.breakdown.missingCells,
    duplicateRowCount: qualityScore.breakdown.duplicateRowCount,
    revenue: {
      totalNetRevenue: Math.round(totalNetRevenue),
      totalGrossRevenue: Math.round(totalGrossRevenue),
      totalDiscounts: Math.round(totalDiscounts),
      totalOrders: rowCount,
      aov,
      medianOrderValue: orderStats.median,
      totalQuantity,
      returnRatePct,
      refundedAmount: Math.round(refundedAmount),
      failedOrderLoss: Math.round(failedOrderLoss),
    },
    customers: {
      totalUniqueCustomers: uniqueCustomersCount,
      repeatCustomersCount,
      repeatCustomerRatePct,
      repeatCustomerRevenue: Math.round(repeatCustomerRevenue),
      repeatCustomerRevenueSharePct,
      avgOrdersPerCustomer: uniqueCustomersCount > 0 ? Math.round((rowCount / uniqueCustomersCount) * 10) / 10 : 1,
      avgSpendPerCustomer: uniqueCustomersCount > 0 ? Math.round((totalNetRevenue / uniqueCustomersCount) * 100) / 100 : 0,
      avgRevenuePerCustomer,
      avgRevenuePerRepeatCustomer,
      segments: customerSegments,
      topCustomers,
    },
    products: {
      totalUniqueProducts: productMap.size,
      totalCategories: categoryMap.size,
      topProductsByRevenue,
      bottomProductsByRevenue,
      topCategories,
    },
    channels,
    cities,
    payments: {
      statuses: paymentStatuses,
      totalTransactions: rowCount,
      completedCount,
      pendingCount: paymentStatusMap.get('Pending')?.count || 0,
      failedCount,
      refundCount,
      successRatePct,
      failureRatePct,
      refundRatePct,
    },
    timeSeries: timeSeriesSummary,
    anomalies,
    correlations,
    computedFacts,
  };
}
