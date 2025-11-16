import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function SourcesChart({ mentions, loading }) {
  if (loading) {
    return (
      <Card className="border border-gray-300 bg-white">
        <CardHeader>
          <CardTitle className="text-black">Source Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center">
            <div className="w-8 h-8 border-4 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const sourceCounts = {};
  mentions.forEach(m => {
    sourceCounts[m.source] = (sourceCounts[m.source] || 0) + 1;
  });

  const data = Object.entries(sourceCounts)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

  return (
    <Card className="bg-linear-to-t from-gray-100/40 to-white border border-gray-200  rounded-xl hover:border-purple-500/30 transition-all shadow-sm">
      <CardHeader>
        <CardTitle className="text-black">Source Distribution</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="#d1d5db" />
            <XAxis type="number" stroke="#374151" style={{ fontSize: '12px' }} />
            <YAxis 
              dataKey="name" 
              type="category" 
              stroke="#374151"
              style={{ fontSize: '12px' }}
              width={80}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#ffffff', 
                border: '1px solid #d1d5db', 
                borderRadius: '6px', 
                color: '#000'
              }}
              cursor={{ fill: 'rgba(6, 182, 212, 0.1)' }}
            />
            <Bar 
              dataKey="value" 
              fill="url(#sourceGradient)"
              radius={[0, 8, 8, 0]}
            />
            <defs>
              <linearGradient id="sourceGradient" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#06b6d4" stopOpacity={1} />
                <stop offset="100%" stopColor="#0891b2" stopOpacity={0.8} />
              </linearGradient>
            </defs>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
