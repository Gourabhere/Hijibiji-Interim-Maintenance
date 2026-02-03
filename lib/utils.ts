// Helper to get monthly breakdown
export const getMonthlyExpenseBreakdown = (
    expenses2025: Record<string, number>,
    expenseReport: any[]
) => {
    const monthOrder = ['aug', 'sept', 'oct', 'nov', 'dec'] as const;
    const breakdown: Record<string, number> = { aug: 0, sept: 0, oct: 0, nov: 0, dec: 0 };

    // Map app months to likely report month names
    const monthMap: Record<string, string[]> = {
        'aug': ['aug', 'august'],
        'sept': ['sep', 'sept', 'september'],
        'oct': ['oct', 'october'],
        'nov': ['nov', 'november'],
        'dec': ['dec', 'december']
    };

    // If report available, try to fetch from it
    if (expenseReport && expenseReport.length > 0) {
        for (const month of monthOrder) {
            // Find record for this month (case-insensitive)
            const reportRow = expenseReport.find(r => {
                const rMonth = String(r.Month || r.month || '').toLowerCase().trim();
                return monthMap[month].some(m => rMonth === m || rMonth.includes(m));
            });

            if (reportRow) {
                // Prioritize user specified column, then common variations
                const val = reportRow['Expense borne by each Owner'] ||
                    reportRow['Expense_borne_by_each_Owner'] ||
                    reportRow['Expense Borne By Each Owner'] ||
                    reportRow['Share per Flat'] ||
                    reportRow['share_per_flat'] || 0;

                const numVal = typeof val === 'string' ? Number(val.replace(/,/g, '')) : Number(val);
                breakdown[month] = isNaN(numVal) ? 0 : numVal;
            } else {
                // Fallback to configured expenses
                const fallbackKey = month === 'sept' ? (expenses2025.sept !== undefined ? 'sept' : 'sep') : month;
                breakdown[month] = (expenses2025 as any)[fallbackKey] || 0;
            }
        }
    } else {
        // Legacy fallback (Config only)
        for (const month of monthOrder) {
            const fallbackKey = month === 'sept' ? (expenses2025.sept !== undefined ? 'sept' : 'sep') : month;
            breakdown[month] = (expenses2025 as any)[fallbackKey] || 0;
        }
    }

    return breakdown;
};

export const calculateSharedExp2025 = (
    p25: any, // Using any to avoid circular deps or complex type imports for now, or import properly
    expenses2025: Record<string, number>,
    expenseReport: any[]
): number => {
    // 1. Get Monthly Rates
    const rates = getMonthlyExpenseBreakdown(expenses2025, expenseReport);

    // 2. Determine Start Month (first non-zero payment)
    const monthlyPayments = {
        aug: p25.aug || 0,
        sept: p25.sept || 0,
        oct: p25.oct || 0,
        nov: p25.nov || 0,
        dec: p25.dec || 0
    };

    const monthOrder = ['aug', 'sept', 'oct', 'nov', 'dec'] as const;
    const startMonth = monthOrder.find(month => monthlyPayments[month] > 0);

    if (!startMonth) return 0;

    // 3. Sum from start month onwards
    let total = 0;
    let countFromStart = false;

    for (const month of monthOrder) {
        if (month === startMonth) countFromStart = true;
        if (countFromStart) {
            total += rates[month];
        }
    }

    return Math.round(total);
};

export const calculateLifetimePaid = (p25: any, p26: any): number => {
    const paid2025 = (Number(p25?.aug) || 0) +
        (Number(p25?.sept) || 0) +
        (Number(p25?.oct) || 0) +
        (Number(p25?.nov) || 0) +
        (Number(p25?.dec) || 0);

    const paid2026Q1 = Number(p26?.q1Payment) || 0;

    return paid2025 + paid2026Q1;
};
