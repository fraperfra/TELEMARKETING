import { useState, useEffect, type ChangeEvent } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface DialerSettingsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  campaignId: string | null;
  onCampaignChange: (id: string | null) => void;
}

interface Campaign {
  id: string;
  name: string;
  status: string;
  contacts_count?: number;
}

export function DialerSettings({
  open,
  onOpenChange,
  campaignId,
  onCampaignChange,
}: DialerSettingsProps) {
  const { profile } = useAuth();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(false);

  // Local settings state
  const [settings, setSettings] = useState({
    autoAdvance: true,
    autoAdvanceDelay: 2,
    playDialTone: true,
    maxAttempts: 3,
    callTimeout: 30,
  });

  useEffect(() => {
    if (open && profile) {
      loadCampaigns();
      loadSettings();
    }
  }, [open, profile]);

  async function loadCampaigns() {
    if (!profile || !supabase) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('campaigns')
        .select('id, name, status')
        .eq('organization_id', profile.organization_id)
        .in('status', ['active', 'paused'])
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCampaigns(data || []);
    } catch (error) {
      console.error('Error loading campaigns:', error);
    } finally {
      setLoading(false);
    }
  }

  async function loadSettings() {
    // Load from localStorage for now
    const saved = localStorage.getItem('dialer_settings');
    if (saved) {
      try {
        setSettings(JSON.parse(saved));
      } catch {
        // Use defaults
      }
    }
  }

  function saveSettings() {
    localStorage.setItem('dialer_settings', JSON.stringify(settings));
    toast.success('Impostazioni salvate');
    onOpenChange(false);
  }

  const handleSettingChange = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 z-50" />
        <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-lg w-full max-w-md z-50 max-h-[90vh] overflow-y-auto">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <Dialog.Title className="text-xl font-semibold">
                Impostazioni Dialer
              </Dialog.Title>
              <Dialog.Close asChild>
                <button className="p-2 hover:bg-gray-100 rounded-full">
                  <X className="w-5 h-5" />
                </button>
              </Dialog.Close>
            </div>

            <div className="space-y-6">
              {/* Campaign Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Campagna
                </label>
                {loading ? (
                  <div className="flex items-center gap-2 text-gray-500">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Caricamento...
                  </div>
                ) : (
                  <select
                    value={campaignId || ''}
                    onChange={(e: ChangeEvent<HTMLSelectElement>) => onCampaignChange(e.target.value || null)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Tutti i contatti</option>
                    {campaigns.map((campaign) => (
                      <option key={campaign.id} value={campaign.id}>
                        {campaign.name}
                        {campaign.status === 'paused' && ' (In pausa)'}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Auto Advance */}
              <div>
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-700">
                    Avanzamento automatico
                  </label>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.autoAdvance}
                      onChange={(e: ChangeEvent<HTMLInputElement>) => handleSettingChange('autoAdvance', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Passa automaticamente al contatto successivo dopo il salvataggio
                </p>
              </div>

              {/* Auto Advance Delay */}
              {settings.autoAdvance && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ritardo avanzamento (secondi)
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={10}
                    value={settings.autoAdvanceDelay}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => handleSettingChange('autoAdvanceDelay', parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              )}

              {/* Call Timeout */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Timeout chiamata (secondi)
                </label>
                <input
                  type="number"
                  min={10}
                  max={120}
                  value={settings.callTimeout}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => handleSettingChange('callTimeout', parseInt(e.target.value) || 30)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Tempo massimo di attesa prima di considerare "non risponde"
                </p>
              </div>

              {/* Max Attempts */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tentativi massimi per contatto
                </label>
                <select
                  value={settings.maxAttempts}
                  onChange={(e: ChangeEvent<HTMLSelectElement>) => handleSettingChange('maxAttempts', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value={1}>1 tentativo</option>
                  <option value={2}>2 tentativi</option>
                  <option value={3}>3 tentativi</option>
                  <option value={5}>5 tentativi</option>
                  <option value={10}>10 tentativi</option>
                </select>
              </div>

              {/* Dial Tone */}
              <div>
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-700">
                    Suono di composizione
                  </label>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.playDialTone}
                      onChange={(e: ChangeEvent<HTMLInputElement>) => handleSettingChange('playDialTone', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Riproduci il suono durante la composizione
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 mt-8 pt-4 border-t">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Annulla
              </Button>
              <Button onClick={saveSettings}>
                Salva Impostazioni
              </Button>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
