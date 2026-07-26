"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseCommissionRate = parseCommissionRate;
const client_1 = require("@prisma/client");
function parseCommissionRate(value) {
    if (value === null || value === undefined) {
        return { commissionType: client_1.CommissionType.PERCENTAGE, platformValue: 15 };
    }
    // If value is a JSON object with type and value keys
    if (typeof value === 'object' && value !== null) {
        const type = value.type === 'FIXED' ? client_1.CommissionType.FIXED : client_1.CommissionType.PERCENTAGE;
        const val = Number(value.value ?? value.rate ?? 15);
        return { commissionType: type, platformValue: isNaN(val) ? 15 : val };
    }
    const str = String(value).trim().toUpperCase();
    // If the value contains "FIXED" (e.g. "FIXED:10" or "FIXED 10")
    if (str.startsWith('FIXED')) {
        const match = str.match(/FIXED\s*[:\-\s]?\s*([\d.]+)/i);
        const val = match ? parseFloat(match[1]) : 15;
        return { commissionType: client_1.CommissionType.FIXED, platformValue: isNaN(val) ? 15 : val };
    }
    // If the value contains "PERCENTAGE" or "PERCENT" (e.g. "PERCENTAGE:15")
    if (str.startsWith('PERCENTAGE') || str.startsWith('PERCENT')) {
        const match = str.match(/(?:PERCENTAGE|PERCENT)\s*[:\-\s]?\s*([\d.]+)/i);
        const val = match ? parseFloat(match[1]) : 15;
        return { commissionType: client_1.CommissionType.PERCENTAGE, platformValue: isNaN(val) ? 15 : val };
    }
    // If it's a numeric string ending with % or just a number
    const cleanStr = str.replace('%', '');
    const numericVal = parseFloat(cleanStr);
    if (!isNaN(numericVal)) {
        return { commissionType: client_1.CommissionType.PERCENTAGE, platformValue: numericVal };
    }
    return { commissionType: client_1.CommissionType.PERCENTAGE, platformValue: 15 };
}
