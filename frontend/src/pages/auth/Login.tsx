import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { authApi } from '../../api/auth.api';

const Login = () => {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = 3;

  const attemptLogin = async (currentRetry: number = 0): Promise<void> => {
    try {
      const response = await authApi.login(formData);
      setAuth(response.user, response.token);
      setRetryCount(0);
      setError('');
      navigate('/');
    } catch (err: any) {
      const isConnectionError = 
        err.isConnectionError ||
        err.code === 'ECONNREFUSED' || 
        err.message?.includes('ECONNREFUSED') ||
        err.message?.includes('Network Error') ||
        (!err.response && err.request);

      if (isConnectionError && currentRetry < maxRetries) {
        const remainingRetries = maxRetries - currentRetry;
        setError(
          `Cannot connect to server. Retrying in 2 seconds... (${remainingRetries - 1} attempts left)`
        );
        setRetryCount(currentRetry + 1);
        
        // Auto-retry after 2 seconds
        await new Promise(resolve => setTimeout(resolve, 2000));
        return attemptLogin(currentRetry + 1);
      } else if (isConnectionError) {
        setError(
          'Cannot connect to backend server. Please make sure the backend is running on port 5000.'
        );
        setRetryCount(0);
      } else {
        setError(err.response?.data?.error || 'Login failed. Please check your credentials.');
        setRetryCount(0);
      }
      throw err;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await attemptLogin(0);
    } catch (err) {
      // Error already handled in attemptLogin
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to Career Mentor
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className={`px-4 py-3 rounded ${
              error.includes('Cannot connect') 
                ? 'bg-yellow-50 border border-yellow-200 text-yellow-800' 
                : 'bg-red-50 border border-red-200 text-red-700'
            }`}>
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  {error.includes('Cannot connect') ? (
                    <svg className="h-5 w-5 text-yellow-600" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg className="h-5 w-5 text-red-600" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
                <div className="ml-3 flex-1">
                  <p className="text-sm font-medium">{error}</p>
                  {error.includes('Cannot connect') && (
                    <p className="mt-2 text-xs">
                      Make sure to run: <code className="bg-yellow-100 px-1 rounded">cd backend && npm run dev</code>
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email" className="sr-only">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="input-field rounded-t-md"
                placeholder="Email address"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="input-field rounded-b-md"
                placeholder="Password"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </div>

          <div className="text-center">
            <Link
              to="/register"
              className="text-sm text-primary-600 hover:text-primary-500"
            >
              Don't have an account? Sign up
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
