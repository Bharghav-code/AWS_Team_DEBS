import { COGNITO_CONFIG } from '../utils/constants';

/**
 * Demo / mock auth mode.
 * When Cognito env vars are not configured, we use hardcoded
 * credentials so the app is fully functional without AWS.
 *
 * Default credentials:  divisha / divisha
 */

const DEMO_USER = {
    email: 'divisha',
    name: 'Divisha',
    sub: 'demo-user-001',
};

const DEMO_PASSWORD = 'divisha';

/* ── Cognito availability check ── */
function isCognitoConfigured() {
    const poolId = COGNITO_CONFIG.USER_POOL_ID;
    const clientId = COGNITO_CONFIG.CLIENT_ID;
    return poolId && clientId && !poolId.includes('<') && !clientId.includes('<') && poolId.length > 5 && clientId.length > 5;
}

let _cognitoModule = null;
let _userPool = null;

async function getCognitoPool() {
    if (_userPool) return _userPool;
    if (!isCognitoConfigured()) return null;

    try {
        if (!_cognitoModule) {
            _cognitoModule = await import('amazon-cognito-identity-js');
        }
        _userPool = new _cognitoModule.CognitoUserPool({
            UserPoolId: COGNITO_CONFIG.USER_POOL_ID,
            ClientId: COGNITO_CONFIG.CLIENT_ID,
        });
        return _userPool;
    } catch {
        return null;
    }
}

/* ══════════════════════════════════════
   Public API — used by AuthContext
   ══════════════════════════════════════ */

/**
 * Sign up
 */
export async function signUp(email, password, name) {
    const pool = await getCognitoPool();

    if (!pool) {
        // Demo mode — accept any signup, store in localStorage
        const users = JSON.parse(localStorage.getItem('virale_demo_users') || '[]');
        if (users.find((u) => u.email === email)) {
            throw new Error('User already exists');
        }
        users.push({ email, password, name });
        localStorage.setItem('virale_demo_users', JSON.stringify(users));
        return { user: { username: email } };
    }

    // Real Cognito signup
    const { CognitoUserAttribute } = _cognitoModule;
    return new Promise((resolve, reject) => {
        const attributes = [
            new CognitoUserAttribute({ Name: 'email', Value: email }),
            new CognitoUserAttribute({ Name: 'name', Value: name }),
        ];
        pool.signUp(email, password, attributes, null, (err, result) => {
            if (err) return reject(err);
            resolve(result);
        });
    });
}

/**
 * Sign in
 */
export async function signIn(email, password) {
    const pool = await getCognitoPool();

    if (!pool) {
        // Demo mode — check hardcoded creds or localStorage registered users
        const users = JSON.parse(localStorage.getItem('virale_demo_users') || '[]');
        const registeredUser = users.find((u) => u.email === email && u.password === password);

        if ((email === DEMO_USER.email && password === DEMO_PASSWORD) || registeredUser) {
            const userData = {
                idToken: 'demo-token',
                accessToken: 'demo-access-token',
                refreshToken: 'demo-refresh-token',
                email: email,
                name: registeredUser?.name || DEMO_USER.name,
                sub: `demo-${email}`,
            };
            localStorage.setItem('virale_session', JSON.stringify(userData));
            return userData;
        }
        throw new Error('Invalid credentials. Use divisha / divisha');
    }

    // Real Cognito signin
    const { CognitoUser, AuthenticationDetails } = _cognitoModule;
    return new Promise((resolve, reject) => {
        const cognitoUser = new CognitoUser({ Username: email, Pool: pool });
        const authDetails = new AuthenticationDetails({ Username: email, Password: password });

        cognitoUser.authenticateUser(authDetails, {
            onSuccess: (session) => {
                const userData = {
                    idToken: session.getIdToken().getJwtToken(),
                    accessToken: session.getAccessToken().getJwtToken(),
                    refreshToken: session.getRefreshToken().getToken(),
                    email: session.getIdToken().payload.email,
                    name: session.getIdToken().payload.name,
                    sub: session.getIdToken().payload.sub,
                };
                localStorage.setItem('virale_session', JSON.stringify(userData));
                resolve(userData);
            },
            onFailure: (err) => reject(err),
        });
    });
}

/**
 * Sign out
 */
export async function signOut() {
    const pool = await getCognitoPool();
    if (pool) {
        const cognitoUser = pool.getCurrentUser();
        if (cognitoUser) cognitoUser.signOut();
    }
    localStorage.removeItem('virale_session');
}

/**
 * Get current session
 */
export async function getCurrentSession() {
    // First check localStorage for demo session
    try {
        const stored = localStorage.getItem('virale_session');
        if (stored) {
            const parsed = JSON.parse(stored);
            if (parsed && parsed.idToken) {
                // If it's a demo token, return it directly
                if (parsed.idToken === 'demo-token') {
                    return parsed;
                }
            }
        }
    } catch {
        // ignore
    }

    const pool = await getCognitoPool();
    if (!pool) {
        throw new Error('No session');
    }

    return new Promise((resolve, reject) => {
        const cognitoUser = pool.getCurrentUser();
        if (!cognitoUser) return reject(new Error('No user'));

        cognitoUser.getSession((err, session) => {
            if (err || !session || !session.isValid()) {
                return reject(err || new Error('Invalid session'));
            }
            const userData = {
                idToken: session.getIdToken().getJwtToken(),
                accessToken: session.getAccessToken().getJwtToken(),
                refreshToken: session.getRefreshToken().getToken(),
                email: session.getIdToken().payload.email,
                name: session.getIdToken().payload.name,
                sub: session.getIdToken().payload.sub,
            };
            localStorage.setItem('virale_session', JSON.stringify(userData));
            resolve(userData);
        });
    });
}

/**
 * Confirm signup (demo mode skips this)
 */
export async function confirmSignUp(email, code) {
    const pool = await getCognitoPool();
    if (!pool) {
        // Demo mode — auto-confirm
        return 'SUCCESS';
    }

    const { CognitoUser } = _cognitoModule;
    return new Promise((resolve, reject) => {
        const cognitoUser = new CognitoUser({ Username: email, Pool: pool });
        cognitoUser.confirmRegistration(code, true, (err, result) => {
            if (err) return reject(err);
            resolve(result);
        });
    });
}
