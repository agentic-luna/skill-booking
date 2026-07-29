"use strict";
/**
 * Email Normalization & RFC-compliant Format Validation Utility
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.EMAIL_REGEX = void 0;
exports.normalizeEmail = normalizeEmail;
exports.isValidEmail = isValidEmail;
exports.EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
/**
 * Normalizes email by trimming whitespace and converting to lowercase.
 * No uppercase letters allowed in processing.
 */
function normalizeEmail(email) {
    if (!email)
        return '';
    return email.trim().toLowerCase();
}
/**
 * Validates whether given input string is a valid format email address.
 */
function isValidEmail(email) {
    if (!email)
        return false;
    const clean = normalizeEmail(email);
    return exports.EMAIL_REGEX.test(clean);
}
