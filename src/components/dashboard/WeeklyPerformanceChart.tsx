import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';

interface DailyStat {
  date: string;
  calls_made: number;
  leads_qualified: number;
  appointments_booked: number;
  avg_call_score: number;
}

export function WeeklyPerformanceChart({ data }: { data: DailyStat[] }) {
  const chartData = data.map((stat) => ({
    name: format(new Date(stat.date), 'EEE d', { locale: it }),
    chiamate: stat.calls_made,
    qualificati: stat.leads_qualified,
    appuntamenti: stat.appointments_booked,
  }));

  if (chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        Nessun dato disponibile
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey="chiamate" fill="#3b82f6" name="Chiamate" />
        <Bar dataKey="qualificati" fill="#10b981" name="Qualificati" />
        <Bar dataKey="appuntamenti" fill="#8b5cf6" name="Appuntamenti" />
      </BarChart>
    </ResponsiveContainer>
  );
}
