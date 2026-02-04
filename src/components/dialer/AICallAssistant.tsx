import { useState, type ChangeEvent } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sparkles, Loader2, Copy, Check, MessageSquare, AlertCircle, Lightbulb } from 'lucide-react';
import { generateCallScript, handleObjection } from '@/lib/ai';
import { toast } from 'sonner';

interface Contact {
  id: string;
  name: string;
  phone: string;
  address?: string;
  property_type?: string;
  estimated_value?: number;
  notes?: string;
}

interface AICallAssistantProps {
  contact: Contact;
}

export function AICallAssistant({ contact }: AICallAssistantProps) {
  const [loading, setLoading] = useState(false);
  const [script, setScript] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [objectionInput, setObjectionInput] = useState('');
  const [objectionResponse, setObjectionResponse] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleGenerateScript = async () => {
    setLoading(true);
    try {
      const propertyInfo = [
        contact.property_type,
        contact.address,
        contact.estimated_value ? `€${contact.estimated_value.toLocaleString('it-IT')}` : null,
      ]
        .filter(Boolean)
        .join(' - ');

      const result = await generateCallScript(
        contact.name,
        propertyInfo || 'Immobile',
        contact.notes
      );

      if (result.success && result.data) {
        setScript(result.data);
      } else {
        toast.error(result.error || 'Errore nella generazione');
      }
    } catch (error) {
      toast.error('Errore nella generazione dello script');
    } finally {
      setLoading(false);
    }
  };

  const handleObjectionSubmit = async () => {
    if (!objectionInput.trim()) return;

    setLoading(true);
    try {
      const result = await handleObjection(objectionInput);

      if (result.success && result.data) {
        setObjectionResponse(result.data);
        setObjectionInput('');
      } else {
        toast.error(result.error || 'Errore nella risposta');
      }
    } catch (error) {
      toast.error('Errore nella gestione obiezione');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast.success('Copiato negli appunti');
    } catch {
      toast.error('Errore nella copia');
    }
  };

  // Quick suggestions based on common scenarios
  const quickSuggestions = [
    {
      trigger: 'Non ho tempo',
      response: 'Capisco perfettamente, posso richiamarla in un momento piu comodo? Quando preferisce?',
    },
    {
      trigger: 'Non mi interessa',
      response: 'Comprendo. Posso chiederle se ha gia una valutazione recente del suo immobile? Potrebbe esserle utile per il futuro.',
    },
    {
      trigger: 'Gia contattato',
      response: 'Mi scusi per il disturbo. Ha avuto modo di valutare la nostra proposta precedente?',
    },
    {
      trigger: 'Prezzo troppo basso',
      response: 'La capisco. La nostra valutazione e basata su dati di mercato attuali. Possiamo fissare un incontro per mostrarle i dettagli?',
    },
  ];

  return (
    <Card className="border-purple-200 bg-purple-50/50">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2 text-purple-900">
          <Sparkles className="w-5 h-5 text-purple-600" />
          Assistente AI
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Generate Script Button */}
        {!script && (
          <Button
            onClick={handleGenerateScript}
            disabled={loading}
            className="w-full bg-purple-600 hover:bg-purple-700"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4 mr-2" />
            )}
            Genera Script Chiamata
          </Button>
        )}

        {/* Generated Script */}
        {script && (
          <div className="bg-white rounded-lg p-4 border border-purple-200">
            <div className="flex items-start justify-between mb-2">
              <span className="text-sm font-medium text-purple-900">Script Suggerito</span>
              <button
                onClick={() => copyToClipboard(script)}
                className="p-1 hover:bg-purple-100 rounded"
              >
                {copied ? (
                  <Check className="w-4 h-4 text-green-600" />
                ) : (
                  <Copy className="w-4 h-4 text-purple-600" />
                )}
              </button>
            </div>
            <p className="text-sm text-gray-700 whitespace-pre-wrap">{script}</p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setScript(null)}
              className="mt-3"
            >
              Genera Nuovo
            </Button>
          </div>
        )}

        {/* Quick Suggestions */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Lightbulb className="w-4 h-4 text-amber-500" />
            <span className="text-sm font-medium text-gray-700">Risposte Rapide</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {quickSuggestions.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => {
                  setObjectionResponse(suggestion.response);
                  toast.success('Risposta pronta');
                }}
                className="text-left p-2 text-xs bg-white rounded border border-gray-200 hover:border-purple-300 hover:bg-purple-50 transition-colors"
              >
                <span className="font-medium text-gray-900">"{suggestion.trigger}"</span>
              </button>
            ))}
          </div>
        </div>

        {/* Objection Handler */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <MessageSquare className="w-4 h-4 text-purple-600" />
            <span className="text-sm font-medium text-gray-700">Gestisci Obiezione</span>
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={objectionInput}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setObjectionInput(e.target.value)}
              placeholder="Scrivi l'obiezione del cliente..."
              className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleObjectionSubmit();
              }}
            />
            <Button
              onClick={handleObjectionSubmit}
              disabled={loading || !objectionInput.trim()}
              size="sm"
              className="bg-purple-600 hover:bg-purple-700"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Rispondi'}
            </Button>
          </div>
        </div>

        {/* Objection Response */}
        {objectionResponse && (
          <div className="bg-white rounded-lg p-4 border border-green-200">
            <div className="flex items-start justify-between mb-2">
              <span className="text-sm font-medium text-green-900 flex items-center gap-1">
                <Check className="w-4 h-4" />
                Risposta Suggerita
              </span>
              <button
                onClick={() => copyToClipboard(objectionResponse)}
                className="p-1 hover:bg-green-100 rounded"
              >
                <Copy className="w-4 h-4 text-green-600" />
              </button>
            </div>
            <p className="text-sm text-gray-700 whitespace-pre-wrap">{objectionResponse}</p>
            <button
              onClick={() => setObjectionResponse(null)}
              className="text-xs text-gray-500 hover:text-gray-700 mt-2"
            >
              Chiudi
            </button>
          </div>
        )}

        {/* AI Notice */}
        <div className="flex items-start gap-2 text-xs text-gray-500 bg-gray-50 rounded p-2">
          <AlertCircle className="w-3 h-3 mt-0.5 flex-shrink-0" />
          <span>I suggerimenti sono generati da AI. Verifica sempre prima di utilizzarli.</span>
        </div>
      </CardContent>
    </Card>
  );
}
