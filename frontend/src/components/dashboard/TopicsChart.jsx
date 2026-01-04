//path: frontend/src/components/dashboard/TopicsChart.jsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export default function TopicsChart({ mentions, loading, onTopicFilter }) {
  if (loading) {
    return (
      <Card className="border border-gray-300 bg-white">
        <CardHeader>
          <CardTitle className="text-black">Topics Mentioned</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center">
            <div className="w-8 h-8 border-4 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const topicCounts = {};
  mentions.forEach((m) => {
    topicCounts[m.topic] = (topicCounts[m.topic] || 0) + 1;
  });

  const data = Object.entries(topicCounts)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);

  return (
   <Card className="bg-linear-to-t from-gray-100/40 to-white border border-gray-200 shadow-sm rounded-xl">

      <CardHeader>
        <CardTitle className="text-black">Top Topics</CardTitle>
      </CardHeader>

      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid stroke="#e5e7eb" /> {/* light gray */}

            <XAxis
              dataKey="name"
              stroke="#374151"
              style={{ fontSize: '12px' }}
            />

            <YAxis
              stroke="#374151"
              style={{ fontSize: '12px' }}
            />

            <Tooltip
              contentStyle={{
                backgroundColor: '#ffffff',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                color: '#000',
              }}
            />

            <Bar
              dataKey="value"
              fill="#4b5563"      // clean gray
              radius={[6, 6, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
