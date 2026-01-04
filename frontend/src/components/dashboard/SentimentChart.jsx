//path: frontend/src/components/dashboard/SentimentChart.jsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

export default function SentimentChart({ stats, loading }) {
  if (loading || !stats) {
    return (
      <Card className="border border-gray-300 bg-white">
        <CardHeader>
          <CardTitle className="text-black">Sentiment Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center">
            <div className="w-8 h-8 border-4 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const data = [
    { name: 'Positive', value: stats.positive, color: '#10b981' }, // green
    { name: 'Negative', value: stats.negative, color: '#ef4444' }, // red
    { name: 'Neutral', value: stats.neutral, color: '#6b7280' },   // gray
  ];

  return (
    <Card className="bg-gradient-to-t from-gray-100/40 to-white border border-gray-200 shadow-sm rounded-xl">

      <CardHeader>
        <CardTitle className="text-black">Sentiment Distribution</CardTitle>
      </CardHeader>

      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              outerRadius={100}
              dataKey="value"
              label={({ name, percent }) =>
                `${name} (${(percent * 100).toFixed(0)}%)`
              }
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>

            <Tooltip
              contentStyle={{
                backgroundColor: '#ffffff',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                color: '#000',
              }}
            />

            <Legend
              verticalAlign="bottom"
              height={36}
              iconType="circle"
              wrapperStyle={{ color: '#374151' }}
            />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
