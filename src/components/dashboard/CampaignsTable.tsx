import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface CampaignData {
  id: string;
  name: string;
  status: string;
  leads: number;
  qualified: number;
  appointments: number;
}

export function CampaignsTable({ campaigns }: { campaigns: CampaignData[] }) {
  const chartData = campaigns.slice(0, 5).map((c) => ({
    name: c.name,
    leads: c.leads || 0,
    qualified: c.qualified || 0,
    appointments: c.appointments || 0,
  }));

  if (chartData.length === 0) {
    return <div className="text-center py-8 text-gray-500">Nessuna campagna</div>;
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey="leads" fill="#3b82f6" name="Lead" />
        <Bar dataKey="qualified" fill="#10b981" name="Qualificati" />
        <Bar dataKey="appointments" fill="#8b5cf6" name="Appuntamenti" />
      </BarChart>
    </ResponsiveContainer>
  );
}
