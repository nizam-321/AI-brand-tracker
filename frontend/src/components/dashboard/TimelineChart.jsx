import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Brush } from 'recharts';

export default function TimelineChart({ data, loading }) {
  if (loading) {
    return (
      <Card className="border border-gray-300 bg-white">
        <CardHeader>
          <CardTitle className="text-black">Mentions Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center">
            {/* Simple Loader */}
            <div className="w-8 h-8 border-4 border-gray-400 border-t-transparent rounded-full animate-spin" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const formattedData = data.map((item) => ({
    time: item._id,
    total: item.total,
    positive: item.positive,
    negative: item.negative,
  }));

  return (
    <Card className="bg-linear-to-t from-gray-100/40 to-white border border-gray-200 shadow-sm rounded-xl">
      <CardHeader>
        <CardTitle className="text-black">Mentions Timeline</CardTitle>
      </CardHeader>

      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={formattedData}>
            <CartesianGrid stroke="#e5e7eb" /> {/* Light gray grid */}

            <XAxis
              dataKey="time"
              stroke="#374151"     // Blackish text
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

            <Legend wrapperStyle={{ color: '#000' }} />

            {/* Zoom/Pan Brush */}
            <Brush
              dataKey="time"
              height={30}
              stroke="#4f46e5"
              fill="#f3f4f6"
            />

            {/* Lines */}
            <Line
              type="monotone"
              dataKey="total"
              stroke="#4f46e5"       // Indigo
              strokeWidth={2}
              dot={{ r: 3, fill: '#4f46e5' }}
              name="Total"
            />

            <Line
              type="monotone"
              dataKey="positive"
              stroke="#16a34a"      // Green
              strokeWidth={2}
              dot={{ r: 3, fill: '#16a34a' }}
              name="Positive"
            />

            <Line
              type="monotone"
              dataKey="negative"
              stroke="#dc2626"      // Red
              strokeWidth={2}
              dot={{ r: 3, fill: '#dc2626' }}
              name="Negative"
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
