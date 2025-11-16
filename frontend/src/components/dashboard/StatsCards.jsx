// src/components/dashboard/StatsCards.jsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  TrendingUp,
  MessageSquare,
  AlertCircle,
  Eye,
} from "lucide-react";
import { formatNumber } from "@/lib/utils";

export default function StatsCards({ stats, loading }) {
  // Professional loading skeleton
  if (loading || !stats) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[1, 2, 3, 4].map((i) => (
          <Card 
            key={i} 
            className="bg-white border border-gray-200"
          >
            <CardContent className="p-6">
              <div className="space-y-4 animate-pulse">
                <div className="flex justify-between">
                  <div className="h-4 bg-gray-100 rounded w-28"></div>
                  <div className="w-10 h-10 bg-gray-100 rounded"></div>
                </div>
                <div className="h-10 bg-gray-100 rounded w-24"></div>
                <div className="h-3 bg-gray-100 rounded w-36"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const cards = [
    {
      title: "Total Mentions",
      value: stats.total,
      subtitle: "Across all platforms",
      icon: MessageSquare,
      color: "text-slate-600",
    },
    {
      title: "Positive Sentiment",
      value: stats.positive,
      subtitle: `${((stats.positive / stats.total) * 100).toFixed(1)}% of total`,
      icon: TrendingUp,
      color: "text-emerald-600",
    },
    {
      title: "Negative Sentiment",
      value: stats.negative,
      subtitle: `${((stats.negative / stats.total) * 100).toFixed(1)}% of total`,
      icon: AlertCircle,
      color: "text-rose-600",
    },
    {
      title: "Total Reach",
      value: formatNumber(stats.totalReach),
      subtitle: "People reached",
      icon: Eye,
      color: "text-indigo-600",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {cards.map((card, i) => (
        <Card
          key={i}
          className="bg-gradient-to-t from-gray-100/40 to-white border border-gray-200 hover:border-gray-300 transition-colors"
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">
              {card.title}
            </CardTitle>
            <card.icon className={`h-5 w-5 ${card.color}`} />
          </CardHeader>
          
          <CardContent>
            <div className="text-3xl font-semibold text-gray-900 mb-1">
              {card.value}
            </div>
            <p className="text-sm text-gray-500">
              {card.subtitle}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}