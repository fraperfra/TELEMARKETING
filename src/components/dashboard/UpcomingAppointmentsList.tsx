interface Appointment {
  id: string;
  scheduled_for: string;
  contact: { name: string; address: string };
  agent: { name: string };
  status: string;
}

export function UpcomingAppointmentsList({ appointments }: { appointments: Appointment[] }) {
  return (
    <div className="space-y-2">
      {appointments.slice(0, 5).map((apt) => (
        <div key={apt.id} className="p-3 border rounded-lg">
          <div className="flex justify-between items-start">
            <div>
              <p className="font-medium">{apt.contact?.name}</p>
              <p className="text-xs text-gray-500">{apt.contact?.address}</p>
            </div>
            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">{apt.status}</span>
          </div>
        </div>
      ))}
      {appointments.length === 0 && <p className="text-center text-gray-500 py-4">Nessun appuntamento</p>}
    </div>
  );
}
