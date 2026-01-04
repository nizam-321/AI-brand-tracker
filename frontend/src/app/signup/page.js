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

export default function SignupPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    company: '',
    brands: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signup } = useAuth();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const startTime = Date.now();
    try {
      const brands = formData.brands.split(',').map(b => b.trim()).filter(b => b);
      await signup({ ...formData, brands });
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, 500 - elapsed);
      setTimeout(() => setLoading(false), remaining);
    } catch (err) {
      setError(err.response?.data?.message || 'Signup failed. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white p-4">
      <div className="w-full max-w-md">
        <Card className="border border-gray-300 shadow-lg bg-white">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-black mb-2">
              Create Account
            </CardTitle>
            <CardDescription className="text-gray-600">
              Start monitoring your brand in minutes
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
                <Label htmlFor="name" className="text-black">Full Name</Label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="mt-1 bg-white border border-gray-300 focus:border-gray-400 text-black placeholder:text-gray-400"
                />
              </div>

              <div>
                <Label htmlFor="email" className="text-black">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="name@company.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="mt-1 bg-white border border-gray-300 focus:border-gray-400 text-black placeholder:text-gray-400"
                />
              </div>

              <div>
                <Label htmlFor="password" className="text-black">Password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  minLength={6}
                  className="mt-1 bg-white border border-gray-300 focus:border-gray-400 text-black placeholder:text-gray-400"
                />
                <p className="text-xs text-gray-500">Minimum 6 characters</p>
              </div>

              <div>
                <Label htmlFor="company" className="text-black">Company (Optional)</Label>
                <Input
                  id="company"
                  name="company"
                  type="text"
                  placeholder="Your Company Inc."
                  value={formData.company}
                  onChange={handleChange}
                  className="mt-1 bg-white border border-gray-300 focus:border-gray-400 text-black placeholder:text-gray-400"
                />
              </div>

              <div>
                <Label htmlFor="brands" className="text-black">Brands to Monitor</Label>
                <Input
                  id="brands"
                  name="brands"
                  type="text"
                  placeholder="Tesla, Apple, Google"
                  value={formData.brands}
                  onChange={handleChange}
                  className="mt-1 bg-white border border-gray-300 focus:border-gray-400 text-black placeholder:text-gray-400"
                />
                <p className="text-xs text-gray-500">Comma-separated list</p>
              </div>

              <Button
                type="submit"
                variant="cta" size="lg"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 flex justify-center items-center"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Creating account...
                  </>
                ) : (
                  <>
                    Create Account <ArrowRight className="w-5 h-5 ml-2" />
                  </>
                )}
              </Button>
            </form>

            <div className="mt-4 text-center text-gray-600 text-sm">
              Already have an account?{' '}
              <Link href="/login" className="text-blue-800 hover:underline font-medium">
                Login
              </Link>
            </div>
          </CardContent>
        </Card>

        <p className="text-center text-gray-600 text-sm mt-4">
          By signing up, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  );
}
