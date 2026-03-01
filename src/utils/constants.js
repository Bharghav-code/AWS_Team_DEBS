export const ROUTES = {
    HOME: '/',
    LOGIN: '/login',
    REGISTER: '/register',
    DASHBOARD: '/dashboard',
    CREATE_CAMPAIGN: '/campaigns/create',
    CAMPAIGN_DETAILS: '/campaigns/:id',
    TRENDS: '/trends',
    INFLUENCERS: '/influencers',
    ANALYTICS: '/analytics',
};

export const API_ENDPOINTS = {
    AUTH: '/auth',
    CAMPAIGNS: '/campaigns',
    TRENDS: '/trends',
    INFLUENCERS: '/influencers',
    CONTENT: '/content',
    ANALYTICS: '/analytics',
};

export const BUDGET = {
    MIN: 5000,
    MAX: 100000,
    STEPS: [5000, 20000, 35000, 50000, 65000, 80000, 95000, 100000],
};

export const WIZARD_STEPS = [
    { number: 1, label: 'Budget & Goals', key: 'budget' },
    { number: 2, label: 'Target State', key: 'market' },
    { number: 3, label: 'Content', key: 'content' },
    { number: 4, label: 'Influencers', key: 'influencers' },
    { number: 5, label: 'Review', key: 'review' },
];

export const MARKETS = [
    { id: 'andhra-pradesh', name: 'Andhra Pradesh' },
    { id: 'arunachal-pradesh', name: 'Arunachal Pradesh' },
    { id: 'assam', name: 'Assam' },
    { id: 'bihar', name: 'Bihar' },
    { id: 'chhattisgarh', name: 'Chhattisgarh' },
    { id: 'goa', name: 'Goa' },
    { id: 'gujarat', name: 'Gujarat' },
    { id: 'haryana', name: 'Haryana' },
    { id: 'himachal-pradesh', name: 'Himachal Pradesh' },
    { id: 'jharkhand', name: 'Jharkhand' },
    { id: 'karnataka', name: 'Karnataka' },
    { id: 'kerala', name: 'Kerala' },
    { id: 'madhya-pradesh', name: 'Madhya Pradesh' },
    { id: 'maharashtra', name: 'Maharashtra' },
    { id: 'manipur', name: 'Manipur' },
    { id: 'meghalaya', name: 'Meghalaya' },
    { id: 'mizoram', name: 'Mizoram' },
    { id: 'nagaland', name: 'Nagaland' },
    { id: 'odisha', name: 'Odisha' },
    { id: 'punjab', name: 'Punjab' },
    { id: 'rajasthan', name: 'Rajasthan' },
    { id: 'sikkim', name: 'Sikkim' },
    { id: 'tamil-nadu', name: 'Tamil Nadu' },
    { id: 'telangana', name: 'Telangana' },
    { id: 'tripura', name: 'Tripura' },
    { id: 'uttar-pradesh', name: 'Uttar Pradesh' },
    { id: 'uttarakhand', name: 'Uttarakhand' },
    { id: 'west-bengal', name: 'West Bengal' },
    { id: 'jammu-kashmir', name: 'Jammu & Kashmir' },
];

export const CATEGORIES = [
    'Fitness',
    'Beauty',
    'Technology',
    'Food',
    'Travel',
    'Fashion',
    'Health',
    'Entertainment',
];

export const CAMPAIGN_STATUS = {
    ACTIVE: 'active',
    PAUSED: 'paused',
    DRAFT: 'draft',
    COMPLETED: 'completed',
};

export const QUERY_CONFIG = {
    STALE_TIME: 5 * 60 * 1000,
    CACHE_TIME: 10 * 60 * 1000,
    RETRY: 2,
};

export const API_CONFIG = {
    BASE_URL: import.meta.env.VITE_API_URL || '',
    TIMEOUT: 5000,
};

export const COGNITO_CONFIG = {
    USER_POOL_ID: import.meta.env.VITE_COGNITO_USER_POOL_ID || '',
    CLIENT_ID: import.meta.env.VITE_COGNITO_CLIENT_ID || '',
    REGION: import.meta.env.VITE_REGION || 'us-east-1',
};
