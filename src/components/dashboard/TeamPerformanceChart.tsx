import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface TeamData {
  name: string;
  color: string;
  calls: number;
  qualified: number;
  appointments: number;
}

export function TeamPerformanceChart({ data }: { data: TeamData[] }) {
  const chartData = data.map((t) => ({
    name: t.name,
    calls: t.calls || 0,
    qualified: t.qualified || 0,
    appointments: t.appointments || 0,
  }));

  if (chartData.length === 0) {
    return <div className="text-center py-8 text-gray-500">Nessun dato disponibile</div>;
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey="calls" fill="#3b82f6" name="Chiamate" />
        <Bar dataKey="qualified" fill="#10b981" name="Qualificati" />
        <Bar dataKey="appointments" fill="#8b5cf6" name="Appuntamenti" />
      </BarChart>
    </ResponsiveContainer>
  );
}
