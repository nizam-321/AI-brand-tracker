'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useSocket } from '@/hooks/useSocket';
import { mentionsAPI, analyticsAPI } from '@/lib/api';
import { toast } from 'sonner';

// UI
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import {
  RefreshCw,
  LogOut,
  Settings,
  BarChart3,
  User,
  Search,
  Activity,
  MessageSquare,
  TrendingUp,
  Clock,
  Filter,
} from 'lucide-react';

// Dashboard Components
import StatsCards from '@/components/dashboard/StatsCards';
import SentimentChart from '@/components/dashboard/SentimentChart';
import TimelineChart from '@/components/dashboard/TimelineChart';
import TopicsChart from '@/components/dashboard/TopicsChart';
import SourcesChart from '@/components/dashboard/SourcesChart';
import MentionsFeed from '@/components/dashboard/MentionsFeed';

// ⭐ NEW IMPORT
import NotificationPanel from '@/components/dashboard/NotificationPanel';

export default function DashboardPage() {
  const { user, logout, loading: authLoading } = useAuth();
  const router = useRouter();

  const [brandName, setBrandName] = useState('');
  const [timeRange, setTimeRange] = useState('24h');
  const [filterSentiment, setFilterSentiment] = useState('all');
  const [mentions, setMentions] = useState([]);
  const [stats, setStats] = useState(null);
  const [timeline, setTimeline] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  const { socket, connected } = useSocket(brandName);

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    } else if (user && !brandName) {
      setBrandName(user.brands?.[0] || 'Tesla');
    }
  }, [user, authLoading, router, brandName]);

  // Fetch Data
  const fetchData = async () => {
    if (!brandName) return;
    setLoading(true);

    try {
      const [mentionsRes, summaryRes, timelineRes] = await Promise.all([
        mentionsAPI.getByBrand(brandName, { timeRange }),
        analyticsAPI.getSummary({ brand: brandName, timeRange }),
        analyticsAPI.getTimeline({ brand: brandName, timeRange })
      ]);

      setMentions(mentionsRes.data);
      setStats(summaryRes.data.summary);
      setTimeline(timelineRes.data);

      toast.success(`Loaded ${mentionsRes.data.length} mentions for ${brandName}`, {
        description: `Time range: ${timeRange}`,
        duration: 3000,
      });
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load data', {
        description: 'Please try again or check your connection',
        duration: 5000,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (brandName) {
      fetchData();
    }
  }, [brandName, timeRange]);

  // Socket Event Listeners
  useEffect(() => {
    if (!socket || !brandName) return;

    socket.on('new_mention', (mention) => {
      if (mention.brand.toLowerCase() === brandName.toLowerCase()) {
        setMentions((prev) => [mention, ...prev].slice(0, 50));
        toast.info('New mention received!', {
          description: `${mention.source}: ${mention.text.slice(0, 50)}...`,
          duration: 3000,
        });
      }
    });

    socket.on('spike_detected', (data) => {
      if (data.brand.toLowerCase() === brandName.toLowerCase()) {
        toast.warning('Spike Detected!', {
          description: data.message,
          duration: 5000,
        });
      }
    });

    return () => {
      socket.off('new_mention');
      socket.off('spike_detected');
    };
  }, [socket, brandName]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-700 text-lg">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* HEADER */}
      <header className="sticky top-0 z-40 bg-white border-b shadow-sm">
        <div className="container mx-auto flex justify-between items-center px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-linear-to-br from-indigo-600 to-purple-600 flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">BrandTracker</h1>
              <p className="text-xs text-gray-500">Real-time Monitoring</p>
            </div>
          </div>

          <div className="flex items-center gap-4">

            {/* Connection Status */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-100 border border-gray-200">
              <div className={`w-2 h-2 rounded-full ${connected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
              <span className="text-xs font-medium text-gray-700">{connected ? 'Live' : 'Offline'}</span>
            </div>

            {/* ⭐ NOTIFICATION PANEL (REPLACED OLD BELL BUTTON) */}
            <NotificationPanel mentions={mentions} stats={stats} />

            {/* Settings */}
            <Button variant="ghost" size="icon" className="text-gray-600 hover:bg-gray-100">
              <Settings className="w-5 h-5" />
            </Button>

            {/* User Profile */}
            <div className="flex items-center gap-2 px-3 py-1.5 border rounded-lg bg-gray-50 shadow-sm">
              <div className="w-8 h-8 rounded-full bg-linear-to-br from-indigo-600 to-purple-600 flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
              </div>
              <div className="hidden md:block">
                <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                <p className="text-xs text-gray-500">{user?.email}</p>
              </div>
            </div>

            {/* Logout */}
            <Button
              onClick={() => {
                logout();
                toast.success('Logged out successfully');
              }}
              variant="outline"
              className="flex items-center gap-1 border-gray-300 text-gray-700 hover:text-red-600"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden md:inline">Logout</span>
            </Button>
          </div>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="container mx-auto px-6 py-8">
        
        {/* SEARCH + FILTERS */}
        <div className="mb-8 space-y-4">
          <div className="flex flex-col lg:flex-row gap-4">

            {/* Brand Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  type="text"
                  value={brandName}
                  onChange={(e) => setBrandName(e.target.value)}
                  placeholder="Search brand (e.g., Tesla, Apple, Google)..."
                  className="pl-12 h-12 border-gray-300 bg-white shadow-sm text-gray-900"
                />
              </div>
            </div>

            {/* Time Range */}
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-full lg:w-[200px] px-6 h-12 bg-white border-gray-300 shadow-sm">
                <Clock className="w-4 h-4 mr-2 text-gray-500" />
                <SelectValue placeholder="Select time range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1h">Last Hour</SelectItem>
                <SelectItem value="24h">Last 24 Hours</SelectItem>
                <SelectItem value="7d">Last 7 Days</SelectItem>
                <SelectItem value="30d">Last 30 Days</SelectItem>
              </SelectContent>
            </Select>

            {/* Sentiment Filter */}
            <Select value={filterSentiment} onValueChange={setFilterSentiment}>
              <SelectTrigger className="w-full lg:w-[200px] px-6 h-12 bg-white border-gray-300 shadow-sm">
                <Filter className="w-4 h-4 mr-2 text-gray-500" />
                <SelectValue placeholder="Filter sentiment" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sentiments</SelectItem>
                <SelectItem value="positive">Positive Only</SelectItem>
                <SelectItem value="negative">Negative Only</SelectItem>
                <SelectItem value="neutral">Neutral Only</SelectItem>
              </SelectContent>
            </Select>

            {/* Refresh */}
            <Button
              onClick={fetchData}
              disabled={loading}
              className="h-9 px-6 bg-linear-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-sm"
            >
              <RefreshCw className={`w-5 h-5 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>

          {/* Quick Brand Switcher */}
          {user?.brands && user.brands.length > 1 && (
            <div className="flex gap-2 flex-wrap items-center">
              <p className="text-gray-600 text-sm font-medium">Quick switch:</p>
              {user.brands.map(brand => (
                <button
                  key={brand}
                  onClick={() => {
                    setBrandName(brand);
                    toast.info(`Switched to ${brand}`);
                  }}
                  className={`px-4 py-1 rounded-lg font-sm transition-all ${
                    brandName === brand
                      ? 'bg-linear-to-r from-indigo-600 to-purple-600 text-white shadow-md'
                      : 'bg-white border border-gray-300 text-gray-700 hover:border-indigo-500 hover:text-indigo-600'
                  }`}
                >
                  {brand}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* STATS CARDS */}
        {stats && <StatsCards stats={stats} loading={loading} />}

        {/* TABS */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-8">

          <TabsList className="bg-white border border-gray-200 p-1 rounded-lg shadow-sm">
            <TabsTrigger value="overview" className="data-[state=active]:bg-linear-to-r data-[state=active]:from-indigo-600 data-[state=active]:to-purple-600 data-[state=active]:text-white">
              <Activity className="w-4 h-4 mr-2" />
              Overview
            </TabsTrigger>

            <TabsTrigger value="mentions" className="data-[state=active]:bg-linear-to-r data-[state=active]:from-indigo-600 data-[state=active]:to-purple-600 data-[state=active]:text-white">
              <MessageSquare className="w-4 h-4 mr-2" />
              Mentions
            </TabsTrigger>

            <TabsTrigger value="analytics" className="data-[state=active]:bg-linear-to-r data-[state=active]:from-indigo-600 data-[state=active]:to-purple-600 data-[state=active]:text-white">
              <TrendingUp className="w-4 h-4 mr-2" />
              Analytics
            </TabsTrigger>
          </TabsList>

          {/* OVERVIEW */}
          <TabsContent value="overview" className="mt-6 space-y-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-indigo-600" />
                Analytics Overview
              </h2>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <TimelineChart data={timeline} loading={loading} />
                <SentimentChart stats={stats} loading={loading} />
                <TopicsChart mentions={mentions} loading={loading} />
                <SourcesChart mentions={mentions} loading={loading} />
              </div>
            </div>

            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-indigo-600" />
                Recent Mentions
              </h2>

              <MentionsFeed
                mentions={mentions}
                filterSentiment={filterSentiment}
                loading={loading}
              />
            </div>
          </TabsContent>

          {/* MENTIONS */}
          <TabsContent value="mentions" className="mt-6">
            <MentionsFeed mentions={mentions} filterSentiment={filterSentiment} loading={loading} />
          </TabsContent>

          {/* ANALYTICS */}
          <TabsContent value="analytics" className="mt-6 space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <TimelineChart data={timeline} loading={loading} />
              <SentimentChart stats={stats} loading={loading} />
              <TopicsChart mentions={mentions} loading={loading} />
              <SourcesChart mentions={mentions} loading={loading} />
            </div>
          </TabsContent>

        </Tabs>
      </main>
    </div>
  );
}
