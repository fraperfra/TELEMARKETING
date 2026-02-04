import { useState } from 'react';
import {
  Plus,
  Play,
  Pause,
  MoreVertical,
  Users,
  Phone,
  Calendar,
} from 'lucide-react';

interface Campaign {
  id: string;
  name: string;
  status: 'draft' | 'active' | 'paused' | 'completed';
  leadsCount: number;
  callsMade: number;
  appointmentsBooked: number;
  startDate: string;
  endDate?: string;
}

const mockCampaigns: Campaign[] = [
  {
    id: '1',
    name: 'Campagna Gennaio 2024',
    status: 'active',
    leadsCount: 450,
    callsMade: 234,
    appointmentsBooked: 12,
    startDate: '2024-01-01',
  },
  {
    id: '2',
    name: 'Lead Zona Nord',
    status: 'paused',
    leadsCount: 180,
    callsMade: 89,
    appointmentsBooked: 5,
    startDate: '2024-01-15',
  },
  {
    id: '3',
    name: 'Recupero Contatti',
    status: 'draft',
    leadsCount: 320,
    callsMade: 0,
    appointmentsBooked: 0,
    startDate: '2024-02-01',
  },
];

const statusColors = {
  draft: 'bg-gray-100 text-gray-800',
  active: 'bg-green-100 text-green-800',
  paused: 'bg-yellow-100 text-yellow-800',
  completed: 'bg-blue-100 text-blue-800',
};

const statusLabels = {
  draft: 'Bozza',
  active: 'Attiva',
  paused: 'In Pausa',
  completed: 'Completata',
};

export default function CampaignsPage() {
  const [campaigns] = useState<Campaign[]>(mockCampaigns);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Campagne</h1>
          <p className="text-gray-500">Gestisci le tue campagne di telemarketing</p>
        </div>
        <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          <Plus className="h-5 w-5 mr-2" />
          Nuova Campagna
        </button>
      </div>

      {/* Campaigns Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-3">
        {campaigns.map((campaign) => (
          <div
            key={campaign.id}
            className="bg-white rounded-lg shadow hover:shadow-md transition-shadow"
          >
            <div className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {campaign.name}
                  </h3>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mt-2 ${
                      statusColors[campaign.status]
                    }`}
                  >
                    {statusLabels[campaign.status]}
                  </span>
                </div>
                <button className="p-1 text-gray-400 hover:text-gray-600 rounded">
                  <MoreVertical className="h-5 w-5" />
                </button>
              </div>

              <div className="mt-6 grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="flex items-center justify-center">
                    <Users className="h-4 w-4 text-gray-400 mr-1" />
                    <span className="text-lg font-semibold text-gray-900">
                      {campaign.leadsCount}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">Lead</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center">
                    <Phone className="h-4 w-4 text-gray-400 mr-1" />
                    <span className="text-lg font-semibold text-gray-900">
                      {campaign.callsMade}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">Chiamate</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center">
                    <Calendar className="h-4 w-4 text-gray-400 mr-1" />
                    <span className="text-lg font-semibold text-gray-900">
                      {campaign.appointmentsBooked}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">Appuntamenti</p>
                </div>
              </div>

              <div className="mt-6 flex items-center justify-between pt-4 border-t">
                <span className="text-sm text-gray-500">
                  Iniziata: {new Date(campaign.startDate).toLocaleDateString('it-IT')}
                </span>
                <div className="flex space-x-2">
                  {campaign.status === 'active' ? (
                    <button className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors">
                      <Pause className="h-5 w-5" />
                    </button>
                  ) : campaign.status !== 'completed' ? (
                    <button className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors">
                      <Play className="h-5 w-5" />
                    </button>
                  ) : null}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
