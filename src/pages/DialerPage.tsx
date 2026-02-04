// src/pages/DialerPage.tsx
import { useState, useEffect, useRef, useCallback, type ChangeEvent } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import {
  Phone,
  PhoneOff,
  Pause,
  Play,
  SkipForward,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Clock,
  User,
  MapPin,
  Home,
  MessageSquare,
  Sparkles,
  ChevronRight,
  CheckCircle,
  XCircle,
  Calendar,
  PhoneForwarded,
  Loader2,
  AlertCircle,
  Settings,
} from 'lucide-react';
import { DialerSettings } from '@/components/dialer/DialerSettings';
import { CallOutcomeSelector } from '@/components/dialer/CallOutcomeSelector';
import { AICallAssistant } from '@/components/dialer/AICallAssistant';
import { LeadQueue } from '@/components/dialer/LeadQueue';
import { CallHistory } from '@/components/dialer/CallHistory';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';

export type DialerStatus = 'idle' | 'dialing' | 'ringing' | 'in-call' | 'wrap-up' | 'paused';
export type CallOutcome = 'interested' | 'callback' | 'not_interested' | 'no_answer' | 'busy' | 'wrong_number' | 'appointment';

interface Contact {
  id: string;
  name: string;
  phone: string;
  address?: string;
  property_type?: string;
  estimated_value?: number;
  notes?: string;
  call_status?: string;
  last_call_at?: string;
  call_attempts?: number;
  temperature?: 'hot' | 'warm' | 'cold';
  campaign_id?: string;
}

interface CallSession {
  id?: string;
  contactId: string;
  startTime: Date;
  endTime?: Date;
  duration?: number;
  outcome?: CallOutcome;
  notes?: string;
}

export default function DialerPage() {
  const { profile } = useAuth();

  // Dialer state
  const [status, setStatus] = useState<DialerStatus>('idle');
  const [isPaused, setIsPaused] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);

  // Queue state
  const [queue, setQueue] = useState<Contact[]>([]);
  const [currentContact, setCurrentContact] = useState<Contact | null>(null);
  const [queueIndex, setQueueIndex] = useState(0);

  // Call state
  const [callSession, setCallSession] = useState<CallSession | null>(null);
  const [callDuration, setCallDuration] = useState(0);
  const [callNotes, setCallNotes] = useState('');
  const [selectedOutcome, setSelectedOutcome] = useState<CallOutcome | null>(null);

  // UI state
  const [showSettings, setShowSettings] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [loading, setLoading] = useState(false);
  const [campaignId, setCampaignId] = useState<string | null>(null);

  // Refs
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const dialTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Load queue on mount
  useEffect(() => {
    if (profile) {
      loadQueue();
    }
  }, [profile, campaignId]);

  // Call timer
  useEffect(() => {
    if (status === 'in-call') {
      timerRef.current = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [status]);

  async function loadQueue() {
    if (!profile || !supabase) return;

    setLoading(true);
    try {
      let query = supabase
        .from('contacts')
        .select('*')
        .eq('organization_id', profile.organization_id)
        .in('call_status', ['new', 'callback', 'no_answer'])
        .order('priority', { ascending: false })
        .order('last_call_at', { ascending: true, nullsFirst: true })
        .limit(50);

      if (campaignId) {
        query = query.eq('campaign_id', campaignId);
      }

      const { data, error } = await query;

      if (error) throw error;

      setQueue(data || []);
      if (data && data.length > 0 && !currentContact) {
        setCurrentContact(data[0]);
        setQueueIndex(0);
      }
    } catch (error) {
      console.error('Error loading queue:', error);
      toast.error('Errore nel caricamento della coda');
    } finally {
      setLoading(false);
    }
  }

  const formatDuration = useCallback((seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }, []);

  async function startCall() {
    if (!currentContact || !profile || !supabase) return;

    setStatus('dialing');
    setCallDuration(0);
    setCallNotes('');
    setSelectedOutcome(null);

    // Create call session
    const session: CallSession = {
      contactId: currentContact.id,
      startTime: new Date(),
    };
    setCallSession(session);

    // Simulate dialing (replace with actual Twilio integration)
    dialTimeoutRef.current = setTimeout(() => {
      // Simulate connection (in production, this would be Twilio callback)
      const connected = Math.random() > 0.3; // 70% connection rate for demo

      if (connected) {
        setStatus('in-call');
        toast.success(`Connesso con ${currentContact.name}`);
      } else {
        setStatus('wrap-up');
        setSelectedOutcome('no_answer');
        toast.info('Nessuna risposta');
      }
    }, 3000);
  }

  async function endCall(autoAdvance: boolean = false) {
    if (dialTimeoutRef.current) {
      clearTimeout(dialTimeoutRef.current);
    }

    const wasInCall = status === 'in-call';
    setStatus('wrap-up');

    if (callSession) {
      setCallSession({
        ...callSession,
        endTime: new Date(),
        duration: callDuration,
      });
    }

    // If no outcome selected and was in call, wait for selection
    if (wasInCall && !selectedOutcome && !autoAdvance) {
      // Stay in wrap-up mode
      return;
    }
  }

  async function saveCallAndAdvance() {
    if (!currentContact || !profile || !supabase) return;

    if (!selectedOutcome) {
      toast.error('Seleziona un esito per la chiamata');
      return;
    }

    setLoading(true);
    try {
      // Save call log
      const { error: callError } = await supabase.from('calls').insert({
        organization_id: profile.organization_id,
        contact_id: currentContact.id,
        agent_id: profile.id,
        campaign_id: currentContact.campaign_id,
        direction: 'outbound',
        status: 'completed',
        outcome: selectedOutcome,
        duration_seconds: callDuration,
        notes: callNotes,
        started_at: callSession?.startTime.toISOString(),
        ended_at: new Date().toISOString(),
      });

      if (callError) throw callError;

      // Update contact status
      const newStatus = selectedOutcome === 'appointment' ? 'appointment_booked' :
                       selectedOutcome === 'interested' ? 'qualified' :
                       selectedOutcome === 'not_interested' ? 'disqualified' :
                       selectedOutcome === 'wrong_number' ? 'invalid' :
                       selectedOutcome;

      const { error: contactError } = await supabase
        .from('contacts')
        .update({
          call_status: newStatus,
          last_call_at: new Date().toISOString(),
          call_attempts: (currentContact.call_attempts || 0) + 1,
        })
        .eq('id', currentContact.id);

      if (contactError) throw contactError;

      toast.success('Chiamata salvata');

      // Advance to next contact
      advanceToNext();
    } catch (error) {
      console.error('Error saving call:', error);
      toast.error('Errore nel salvataggio');
    } finally {
      setLoading(false);
    }
  }

  function advanceToNext() {
    const nextIndex = queueIndex + 1;

    if (nextIndex < queue.length) {
      setQueueIndex(nextIndex);
      setCurrentContact(queue[nextIndex]);
      setStatus(isPaused ? 'paused' : 'idle');
      setCallSession(null);
      setCallDuration(0);
      setCallNotes('');
      setSelectedOutcome(null);

      // Auto-dial if not paused
      if (!isPaused) {
        setTimeout(() => startCall(), 2000);
      }
    } else {
      // Queue empty
      setStatus('idle');
      setCurrentContact(null);
      toast.info('Coda completata! Ricarica per nuovi contatti.');
      loadQueue();
    }
  }

  function skipContact() {
    if (status === 'dialing' || status === 'in-call') {
      endCall(true);
    }
    advanceToNext();
  }

  function togglePause() {
    if (isPaused) {
      setIsPaused(false);
      setStatus('idle');
      if (currentContact) {
        setTimeout(() => startCall(), 1000);
      }
    } else {
      setIsPaused(true);
      setStatus('paused');
      if (dialTimeoutRef.current) {
        clearTimeout(dialTimeoutRef.current);
      }
    }
  }

  function toggleMute() {
    setIsMuted(!isMuted);
    // In production: twilioDevice?.activeConnection()?.mute(!isMuted)
  }

  function selectContactFromQueue(contact: Contact, index: number) {
    if (status === 'in-call' || status === 'dialing') {
      toast.error('Termina la chiamata corrente prima');
      return;
    }

    setCurrentContact(contact);
    setQueueIndex(index);
    setStatus('idle');
    setCallSession(null);
    setCallDuration(0);
  }

  const getTemperatureColor = (temp?: string) => {
    switch (temp) {
      case 'hot': return 'bg-red-100 text-red-800 border-red-200';
      case 'warm': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'cold': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Power Dialer</h1>
          <p className="text-gray-600 mt-1">
            {queue.length} contatti in coda
            {currentContact && ` • Posizione ${queueIndex + 1}/${queue.length}`}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowHistory(true)}>
            <Clock className="w-4 h-4 mr-2" />
            Storico
          </Button>
          <Button variant="outline" onClick={() => setShowSettings(true)}>
            <Settings className="w-4 h-4 mr-2" />
            Impostazioni
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Dialer Panel */}
        <div className="lg:col-span-2 space-y-6">
          {/* Call Control Card */}
          <Card>
            <CardContent className="p-8">
              <div className="text-center space-y-6">
                {/* Status Display */}
                <div>
                  {status === 'in-call' && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-center gap-2">
                        <span className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                        <span className="text-lg font-medium text-green-600">
                          In Chiamata
                        </span>
                      </div>
                      <div className="flex items-center justify-center text-4xl font-mono text-gray-900">
                        <Clock className="h-8 w-8 mr-3 text-gray-400" />
                        {formatDuration(callDuration)}
                      </div>
                    </div>
                  )}

                  {status === 'dialing' && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-center gap-2">
                        <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
                        <span className="text-lg font-medium text-blue-600">
                          Composizione in corso...
                        </span>
                      </div>
                      <p className="text-gray-500">{currentContact?.phone}</p>
                    </div>
                  )}

                  {status === 'ringing' && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-center gap-2">
                        <Phone className="w-5 h-5 text-amber-500 animate-bounce" />
                        <span className="text-lg font-medium text-amber-600">
                          Squilla...
                        </span>
                      </div>
                    </div>
                  )}

                  {status === 'wrap-up' && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-center gap-2">
                        <MessageSquare className="w-5 h-5 text-purple-500" />
                        <span className="text-lg font-medium text-purple-600">
                          Riepilogo Chiamata
                        </span>
                      </div>
                      <p className="text-gray-500">
                        Durata: {formatDuration(callDuration)}
                      </p>
                    </div>
                  )}

                  {status === 'paused' && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-center gap-2">
                        <Pause className="w-5 h-5 text-amber-500" />
                        <span className="text-lg font-medium text-amber-600">
                          Dialer in Pausa
                        </span>
                      </div>
                      <p className="text-gray-500">Premi play per riprendere</p>
                    </div>
                  )}

                  {status === 'idle' && !currentContact && (
                    <div className="space-y-2">
                      <AlertCircle className="w-12 h-12 mx-auto text-gray-300" />
                      <p className="text-gray-500">Nessun contatto in coda</p>
                      <Button onClick={loadQueue} variant="outline">
                        Ricarica Coda
                      </Button>
                    </div>
                  )}

                  {status === 'idle' && currentContact && (
                    <div className="space-y-2">
                      <p className="text-lg text-gray-600">Pronto per chiamare</p>
                      <p className="text-2xl font-semibold">{currentContact.name}</p>
                    </div>
                  )}
                </div>

                {/* Call Controls */}
                {currentContact && (
                  <div className="flex items-center justify-center gap-4">
                    {/* Mute Button */}
                    {status === 'in-call' && (
                      <button
                        onClick={toggleMute}
                        className={`flex items-center justify-center w-14 h-14 rounded-full transition-colors ${
                          isMuted
                            ? 'bg-red-100 text-red-600 hover:bg-red-200'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
                      </button>
                    )}

                    {/* Main Call Button */}
                    {(status === 'idle' || status === 'paused') && (
                      <button
                        onClick={startCall}
                        disabled={isPaused || loading}
                        className="flex items-center justify-center w-20 h-20 bg-green-500 text-white rounded-full hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                      >
                        <Phone className="w-10 h-10" />
                      </button>
                    )}

                    {(status === 'dialing' || status === 'in-call') && (
                      <button
                        onClick={() => endCall()}
                        className="flex items-center justify-center w-20 h-20 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-lg"
                      >
                        <PhoneOff className="w-10 h-10" />
                      </button>
                    )}

                    {status === 'wrap-up' && (
                      <button
                        onClick={saveCallAndAdvance}
                        disabled={!selectedOutcome || loading}
                        className="flex items-center justify-center w-20 h-20 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                      >
                        {loading ? (
                          <Loader2 className="w-10 h-10 animate-spin" />
                        ) : (
                          <ChevronRight className="w-10 h-10" />
                        )}
                      </button>
                    )}

                    {/* Speaker Button */}
                    {status === 'in-call' && (
                      <button
                        onClick={() => setIsSpeakerOn(!isSpeakerOn)}
                        className={`flex items-center justify-center w-14 h-14 rounded-full transition-colors ${
                          isSpeakerOn
                            ? 'bg-blue-100 text-blue-600 hover:bg-blue-200'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {isSpeakerOn ? <Volume2 className="w-6 h-6" /> : <VolumeX className="w-6 h-6" />}
                      </button>
                    )}
                  </div>
                )}

                {/* Secondary Controls */}
                {currentContact && (
                  <div className="flex items-center justify-center gap-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={togglePause}
                      className={isPaused ? 'bg-amber-50' : ''}
                    >
                      {isPaused ? (
                        <>
                          <Play className="w-4 h-4 mr-2" />
                          Riprendi
                        </>
                      ) : (
                        <>
                          <Pause className="w-4 h-4 mr-2" />
                          Pausa
                        </>
                      )}
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={skipContact}
                      disabled={status === 'in-call'}
                    >
                      <SkipForward className="w-4 h-4 mr-2" />
                      Salta
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Call Outcome & Notes */}
          {(status === 'wrap-up' || status === 'in-call') && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Esito e Note</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <CallOutcomeSelector
                  selected={selectedOutcome}
                  onSelect={setSelectedOutcome}
                  disabled={loading}
                />

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Note della chiamata
                  </label>
                  <textarea
                    value={callNotes}
                    onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setCallNotes(e.target.value)}
                    placeholder="Scrivi le note della chiamata..."
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* AI Assistant */}
          {status === 'in-call' && currentContact && (
            <AICallAssistant contact={currentContact} />
          )}
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          {/* Current Contact Card */}
          {currentContact && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center justify-between">
                  <span>Contatto Corrente</span>
                  {currentContact.temperature && (
                    <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getTemperatureColor(currentContact.temperature)}`}>
                      {currentContact.temperature.toUpperCase()}
                    </span>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <User className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-lg">{currentContact.name}</p>
                    <a
                      href={`tel:${currentContact.phone}`}
                      className="text-blue-600 hover:underline flex items-center gap-1"
                    >
                      <Phone className="w-4 h-4" />
                      {currentContact.phone}
                    </a>
                  </div>
                </div>

                {currentContact.address && (
                  <div className="flex items-start gap-2 text-sm text-gray-600">
                    <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span>{currentContact.address}</span>
                  </div>
                )}

                {currentContact.property_type && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Home className="w-4 h-4" />
                    <span>{currentContact.property_type}</span>
                    {currentContact.estimated_value && (
                      <span className="ml-auto font-medium">
                        €{currentContact.estimated_value.toLocaleString('it-IT')}
                      </span>
                    )}
                  </div>
                )}

                {currentContact.notes && (
                  <div className="p-3 bg-amber-50 rounded-lg border border-amber-100">
                    <p className="text-sm text-amber-800">{currentContact.notes}</p>
                  </div>
                )}

                {currentContact.last_call_at && (
                  <div className="text-xs text-gray-500 pt-2 border-t">
                    Ultima chiamata: {format(new Date(currentContact.last_call_at), "d MMM yyyy 'alle' HH:mm", { locale: it })}
                    {currentContact.call_attempts && (
                      <span className="ml-2">• {currentContact.call_attempts} tentativi</span>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Queue Preview */}
          <LeadQueue
            queue={queue}
            currentIndex={queueIndex}
            onSelect={selectContactFromQueue}
            loading={loading}
          />
        </div>
      </div>

      {/* Modals */}
      <DialerSettings
        open={showSettings}
        onOpenChange={setShowSettings}
        campaignId={campaignId}
        onCampaignChange={setCampaignId}
      />

      <CallHistory
        open={showHistory}
        onOpenChange={setShowHistory}
      />
    </div>
  );
}
