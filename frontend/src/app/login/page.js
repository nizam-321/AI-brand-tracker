//path: frontend/src/app/login/page.js
'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, ArrowRight, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState('demo@brandtracker.com');
  const [password, setPassword] = useState('demo123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const startTime = Date.now();
    try {
      await login(email, password);
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, 500 - elapsed);
      setTimeout(() => setLoading(false), remaining);
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white p-4">
      <div className="w-full max-w-md">
        <Card className="border border-gray-300 shadow-lg bg-white">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-black">
              Welcome Back
            </CardTitle>
            <CardDescription className="text-gray-600">
              Enter your credentials to access your dashboard
            </CardDescription>
          </CardHeader>

          <CardContent>
            {error && (
              <Alert className="mb-4 bg-gray-100 border border-gray-300">
                <AlertCircle className="h-4 w-4 text-black" />
                <AlertDescription className="text-black">{error}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="email" className="text-black">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="mt-1 bg-white border border-gray-300 focus:border-gray-400 text-black placeholder:text-gray-400"
                />
              </div>

              <div>
                <Label htmlFor="password" className="text-black">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="mt-1 bg-white border border-gray-300 focus:border-gray-400 text-black placeholder:text-gray-400"
                />
              </div>

              <Button
                type="submit"
                disabled={loading}
                variant="cta" size="lg"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 flex justify-center items-center"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Logging in...
                  </>
                ) : (
                  <>
                    Login <ArrowRight className="w-5 h-5 ml-2" />
                  </>
                )}
              </Button>
            </form>

            <div className="mt-4 text-center text-gray-600 text-sm">
              Don&#39;t have an account?{' '}
              <Link href="/signup" className="text-blue-800 hover:underline font-medium">
                Sign up
              </Link>
            </div>

            {/* Demo Credentials */}
            <div className="mt-6 p-3 bg-gray-100 border border-gray-300 rounded text-center text-sm text-black">
              <p className="font-medium mb-1">🎯 Demo Credentials</p>
              <p>Email: <span className="font-mono">demo@brandtracker.com</span></p>
              <p>Password: <span className="font-mono">demo123</span></p>
            </div>
          </CardContent>
        </Card>

        <p className="text-center text-gray-600 text-sm mt-4">
          By continuing, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  );
}
