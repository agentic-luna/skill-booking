"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseDurationToHours = parseDurationToHours;
/**
 * Utility to parse duration strings (e.g. "3 hours", "45 mins", "1.5 hr") into numeric hours.
 * Defaults to 2.0 if the duration is invalid or cannot be parsed.
 */
function parseDurationToHours(duration) {
    if (!duration)
        return 2.0;
    const clean = duration.trim().toLowerCase();
    // Try matching hours (e.g. "3 hours", "1.5 hrs", "2 hr")
    const hourMatch = clean.match(/^([\d.]+)\s*(?:hour|hours|hr|hrs)/i);
    if (hourMatch) {
        const val = parseFloat(hourMatch[1]);
        if (!isNaN(val))
            return val;
    }
    // Try matching minutes (e.g. "45 mins", "30 min", "60 minutes")
    const minMatch = clean.match(/^([\d.]+)\s*(?:min|mins|minute|minutes)/i);
    if (minMatch) {
        const val = parseFloat(minMatch[1]);
        if (!isNaN(val))
            return val / 60;
    }
    // Fallback to direct float parsing if it's just a number
    const directVal = parseFloat(clean);
    if (!isNaN(directVal))
        return directVal;
    return 2.0;
}
