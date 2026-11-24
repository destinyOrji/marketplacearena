/**
 * validatePassword
 *
 * Rules enforced:
 *   - At least 8 characters
 *   - At least one uppercase letter  (A–Z)
 *   - At least one lowercase letter  (a–z)
 *   - At least one digit             (0–9)
 *   - At least one special character (@#$%!&*^()_+=-[]{}|;':",.<>?/`~\\)
 *
 * @param {string} password
 * @returns {{ valid: boolean, message: string }}
 */
const validatePassword = (password) => {
    if (!password || typeof password !== 'string') {
        return { valid: false, message: 'Password is required.' };
    }
    if (password.length < 8) {
        return { valid: false, message: 'Password must be at least 8 characters long.' };
    }
    if (!/[A-Z]/.test(password)) {
        return { valid: false, message: 'Password must contain at least one uppercase letter (A–Z).' };
    }
    if (!/[a-z]/.test(password)) {
        return { valid: false, message: 'Password must contain at least one lowercase letter (a–z).' };
    }
    if (!/[0-9]/.test(password)) {
        return { valid: false, message: 'Password must contain at least one number (0–9).' };
    }
    if (!/[^A-Za-z0-9]/.test(password)) {
        return { valid: false, message: 'Password must contain at least one special character (e.g. @, #, $, %, !).' };
    }
    return { valid: true, message: '' };
};

module.exports = validatePassword;
