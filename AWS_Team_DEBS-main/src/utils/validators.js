export function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) return 'Email is required';
    if (!re.test(email)) return 'Invalid email address';
    return null;
}

export function validatePassword(password) {
    if (!password) return 'Password is required';
    if (password.length < 8) return 'Password must be at least 8 characters';
    if (!/[A-Z]/.test(password)) return 'Password must contain an uppercase letter';
    if (!/[a-z]/.test(password)) return 'Password must contain a lowercase letter';
    if (!/[0-9]/.test(password)) return 'Password must contain a number';
    return null;
}

export function validateName(name) {
    if (!name) return 'Name is required';
    if (name.length < 2) return 'Name must be at least 2 characters';
    return null;
}

export function validateBudget(budget) {
    if (!budget || budget < 5000) return 'Minimum budget is ₹5,000';
    if (budget > 500000) return 'Maximum budget is ₹5,00,000';
    return null;
}

export function validateCampaignName(name) {
    if (!name) return 'Campaign name is required';
    if (name.length < 3) return 'Campaign name must be at least 3 characters';
    if (name.length > 100) return 'Campaign name must be under 100 characters';
    return null;
}
