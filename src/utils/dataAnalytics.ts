import {
  ColumnProfile,
  InferredRoles,
  InferredRole,
  QualityScore,
  CleaningSuggestion,
  RevenueKPIs,
  DatasetAnalysisResult,
  RevenueTrendPoint,
  CategoryBreakdown,
  CityBreakdown,
  StatusDistribution,
  ChannelPerformance,
} from '../types';

/**
 * Heuristics to detect column roles and semantic meanings
 */
export function inferColumnRole(colName: string, sampleValues: any[], detectedType: string): InferredRole {
  const lower = colName.toLowerCase().replace(/[^a-z0-9]/g, '_');

  if (/(^|_)(txn|transaction|invoice|order|receipt)_?(id|num|no)?$/i.test(lower) || (lower === 'id' && sampleValues.every(v => String(v).length > 3))) {
    return 'id';
  }
  if (/(^|_)(customer|user|client|buyer|account)_?(id|num|name|code)?$/i.test(lower)) {
    return 'customer';
  }
  if (/(^|_)(product|item|sku|merchandise|good)_?(id|name|title|code)?$/i.test(lower)) {
    return 'product';
  }
  if (/(^|_)(category|dept|department|segment|vertical|genre)$/i.test(lower)) {
    return 'category';
  }
  if (/(^|_)(date|time|timestamp|day|created_at|order_date|purchased_at)$/i.test(lower) || detectedType === 'date') {
    return 'date';
  }
  if (/(^|_)(price|amount|revenue|sales|total|gross|net|cost|mrp|unit_price|subtotal)$/i.test(lower)) {
    return 'monetary';
  }
  if (/(^|_)(quantity|qty|units|items_count|volume|pieces)$/i.test(lower)) {
    return 'quantity';
  }
  if (/(^|_)(discount|coupon|rebate|promo|pct_off)$/i.test(lower)) {
    return 'discount';
  }
  if (/(^|_)(status|payment_status|order_status|state|outcome)$/i.test(lower)) {
    return 'status';
  }
  if (/(^|_)(city|location|region|metro|state|country|zip|pincode)$/i.test(lower)) {
    return 'location';
  }
  if (/(^|_)(channel|acquisition|source|utm_source|referrer|medium)$/i.test(lower)) {
    return 'channel';
  }
  if (/(^|_)(returned|refunded|is_returned|is_refunded)$/i.test(lower) || detectedType === 'boolean') {
    return 'boolean';
  }

  return 'unknown';
}

/**
 * Checks if a string is a valid ISO or common date format
 */
function isValidDateString(str: any): boolean {
  if (!str || typeof str !== 'string') return false;
  if (/^\d{4}[-/.]\d{1,2}[-/.]\d{1,2}/.test(str)) {
    const timestamp = Date.parse(str);
    return !isNaN(timestamp);
  }
  if (/^\d{1,2}[-/.]\d{1,2}[-/.]\d{2,4}/.test(str)) {
    const timestamp = Date.parse(str);
    return !isNaN(timestamp);
  }
  return false;
}

/**
 * Profile all columns in a tabular dataset
 */
export function profileColumns(rows: Record<string, any>[]): { profiles: ColumnProfile[]; inferredRoles: InferredRoles } {
  if (!rows || rows.length === 0) {
    return { profiles: [], inferredRoles: {} };
  }

  const columnNames = Object.keys(rows[0]);
  const rowCount = rows.length;
  const profiles: ColumnProfile[] = [];
  const inferredRoles: InferredRoles = {};

  columnNames.forEach((colName) => {
    let missingCount = 0;
    const uniqueValues = new Set<string>();
    const validNumericValues: number[] = [];
    const sampleValues: any[] = [];
    let booleanCount = 0;
    let dateCount = 0;

    for (let i = 0; i < rowCount; i++) {
      const val = rows[i][colName];
      if (val === undefined || val === null || val === '' || (typeof val === 'number' && isNaN(val))) {
        missingCount++;
      } else {
        const strVal = String(val).trim();
        uniqueValues.add(strVal);

        if (sampleValues.length < 5 && !sampleValues.includes(strVal)) {
          sampleValues.push(val);
        }

        if (typeof val === 'boolean' || strVal.toLowerCase() === 'true' || strVal.toLowerCase() === 'false') {
          booleanCount++;
        }

        if (typeof val === 'number') {
          validNumericValues.push(val);
        } else if (typeof val === 'string' && !isNaN(Number(val)) && val.trim() !== '') {
          validNumericValues.push(Number(val));
        }

        if (isValidDateString(val)) {
          dateCount++;
        }
      }
    }

    const nonMissingCount = rowCount - missingCount;
    let detectedType: ColumnProfile['detectedType'] = 'categorical';

    if (nonMissingCount > 0) {
      if (dateCount / nonMissingCount > 0.8) {
        detectedType = 'date';
      } else if (validNumericValues.length / nonMissingCount > 0.85) {
        detectedType = 'numerical';
      } else if (booleanCount / nonMissingCount > 0.85) {
        detectedType = 'boolean';
      } else if (/(^|_)(id|code|key|uuid)$/i.test(colName) || uniqueValues.size === nonMissingCount) {
        detectedType = 'id';
      }
    }

    const role = inferColumnRole(colName, sampleValues, detectedType);

    // Map role to inferredRoles container
    if (role === 'id' && !inferredRoles.idColumn) inferredRoles.idColumn = colName;
    if (role === 'customer' && !inferredRoles.customerColumn) inferredRoles.customerColumn = colName;
    if (role === 'product' && !inferredRoles.productColumn) inferredRoles.productColumn = colName;
    if (role === 'category' && !inferredRoles.categoryColumn) inferredRoles.categoryColumn = colName;
    if (role === 'date' && !inferredRoles.dateColumn) inferredRoles.dateColumn = colName;
    if (role === 'monetary' && !inferredRoles.revenueColumn) inferredRoles.revenueColumn = colName;
    if (role === 'quantity' && !inferredRoles.quantityColumn) inferredRoles.quantityColumn = colName;
    if (role === 'discount' && !inferredRoles.discountColumn) inferredRoles.discountColumn = colName;
    if (role === 'status' && !inferredRoles.paymentStatusColumn) inferredRoles.paymentStatusColumn = colName;
    if (role === 'location' && !inferredRoles.cityColumn) inferredRoles.cityColumn = colName;
    if (role === 'channel' && !inferredRoles.channelColumn) inferredRoles.channelColumn = colName;
    if (role === 'boolean' && !inferredRoles.returnedColumn) inferredRoles.returnedColumn = colName;

    let min: number | string | undefined;
    let max: number | string | undefined;
    let mean: number | undefined;

    if (detectedType === 'numerical' && validNumericValues.length > 0) {
      min = Math.min(...validNumericValues);
      max = Math.max(...validNumericValues);
      const sum = validNumericValues.reduce((acc, v) => acc + v, 0);
      mean = Math.round((sum / validNumericValues.length) * 100) / 100;
    }

    profiles.push({
      name: colName,
      detectedType,
      inferredRole: role,
      missingCount,
      missingPercentage: Math.round((missingCount / (rowCount || 1)) * 1000) / 10,
      uniqueCount: uniqueValues.size,
      sampleValues,
      min,
      max,
      mean,
    });
  });

  return { profiles, inferredRoles };
}

/**
 * Calculates a rigorous data quality score (0 - 100) based on actual missing values, duplicates, and invalid fields
 */
export function calculateQualityScore(
  rows: Record<string, any>[],
  profiles: ColumnProfile[]
): QualityScore {
  const rowCount = rows.length;
  const colCount = profiles.length;
  const totalCells = Math.max(1, rowCount * colCount);

  if (rowCount === 0 || colCount === 0) {
    return {
      score: 0,
      grade: 'Needs Attention',
      breakdown: {
        missingValuesPct: 0,
        duplicateRowsPct: 0,
        invalidValuesPct: 0,
        completeValuesPct: 0,
        totalCells: 0,
        missingCells: 0,
        duplicateRowCount: 0,
        invalidCellsCount: 0,
      },
    };
  }

  // 1. Calculate missing cells count
  const missingCells = profiles.reduce((acc, p) => acc + p.missingCount, 0);

  // 2. Count duplicate rows using stringified row keys
  const rowSignatures = new Set<string>();
  let duplicateRowCount = 0;

  for (let i = 0; i < rowCount; i++) {
    // Generate signature from first 8 columns
    const keys = Object.keys(rows[i]);
    const sig = keys.map(k => String(rows[i][k])).join('|');
    if (rowSignatures.has(sig)) {
      duplicateRowCount++;
    } else {
      rowSignatures.add(sig);
    }
  }

  // 3. Count invalid cells (e.g., negative prices, invalid dates, NaN)
  let invalidCellsCount = 0;
  profiles.forEach((profile) => {
    if (profile.detectedType === 'numerical') {
      rows.forEach((r) => {
        const val = r[profile.name];
        if (val !== undefined && val !== null && val !== '') {
          const num = Number(val);
          if (isNaN(num) || ((profile.inferredRole === 'monetary' || profile.inferredRole === 'quantity') && num < 0)) {
            invalidCellsCount++;
          }
        }
      });
    } else if (profile.detectedType === 'date') {
      rows.forEach((r) => {
        const val = r[profile.name];
        if (val !== undefined && val !== null && val !== '' && !isValidDateString(val)) {
          invalidCellsCount++;
        }
      });
    }
  });

  const missingValuesPct = Math.round((missingCells / totalCells) * 1000) / 10;
  const duplicateRowsPct = Math.round((duplicateRowCount / rowCount) * 1000) / 10;
  const invalidValuesPct = Math.round((invalidCellsCount / totalCells) * 1000) / 10;
  const completeValuesPct = Math.max(0, Math.round((100 - missingValuesPct - duplicateRowsPct - invalidValuesPct) * 10) / 10);

  // Quality scoring formula: starts at 100, weighted deduction
  // Missing values deduction: up to 35 pts
  // Duplicate rows deduction: up to 30 pts
  // Invalid data deduction: up to 25 pts
  // Empty columns deduction: up to 10 pts
  const emptyCols = profiles.filter(p => p.missingCount === rowCount).length;
  
  const missingPenalty = Math.min(35, (missingCells / totalCells) * 100 * 1.5);
  const duplicatePenalty = Math.min(30, (duplicateRowCount / rowCount) * 100 * 1.8);
  const invalidPenalty = Math.min(25, (invalidCellsCount / totalCells) * 100 * 3.0);
  const emptyColPenalty = Math.min(10, (emptyCols / colCount) * 100);

  let rawScore = Math.round(100 - missingPenalty - duplicatePenalty - invalidPenalty - emptyColPenalty);
  rawScore = Math.max(0, Math.min(100, rawScore));

  let grade: QualityScore['grade'] = 'Needs Attention';
  if (rawScore >= 90) grade = 'Excellent';
  else if (rawScore >= 75) grade = 'Good';
  else if (rawScore >= 60) grade = 'Fair';

  return {
    score: rawScore,
    grade,
    breakdown: {
      missingValuesPct,
      duplicateRowsPct,
      invalidValuesPct,
      completeValuesPct,
      totalCells,
      missingCells,
      duplicateRowCount,
      invalidCellsCount,
    },
  };
}

/**
 * Detect non-destructive AI data preparation suggestions
 */
export function generateCleaningSuggestions(
  rows: Record<string, any>[],
  profiles: ColumnProfile[],
  qualityScore: QualityScore
): CleaningSuggestion[] {
  const suggestions: CleaningSuggestion[] = [];

  // 1. Missing Values
  const colsWithMissing = profiles.filter(p => p.missingCount > 0);
  if (colsWithMissing.length > 0) {
    const totalMissing = colsWithMissing.reduce((acc, c) => acc + c.missingCount, 0);
    suggestions.push({
      id: 'missing-values-check',
      type: 'missing_values',
      title: 'Missing Values in Dataset',
      description: `Detected missing values in ${colsWithMissing.length} column(s): ${colsWithMissing.map(c => `${c.name} (${c.missingCount})`).join(', ')}.`,
      severity: colsWithMissing.some(c => c.missingPercentage > 15) ? 'high' : 'medium',
      affectedColumns: colsWithMissing.map(c => c.name),
      affectedCount: totalMissing,
      recommendedAction: 'Impute missing numeric values with column median/mean or fill categorical values with "Unspecified". Original dataset will remain untouched.',
    });
  }

  // 2. Duplicate Records
  if (qualityScore.breakdown.duplicateRowCount > 0) {
    suggestions.push({
      id: 'duplicate-records-check',
      type: 'duplicate_rows',
      title: 'Duplicate Transaction Records',
      description: `Found ${qualityScore.breakdown.duplicateRowCount} duplicate transaction rows matching existing identifiers.`,
      severity: qualityScore.breakdown.duplicateRowCount > 20 ? 'high' : 'medium',
      affectedCount: qualityScore.breakdown.duplicateRowCount,
      recommendedAction: 'Flag and filter duplicate transaction instances to avoid revenue double-counting.',
    });
  }

  // 3. Date inconsistencies
  const dateCols = profiles.filter(p => p.detectedType === 'date' || p.inferredRole === 'date');
  let dateIssues = 0;
  dateCols.forEach(col => {
    rows.forEach(r => {
      const val = r[col.name];
      if (val && !isValidDateString(val)) dateIssues++;
    });
  });

  if (dateIssues > 0) {
    suggestions.push({
      id: 'date-inconsistency-check',
      type: 'date_inconsistency',
      title: 'Date Format Inconsistencies',
      description: `Detected ${dateIssues} date value(s) with non-standard datetime formats across date columns.`,
      severity: 'low',
      affectedColumns: dateCols.map(c => c.name),
      affectedCount: dateIssues,
      recommendedAction: 'Standardize date columns to ISO-8601 (YYYY-MM-DD) for accurate time-series trend analysis.',
    });
  }

  // 4. Invalid prices / negative values
  const monetaryCols = profiles.filter(p => p.inferredRole === 'monetary');
  let invalidPrices = 0;
  monetaryCols.forEach(col => {
    rows.forEach(r => {
      const val = Number(r[col.name]);
      if (r[col.name] !== null && r[col.name] !== undefined && !isNaN(val) && val <= 0) {
        invalidPrices++;
      }
    });
  });

  if (invalidPrices > 0) {
    suggestions.push({
      id: 'invalid-prices-check',
      type: 'invalid_prices',
      title: 'Potentially Invalid Price or Negative Amounts',
      description: `Found ${invalidPrices} record(s) where transaction price or amount is zero or negative.`,
      severity: 'medium',
      affectedColumns: monetaryCols.map(c => c.name),
      affectedCount: invalidPrices,
      recommendedAction: 'Isolate zero/negative amount records or treat them specifically as refunds/adjustments.',
    });
  }

  return suggestions;
}

/**
 * Calculates basic revenue KPIs and chart aggregations from actual dataset
 */
export function calculateRevenueAnalytics(
  rows: Record<string, any>[],
  inferredRoles: InferredRoles
): { kpis: RevenueKPIs; charts: DatasetAnalysisResult['charts'] } {
  const availableMetrics: string[] = [];
  const missingMetrics: string[] = [];

  const revCol = inferredRoles.revenueColumn;
  const qtyCol = inferredRoles.quantityColumn;
  const custCol = inferredRoles.customerColumn;
  const dateCol = inferredRoles.dateColumn;
  const catCol = inferredRoles.categoryColumn;
  const cityCol = inferredRoles.cityColumn;
  const statusCol = inferredRoles.paymentStatusColumn;
  const discCol = inferredRoles.discountColumn;
  const chanCol = inferredRoles.channelColumn;
  const retCol = inferredRoles.returnedColumn;

  let totalRevenue: number | null = null;
  let totalOrders: number | null = null;
  let averageOrderValue: number | null = null;
  let totalQuantity: number | null = null;
  let uniqueCustomers: number | null = null;
  let returningCustomerPercentage: number | null = null;
  let returnRatePercentage: number | null = null;
  let totalDiscounts: number | null = null;

  // Calculate Orders
  if (rows.length > 0) {
    totalOrders = rows.length;
    availableMetrics.push('Orders');
  }

  // Calculate Revenue
  if (revCol) {
    let sumRev = 0;
    let sumDiscounts = 0;
    let validRevCount = 0;

    rows.forEach(r => {
      const priceVal = Number(r[revCol]);
      const qtyVal = qtyCol ? Number(r[qtyCol]) || 1 : 1;
      const discVal = discCol ? Number(r[discCol]) || 0 : 0;

      if (!isNaN(priceVal) && priceVal > 0) {
        // Net price after discount
        const lineTotal = (priceVal * qtyVal) * (1 - (discVal / 100));
        sumRev += lineTotal;
        sumDiscounts += (priceVal * qtyVal) * (discVal / 100);
        validRevCount++;
      }
    });

    if (validRevCount > 0) {
      totalRevenue = Math.round(sumRev * 100) / 100;
      availableMetrics.push('Total Revenue');

      if (totalOrders && totalOrders > 0) {
        averageOrderValue = Math.round((totalRevenue / totalOrders) * 100) / 100;
        availableMetrics.push('Average Order Value');
      }

      if (discCol) {
        totalDiscounts = Math.round(sumDiscounts * 100) / 100;
        availableMetrics.push('Total Discounts');
      }
    }
  } else {
    missingMetrics.push('Total Revenue (no monetary column detected)');
    missingMetrics.push('Average Order Value (no monetary column detected)');
  }

  // Calculate Total Quantity
  if (qtyCol) {
    let sumQty = 0;
    rows.forEach(r => {
      const q = Number(r[qtyCol]);
      if (!isNaN(q)) sumQty += q;
    });
    totalQuantity = sumQty;
    availableMetrics.push('Total Quantity');
  } else {
    missingMetrics.push('Total Quantity (no quantity column detected)');
  }

  // Calculate Customers & Returning Customers
  if (custCol) {
    const customerOrdersCount = new Map<string, number>();
    rows.forEach(r => {
      const custId = String(r[custCol]);
      if (custId && custId !== 'null' && custId !== 'undefined' && custId.trim() !== '') {
        customerOrdersCount.set(custId, (customerOrdersCount.get(custId) || 0) + 1);
      }
    });

    uniqueCustomers = customerOrdersCount.size;
    availableMetrics.push('Unique Customers');

    if (uniqueCustomers > 0) {
      let returningCount = 0;
      customerOrdersCount.forEach(count => {
        if (count > 1) returningCount++;
      });
      returningCustomerPercentage = Math.round((returningCount / uniqueCustomers) * 1000) / 10;
      availableMetrics.push('Returning Customer %');
    }
  } else {
    missingMetrics.push('Unique Customers (no customer identifier detected)');
    missingMetrics.push('Returning Customers (no customer identifier detected)');
  }

  // Calculate Return Rate
  if (retCol) {
    let returnedCount = 0;
    rows.forEach(r => {
      const val = r[retCol];
      if (val === true || String(val).toLowerCase() === 'true' || String(val).toLowerCase() === 'yes') {
        returnedCount++;
      }
    });
    returnRatePercentage = Math.round((returnedCount / (rows.length || 1)) * 1000) / 10;
    availableMetrics.push('Return Rate');
  }

  // Chart 1: Revenue over time
  const revenueOverTime: RevenueTrendPoint[] = [];
  if (dateCol && revCol) {
    const dateMap = new Map<string, { revenue: number; orders: number }>();

    rows.forEach(r => {
      const d = String(r[dateCol]).trim().split('T')[0];
      const p = Number(r[revCol]) || 0;
      const q = qtyCol ? Number(r[qtyCol]) || 1 : 1;
      const disc = discCol ? Number(r[discCol]) || 0 : 0;
      const net = (p * q) * (1 - (disc / 100));

      if (d && isValidDateString(d)) {
        // Group by month or week if dataset is large, or daily
        const entry = dateMap.get(d) || { revenue: 0, orders: 0 };
        entry.revenue += net;
        entry.orders += 1;
        dateMap.set(d, entry);
      }
    });

    const sortedDates = Array.from(dateMap.keys()).sort();
    sortedDates.forEach(date => {
      const data = dateMap.get(date)!;
      revenueOverTime.push({
        date,
        revenue: Math.round(data.revenue),
        orders: data.orders,
      });
    });
  }

  // Chart 2 & 3: Revenue & Orders by Category
  const revenueByCategory: CategoryBreakdown[] = [];
  const ordersByCategory: CategoryBreakdown[] = [];
  if (catCol) {
    const catMap = new Map<string, { revenue: number; orders: number }>();

    rows.forEach(r => {
      const cat = String(r[catCol] || 'Uncategorized').trim();
      const p = revCol ? Number(r[revCol]) || 0 : 0;
      const q = qtyCol ? Number(r[qtyCol]) || 1 : 1;
      const disc = discCol ? Number(r[discCol]) || 0 : 0;
      const net = (p * q) * (1 - (disc / 100));

      const entry = catMap.get(cat) || { revenue: 0, orders: 0 };
      entry.revenue += net;
      entry.orders += 1;
      catMap.set(cat, entry);
    });

    Array.from(catMap.entries())
      .sort((a, b) => b[1].revenue - a[1].revenue)
      .forEach(([category, data]) => {
        const item: CategoryBreakdown = {
          category,
          revenue: Math.round(data.revenue),
          orders: data.orders,
          avgPrice: data.orders > 0 ? Math.round((data.revenue / data.orders) * 100) / 100 : 0,
        };
        revenueByCategory.push(item);
        ordersByCategory.push(item);
      });
  }

  // Chart 4: Revenue by City
  const revenueByCity: CityBreakdown[] = [];
  if (cityCol) {
    const cityMap = new Map<string, { revenue: number; orders: number }>();

    rows.forEach(r => {
      const city = String(r[cityCol] || 'Unspecified').trim();
      const p = revCol ? Number(r[revCol]) || 0 : 0;
      const q = qtyCol ? Number(r[qtyCol]) || 1 : 1;
      const net = (p * q);

      const entry = cityMap.get(city) || { revenue: 0, orders: 0 };
      entry.revenue += net;
      entry.orders += 1;
      cityMap.set(city, entry);
    });

    Array.from(cityMap.entries())
      .sort((a, b) => b[1].revenue - a[1].revenue)
      .slice(0, 10)
      .forEach(([city, data]) => {
        revenueByCity.push({
          city,
          revenue: Math.round(data.revenue),
          orders: data.orders,
        });
      });
  }

  // Chart 5: Payment Status Distribution
  const paymentStatusDistribution: StatusDistribution[] = [];
  if (statusCol) {
    const statusMap = new Map<string, number>();
    rows.forEach(r => {
      const s = String(r[statusCol] || 'Unknown').trim();
      statusMap.set(s, (statusMap.get(s) || 0) + 1);
    });

    const total = rows.length || 1;
    Array.from(statusMap.entries()).forEach(([status, count]) => {
      paymentStatusDistribution.push({
        status,
        count,
        percentage: Math.round((count / total) * 1000) / 10,
      });
    });
  }

  // Channel Performance
  const acquisitionChannels: ChannelPerformance[] = [];
  if (chanCol) {
    const chanMap = new Map<string, { revenue: number; customers: Set<string> }>();

    rows.forEach(r => {
      const chan = String(r[chanCol] || 'Direct').trim();
      const p = revCol ? Number(r[revCol]) || 0 : 0;
      const q = qtyCol ? Number(r[qtyCol]) || 1 : 1;
      const cust = custCol ? String(r[custCol]) : '';

      const entry = chanMap.get(chan) || { revenue: 0, customers: new Set<string>() };
      entry.revenue += (p * q);
      if (cust) entry.customers.add(cust);
      chanMap.set(chan, entry);
    });

    Array.from(chanMap.entries()).forEach(([channel, data]) => {
      acquisitionChannels.push({
        channel,
        revenue: Math.round(data.revenue),
        customers: data.customers.size,
      });
    });
  }

  return {
    kpis: {
      totalRevenue,
      totalOrders,
      averageOrderValue,
      totalQuantity,
      uniqueCustomers,
      returningCustomerPercentage,
      returnRatePercentage,
      totalDiscounts,
      availableMetrics,
      missingMetrics,
    },
    charts: {
      revenueOverTime,
      revenueByCategory,
      ordersByCategory,
      revenueByCity,
      paymentStatusDistribution,
      acquisitionChannels,
    },
  };
}

/**
 * Complete analysis pipeline for a loaded dataset
 */
export function analyzeDataset(
  datasetName: string,
  rows: Record<string, any>[],
  isDemo = false,
  fileSizeBytes?: number
): DatasetAnalysisResult {
  const { profiles, inferredRoles } = profileColumns(rows);
  const qualityScore = calculateQualityScore(rows, profiles);
  const cleaningSuggestions = generateCleaningSuggestions(rows, profiles, qualityScore);
  const { kpis, charts } = calculateRevenueAnalytics(rows, inferredRoles);

  return {
    datasetName,
    isDemo,
    uploadedAt: new Date().toISOString(),
    fileSizeBytes,
    rowCount: rows.length,
    columnCount: profiles.length,
    columns: profiles,
    inferredRoles,
    qualityScore,
    cleaningSuggestions,
    kpis,
    charts,
    sampleRows: rows.slice(0, 100), // First 100 rows for preview
    allRows: rows,
  };
}
