import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

interface Agent {
  id: string;
  name: string;
  avatar: string | null;
  calls: number;
  qualified: number;
  appointments: number;
  score: number;
}

export function TeamLeaderboard({ agents }: { agents: Agent[] }) {
  return (
    <div className="space-y-3">
      {agents.map((agent, index) => (
        <div key={agent.id} className="flex items-center gap-3 p-3 rounded-lg border">
          <div className="text-sm font-bold text-gray-400 w-6 text-center">
            #{index + 1}
          </div>
          <Avatar>
            <AvatarImage src={agent.avatar || undefined} />
            <AvatarFallback>{agent.name?.[0] || '?'}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <p className="font-medium">{agent.name}</p>
            <p className="text-xs text-gray-500">{agent.calls} chiamate • {agent.qualified} qualificati</p>
          </div>
          <Badge className="bg-blue-100 text-blue-800">{agent.score}/100</Badge>
        </div>
      ))}
    </div>
  );
}
