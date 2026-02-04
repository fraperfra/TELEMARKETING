import { useState, type FormEvent, type ChangeEvent } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import {
  User,
  Building,
  Bell,
  Shield,
  CreditCard,
  Users,
  Save,
} from 'lucide-react';

const tabs = [
  { id: 'profile', name: 'Profilo', icon: User },
  { id: 'organization', name: 'Organizzazione', icon: Building },
  { id: 'team', name: 'Team', icon: Users },
  { id: 'notifications', name: 'Notifiche', icon: Bell },
  { id: 'security', name: 'Sicurezza', icon: Shield },
  { id: 'billing', name: 'Fatturazione', icon: CreditCard },
];

export default function SettingsPage() {
  const { profile, organization } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [formData, setFormData] = useState({
    name: profile?.name || '',
    email: profile?.email || '',
    phone: profile?.phone || '',
  });

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // TODO: Save settings
    console.log('Saving:', formData);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Impostazioni</h1>
        <p className="text-gray-500">Gestisci il tuo account e le preferenze</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar Tabs */}
        <div className="lg:w-64 flex-shrink-0">
          <nav className="bg-white rounded-lg shadow p-2 space-y-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  activeTab === tab.id
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <tab.icon className="h-5 w-5 mr-3" />
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1">
          <div className="bg-white rounded-lg shadow">
            {activeTab === 'profile' && (
              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                <h2 className="text-lg font-semibold text-gray-900">
                  Informazioni Profilo
                </h2>

                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Nome Completo
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Telefono
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Ruolo
                    </label>
                    <input
                      type="text"
                      value={
                        profile?.role === 'owner'
                          ? 'Amministratore'
                          : profile?.role === 'team_leader'
                          ? 'Team Leader'
                          : 'Agente'
                      }
                      disabled
                      className="mt-1 block w-full px-3 py-2 border border-gray-200 rounded-md bg-gray-50 text-gray-500"
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Save className="h-5 w-5 mr-2" />
                    Salva Modifiche
                  </button>
                </div>
              </form>
            )}

            {activeTab === 'organization' && (
              <div className="p-6 space-y-6">
                <h2 className="text-lg font-semibold text-gray-900">
                  Organizzazione
                </h2>

                <div className="space-y-4">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">
                          {organization?.name}
                        </p>
                        <p className="text-sm text-gray-500">
                          Piano: {organization?.plan?.toUpperCase()}
                        </p>
                      </div>
                      <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                        Attivo
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 border rounded-lg">
                      <p className="text-2xl font-bold text-gray-900">
                        {organization?.seats_used || 0}
                      </p>
                      <p className="text-sm text-gray-500">
                        di {organization?.seats_total || 0} utenti
                      </p>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <p className="text-2xl font-bold text-gray-900">
                        {new Date(organization?.created_at || '').toLocaleDateString('it-IT')}
                      </p>
                      <p className="text-sm text-gray-500">Data creazione</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'team' && (
              <div className="p-6 space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900">
                    Membri del Team
                  </h2>
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                    Invita Membro
                  </button>
                </div>

                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <User className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            Utente {i}
                          </p>
                          <p className="text-sm text-gray-500">
                            utente{i}@esempio.it
                          </p>
                        </div>
                      </div>
                      <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded">
                        Agente
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {(activeTab === 'notifications' ||
              activeTab === 'security' ||
              activeTab === 'billing') && (
              <div className="p-6">
                <div className="text-center py-12">
                  <p className="text-gray-500">
                    Sezione in costruzione
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
