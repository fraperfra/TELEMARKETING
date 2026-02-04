import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Phone,
  Users,
  TrendingUp,
  Calendar,
  CheckCircle,
  DollarSign,
  BarChart3,
  Plus,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { TeamLeaderboard } from '@/components/dashboard/TeamLeaderboard';
import { CampaignsTable } from '@/components/dashboard/CampaignsTable';
import { UpcomingAppointmentsList } from '@/components/dashboard/UpcomingAppointmentsList';
import { CallsChart } from '@/components/dashboard/CallsChart';
import { TeamPerformanceChart } from '@/components/dashboard/TeamPerformanceChart';
import { useNavigate } from 'react-router-dom';

interface OrganizationStats {
  callsToday: number;
  callsYesterday: number;
  leadsQualified: number;
  leadsYesterday: number;
  appointmentsBooked: number;
  appointmentsYesterday: number;
  conversionRate: number;
  callsLast14Days: any[];
  teamStats: any[];
  agentRankings: any[];
  upcomingAppointments: any[];
  activeCampaigns: any[];
  monthlyCallsUsed: number;
  monthlyCallsLimit: number;
}

export default function OwnerDashboardPage() {
  const { profile, organization } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<OrganizationStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState<'today' | 'week' | 'month'>('today');

  useEffect(() => {
    if (profile && organization && profile.role === 'owner') {
      loadOrganizationStats();
    }
  }, [profile, organization, timeframe]);

  async function loadOrganizationStats() {
    if (!organization) return;

    setLoading(true);
    try {
      const today = new Date();
      const todayStart = new Date(today.setHours(0, 0, 0, 0));
      const todayEnd = new Date(today.setHours(23, 59, 59, 999));
      const yesterday = new Date(todayStart);
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayEnd = new Date(todayStart);

      // Chiamate oggi vs ieri
      const { count: callsToday } = await supabase
        .from('calls')
        .select('*', { count: 'exact', head: true })
        .eq('organization_id', organization.id)
        .gte('started_at', todayStart.toISOString())
        .lte('started_at', todayEnd.toISOString());

      const { count: callsYesterday } = await supabase
        .from('calls')
        .select('*', { count: 'exact', head: true })
        .eq('organization_id', organization.id)
        .gte('started_at', yesterday.toISOString())
        .lt('started_at', yesterdayEnd.toISOString());

      // Lead qualificati oggi vs ieri
      const { count: leadsToday } = await supabase
        .from('calls')
        .select('*', { count: 'exact', head: true })
        .eq('organization_id', organization.id)
        .eq('outcome', 'qualified')
        .gte('started_at', todayStart.toISOString());

      const { count: leadsYesterday } = await supabase
        .from('calls')
        .select('*', { count: 'exact', head: true })
        .eq('organization_id', organization.id)
        .eq('outcome', 'qualified')
        .gte('started_at', yesterday.toISOString())
        .lt('started_at', yesterdayEnd.toISOString());

      // Appuntamenti prenotati oggi vs ieri
      const { count: appointmentsToday } = await supabase
        .from('appointments')
        .select('*', { count: 'exact', head: true })
        .eq('organization_id', organization.id)
        .gte('created_at', todayStart.toISOString());

      const { count: appointmentsYesterday } = await supabase
        .from('appointments')
        .select('*', { count: 'exact', head: true })
        .eq('organization_id', organization.id)
        .gte('created_at', yesterday.toISOString())
        .lt('created_at', yesterdayEnd.toISOString());

      // Conversion rate
      const conversionRate =
        callsToday && callsToday > 0 ? ((leadsToday || 0) / callsToday) * 100 : 0;

      // Chiamate ultimi 14 giorni
      const fourteenDaysAgo = new Date();
      fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

      const { data: dailyStats } = await supabase
        .from('daily_stats')
        .select('*')
        .eq('organization_id', organization.id)
        .gte('date', fourteenDaysAgo.toISOString().split('T')[0])
        .order('date', { ascending: true });

      // Aggregate per giorno
      const callsLast14Days = aggregateByDate(dailyStats || []);

      // Team stats (per team)
      const { data: teams } = await supabase
        .from('teams')
        .select(`
          id,
          name,
          color,
          leader:users!leader_id(name),
          members:team_members(count)
        `)
        .eq('organization_id', organization.id);

      const teamStats = await Promise.all(
        (teams || []).map(async (team) => {
          // Get team member IDs
          const { data: members } = await supabase
            .from('team_members')
            .select('user_id')
            .eq('team_id', team.id);

          const memberIds = members?.map((m) => m.user_id) || [];

          if (memberIds.length === 0) {
            return {
              id: team.id,
              name: team.name,
              color: team.color,
              calls: 0,
              qualified: 0,
              appointments: 0,
            };
          }

          const { count: teamCalls } = await supabase
            .from('calls')
            .select('*', { count: 'exact', head: true })
            .in('agent_id', memberIds)
            .gte('started_at', todayStart.toISOString());

          const { count: teamQualified } = await supabase
            .from('calls')
            .select('*', { count: 'exact', head: true })
            .in('agent_id', memberIds)
            .eq('outcome', 'qualified')
            .gte('started_at', todayStart.toISOString());

          const { count: teamAppointments } = await supabase
            .from('appointments')
            .select('*', { count: 'exact', head: true })
            .in('agent_id', memberIds)
            .gte('created_at', todayStart.toISOString());

          return {
            id: team.id,
            name: team.name,
            color: team.color,
            calls: teamCalls || 0,
            qualified: teamQualified || 0,
            appointments: teamAppointments || 0,
          };
        })
      );

      // Agent rankings (top performers questo mese)
      const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);

      const { data: agentStats } = await supabase
        .from('daily_stats')
        .select(`
          agent_id,
          agent:users!agent_id(name, avatar_url),
          calls_made,
          leads_qualified,
          appointments_booked
        `)
        .eq('organization_id', organization.id)
        .gte('date', monthStart.toISOString().split('T')[0]);

      // Aggregate by agent
      const agentMap = new Map();
      agentStats?.forEach((stat) => {
        const existing = agentMap.get(stat.agent_id) || {
          id: stat.agent_id,
          name: stat.agent?.name || 'Unknown',
          avatar: stat.agent?.avatar_url,
          calls: 0,
          qualified: 0,
          appointments: 0,
        };

        existing.calls += stat.calls_made || 0;
        existing.qualified += stat.leads_qualified || 0;
        existing.appointments += stat.appointments_booked || 0;

        agentMap.set(stat.agent_id, existing);
      });

      const agentRankings = Array.from(agentMap.values())
        .map((agent) => ({
          ...agent,
          score: agent.calls * 1 + agent.qualified * 3 + agent.appointments * 5,
        }))
        .sort((a, b) => b.score - a.score)
        .slice(0, 10);

      // Prossimi appuntamenti (tutta agenzia)
      const { data: upcomingAppointments } = await supabase
        .from('appointments')
        .select(`
          *,
          contact:contacts(name, address),
          agent:users!agent_id(name)
        `)
        .eq('organization_id', organization.id)
        .in('status', ['scheduled', 'confirmed'])
        .gte('scheduled_for', new Date().toISOString())
        .order('scheduled_for', { ascending: true })
        .limit(10);

      // Campagne attive
      const { data: activeCampaigns } = await supabase
        .from('campaigns')
        .select('*')
        .eq('organization_id', organization.id)
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      setStats({
        callsToday: callsToday || 0,
        callsYesterday: callsYesterday || 0,
        leadsQualified: leadsToday || 0,
        leadsYesterday: leadsYesterday || 0,
        appointmentsBooked: appointmentsToday || 0,
        appointmentsYesterday: appointmentsYesterday || 0,
        conversionRate: Math.round(conversionRate * 10) / 10,
        callsLast14Days,
        teamStats,
        agentRankings,
        upcomingAppointments: upcomingAppointments || [],
        activeCampaigns: activeCampaigns || [],
        monthlyCallsUsed: organization.monthly_calls_used || 0,
        monthlyCallsLimit: organization.monthly_calls_limit || 0,
      });
    } catch (error) {
      console.error('Error loading organization stats:', error);
    } finally {
      setLoading(false);
    }
  }

  function aggregateByDate(stats: any[]) {
    const dateMap = new Map();

    stats.forEach((stat) => {
      const existing = dateMap.get(stat.date) || {
        date: stat.date,
        calls: 0,
        qualified: 0,
        appointments: 0,
      };

      existing.calls += stat.calls_made || 0;
      existing.qualified += stat.leads_qualified || 0;
      existing.appointments += stat.appointments_booked || 0;

      dateMap.set(stat.date, existing);
    });

    return Array.from(dateMap.values()).sort((a, b) =>
      a.date.localeCompare(b.date)
    );
  }

  function calculateChange(current: number, previous: number): number {
    if (previous === 0) return current > 0 ? 100 : 0;
    return Math.round(((current - previous) / previous) * 100);
  }

  if (loading || !stats) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard Agenzia</h1>
          <p className="text-gray-600 mt-1">{organization?.name}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate('/settings/team')}>
            <Users className="w-4 h-4 mr-2" />
            Gestisci Team
          </Button>
          <Button onClick={() => navigate('/campaigns/new')}>
            <Plus className="w-4 h-4 mr-2" />
            Nuova Campagna
          </Button>
        </div>
      </div>

      {/* Usage Alert */}
      {stats.monthlyCallsUsed / stats.monthlyCallsLimit > 0.8 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                <Phone className="w-5 h-5 text-orange-600" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-orange-900">
                  Limite chiamate mensile quasi raggiunto
                </p>
                <p className="text-sm text-orange-700">
                  {stats.monthlyCallsUsed} / {stats.monthlyCallsLimit} chiamate usate
                  questo mese (
                  {Math.round((stats.monthlyCallsUsed / stats.monthlyCallsLimit) * 100)}
                  %)
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/settings/billing')}
              >
                Upgrade Piano
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Chiamate Oggi"
          value={stats.callsToday}
          change={calculateChange(stats.callsToday, stats.callsYesterday)}
          icon={Phone}
          color="blue"
        />

        <StatsCard
          title="Lead Qualificati"
          value={stats.leadsQualified}
          change={calculateChange(stats.leadsQualified, stats.leadsYesterday)}
          icon={CheckCircle}
          color="green"
        />

        <StatsCard
          title="Appuntamenti Fissati"
          value={stats.appointmentsBooked}
          change={calculateChange(
            stats.appointmentsBooked,
            stats.appointmentsYesterday
          )}
          icon={Calendar}
          color="purple"
        />

        <StatsCard
          title="Tasso Conversione"
          value={`${stats.conversionRate}%`}
          icon={TrendingUp}
          color="orange"
        />
      </div>

      {/* Charts Row */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Chiamate Ultime 2 Settimane</CardTitle>
          </CardHeader>
          <CardContent>
            <CallsChart data={stats.callsLast14Days} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Performance Team</CardTitle>
          </CardHeader>
          <CardContent>
            <TeamPerformanceChart data={stats.teamStats} />
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="leaderboard" className="space-y-6">
        <TabsList>
          <TabsTrigger value="leaderboard">Classifica Agenti</TabsTrigger>
          <TabsTrigger value="appointments">Appuntamenti</TabsTrigger>
          <TabsTrigger value="campaigns">Campagne</TabsTrigger>
        </TabsList>

        <TabsContent value="leaderboard" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Top Performers (Questo Mese)</CardTitle>
            </CardHeader>
            <CardContent>
              <TeamLeaderboard agents={stats.agentRankings} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appointments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Prossimi Appuntamenti (Tutta Agenzia)</CardTitle>
            </CardHeader>
            <CardContent>
              <UpcomingAppointmentsList appointments={stats.upcomingAppointments} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="campaigns" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Campagne Attive</CardTitle>
              <Button onClick={() => navigate('/campaigns/new')}>
                <Plus className="w-4 h-4 mr-2" />
                Nuova Campagna
              </Button>
            </CardHeader>
            <CardContent>
              <CampaignsTable campaigns={stats.activeCampaigns} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
