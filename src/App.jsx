import { lazy, Suspense, Component } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './context/AuthContext';
import { CampaignProvider } from './context/CampaignContext';
import { ThemeProvider } from './context/ThemeContext';
import Navigation from './components/layout/Navigation';
import Footer from './components/layout/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import { QUERY_CONFIG } from './utils/constants';

/* Code-split all pages via React.lazy */
const LandingPage = lazy(() => import('./pages/LandingPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const CreateCampaignPage = lazy(() => import('./pages/CreateCampaignPage'));
const CampaignDetailsPage = lazy(() => import('./pages/CampaignDetailsPage'));
const TrendsPage = lazy(() => import('./pages/TrendsPage'));
const InfluencersPage = lazy(() => import('./pages/InfluencersPage'));
const AnalyticsPage = lazy(() => import('./pages/AnalyticsPage'));

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: QUERY_CONFIG.STALE_TIME,
            gcTime: QUERY_CONFIG.CACHE_TIME,
            retry: QUERY_CONFIG.RETRY,
            refetchOnWindowFocus: false,
        },
    },
});

/* ─── Error Boundary ─── */
class ErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    render() {
        if (this.state.hasError) {
            return (
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '100vh',
                    padding: '24px',
                    fontFamily: "'Inter', sans-serif",
                    color: '#CF9D7B',
                    textAlign: 'center',
                }}>
                    <h1 style={{ fontSize: '24px', marginBottom: '12px' }}>Something went wrong</h1>
                    <p style={{ color: 'rgba(207,157,123,0.65)', maxWidth: '500px', marginBottom: '16px' }}>
                        {this.state.error?.message || 'An unexpected error occurred.'}
                    </p>
                    <button
                        onClick={() => window.location.reload()}
                        style={{
                            padding: '10px 24px',
                            background: '#724B39',
                            color: '#CF9D7B',
                            border: 'none',
                            borderRadius: '6px',
                            fontWeight: 600,
                            cursor: 'pointer',
                        }}
                    >
                        Reload Page
                    </button>
                </div>
            );
        }
        return this.props.children;
    }
}

/* ─── Page Loader (Suspense fallback) ─── */
function PageLoader() {
    return (
        <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '60vh',
        }}>
            <div style={{
                width: '40px',
                height: '40px',
                border: '3px solid #3A3534',
                borderTopColor: '#CF9D7B',
                borderRadius: '50%',
                animation: 'spin 0.8s linear infinite',
            }} />
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    );
}

/* ─── App ─── */
export default function App() {
    return (
        <ErrorBoundary>
            <QueryClientProvider client={queryClient}>
                <ThemeProvider>
                    <AuthProvider>
                        <CampaignProvider>
                            <BrowserRouter>
                                <Navigation />
                                <main style={{ flex: 1 }}>
                                    <Suspense fallback={<PageLoader />}>
                                        <Routes>
                                            {/* Public Routes */}
                                            <Route path="/" element={<LandingPage />} />
                                            <Route path="/login" element={<LoginPage />} />
                                            <Route path="/register" element={<RegisterPage />} />

                                            {/* Protected Routes (require Cognito auth) */}
                                            <Route element={<ProtectedRoute />}>
                                                <Route path="/dashboard" element={<DashboardPage />} />
                                                <Route path="/campaigns/create" element={<CreateCampaignPage />} />
                                                <Route path="/campaigns/:id" element={<CampaignDetailsPage />} />
                                                <Route path="/trends" element={<TrendsPage />} />
                                                <Route path="/influencers" element={<InfluencersPage />} />
                                                <Route path="/analytics" element={<AnalyticsPage />} />
                                            </Route>

                                            {/* Catch-all redirect */}
                                            <Route path="*" element={<Navigate to="/" replace />} />
                                        </Routes>
                                    </Suspense>
                                </main>
                                <Footer />
                            </BrowserRouter>
                        </CampaignProvider>
                    </AuthProvider>
                </ThemeProvider>
            </QueryClientProvider>
        </ErrorBoundary>
    );
}
