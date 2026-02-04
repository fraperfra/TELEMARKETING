import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface CallData {
  date: string;
  calls: number;
  qualified: number;
  appointments: number;
}

export function CallsChart({ data }: { data: CallData[] }) {
  if (data.length === 0) {
    return <div className="text-center py-8 text-gray-500">Nessun dato disponibile</div>;
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Line type="monotone" dataKey="calls" stroke="#3b82f6" name="Chiamate" />
        <Line type="monotone" dataKey="qualified" stroke="#10b981" name="Qualificati" />
      </LineChart>
    </ResponsiveContainer>
  );
}
