export function ActivityFeed({ teamId }: { teamId: string }) {
  return (
    <div className="space-y-3">
      <div className="p-3 border-l-4 border-blue-500 bg-blue-50">
        <p className="text-sm font-medium">Attività team {teamId}</p>
        <p className="text-xs text-gray-600 mt-1">Nessuna attività recente</p>
      </div>
    </div>
  );
}
