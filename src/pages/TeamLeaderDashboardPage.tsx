import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Phone, Users, TrendingUp, Calendar, Settings } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { ActivityFeed } from '@/components/dashboard/ActivityFeed';
import { useNavigate } from 'react-router-dom';

interface TeamStats {
  teamName: string;
  teamColor: string;
  membersCount: number;
  teamCallsToday: number;
  teamLeadsQualified: number;
  teamAppointments: number;
  avgCallsPerAgent: number;
  qualificationRate: number;
  showUpRate: number;
  agentPerformance: AgentPerformance[];
}

interface AgentPerformance {
  id: string;
  name: string;
  avatar: string | null;
  calls: number;
  qualified: number;
  appointments: number;
  conversion: number;
  avgScore: number;
}

export default function TeamLeaderDashboardPage() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<TeamStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (profile && profile.role === 'team_leader') {
      loadTeamStats();
    }
  }, [profile]);

  async function loadTeamStats() {
    if (!profile) return;

    setLoading(true);
    try {
      // Get team where user is leader
      const { data: team, error: teamError } = await supabase
        .from('teams')
        .select(`
          id,
          name,
          color,
          team_members(
            user:users(id, name, avatar_url)
          )
        `)
        .eq('leader_id', profile.id)
        .single();

      if (teamError || !team) {
        console.error('No team found for leader');
        setLoading(false);
        return;
      }

      const memberIds = team.team_members.map((m: any) => m.user.id);

      const today = new Date();
      const todayStart = new Date(today.setHours(0, 0, 0, 0));

      // Team calls today
      const { count: teamCalls } = await supabase
        .from('calls')
        .select('*', { count: 'exact', head: true })
        .in('agent_id', memberIds)
        .gte('started_at', todayStart.toISOString());

      // Team qualified today
      const { count: teamQualified } = await supabase
        .from('calls')
        .select('*', { count: 'exact', head: true })
        .in('agent_id', memberIds)
        .eq('outcome', 'qualified')
        .gte('started_at', todayStart.toISOString());

      // Team appointments today
      const { count: teamAppointments } = await supabase
        .from('appointments')
        .select('*', { count: 'exact', head: true })
        .in('agent_id', memberIds)
        .gte('created_at', todayStart.toISOString());

      // Agent performance (individual)
      const agentPerformance = await Promise.all(
        team.team_members.map(async (member: any) => {
          const agent = member.user;

          const { count: calls } = await supabase
            .from('calls')
            .select('*', { count: 'exact', head: true })
            .eq('agent_id', agent.id)
            .gte('started_at', todayStart.toISOString());

          const { count: qualified } = await supabase
            .from('calls')
            .select('*', { count: 'exact', head: true })
            .eq('agent_id', agent.id)
            .eq('outcome', 'qualified')
            .gte('started_at', todayStart.toISOString());

          const { count: appointments } = await supabase
            .from('appointments')
            .select('*', { count: 'exact', head: true })
            .eq('agent_id', agent.id)
            .gte('created_at', todayStart.toISOString());

          const { data: scores } = await supabase
            .from('calls')
            .select('final_score')
            .eq('agent_id', agent.id)
            .gte('started_at', todayStart.toISOString())
            .not('final_score', 'is', null);

          const avgScore =
            scores && scores.length > 0
              ? Math.round(
                  scores.reduce((acc, s) => acc + (s.final_score || 0), 0) /
                    scores.length
                )
              : 0;

          const conversion =
            calls && calls > 0 ? Math.round(((qualified || 0) / calls) * 100) : 0;

          return {
            id: agent.id,
            name: agent.name,
            avatar: agent.avatar_url,
            calls: calls || 0,
            qualified: qualified || 0,
            appointments: appointments || 0,
            conversion,
            avgScore,
          };
        })
      );

      // Sort by calls
      agentPerformance.sort((a, b) => b.calls - a.calls);

      const avgCallsPerAgent =
        memberIds.length > 0
          ? Math.round((teamCalls || 0) / memberIds.length)
          : 0;

      const qualificationRate =
        teamCalls && teamCalls > 0
          ? Math.round(((teamQualified || 0) / teamCalls) * 100)
          : 0;

      // Show up rate (completed vs total appointments last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { count: totalAppointments } = await supabase
        .from('appointments')
        .select('*', { count: 'exact', head: true })
        .in('agent_id', memberIds)
        .gte('scheduled_for', thirtyDaysAgo.toISOString())
        .lte('scheduled_for', new Date().toISOString());

      const { count: completedAppointments } = await supabase
        .from('appointments')
        .select('*', { count: 'exact', head: true })
        .in('agent_id', memberIds)
        .eq('status', 'completed')
        .gte('scheduled_for', thirtyDaysAgo.toISOString())
        .lte('scheduled_for', new Date().toISOString());

      const showUpRate =
        totalAppointments && totalAppointments > 0
          ? Math.round(((completedAppointments || 0) / totalAppointments) * 100)
          : 0;

      setStats({
        teamName: team.name,
        teamColor: team.color,
        membersCount: memberIds.length,
        teamCallsToday: teamCalls || 0,
        teamLeadsQualified: teamQualified || 0,
        teamAppointments: teamAppointments || 0,
        avgCallsPerAgent,
        qualificationRate,
        showUpRate,
        agentPerformance,
      });
    } catch (error) {
      console.error('Error loading team stats:', error);
    } finally {
      setLoading(false);
    }
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
      {/* Team Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div
            className="w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold text-xl"
            style={{ backgroundColor: stats.teamColor }}
          >
            {stats.teamName[0]}
          </div>
          <div>
            <h1 className="text-3xl font-bold">Team {stats.teamName}</h1>
            <p className="text-gray-600">
              {stats.membersCount} agenti attivi
            </p>
          </div>
        </div>
        <Button onClick={() => navigate('/team/manage')}>
          <Settings className="w-4 h-4 mr-2" />
          Gestisci Team
        </Button>
      </div>

      {/* Team KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatsCard
          title="Chiamate Team (Oggi)"
          value={stats.teamCallsToday}
          subtitle={`Media: ${stats.avgCallsPerAgent}/agente`}
          icon={Phone}
          color="blue"
        />
        <StatsCard
          title="Lead Qualificati"
          value={stats.teamLeadsQualified}
          subtitle={`${stats.qualificationRate}% tasso qualificazione`}
          icon={TrendingUp}
          color="green"
        />
        <StatsCard
          title="Appuntamenti"
          value={stats.teamAppointments}
          subtitle={`${stats.showUpRate}% presenza effettiva`}
          icon={Calendar}
          color="purple"
        />
      </div>

      {/* Agent Performance Table */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Agenti (Oggi)</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Agente</TableHead>
                <TableHead>Chiamate</TableHead>
                <TableHead>Qualificati</TableHead>
                <TableHead>Appuntamenti</TableHead>
                <TableHead>Conversion</TableHead>
                <TableHead>Score Medio</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {stats.agentPerformance.map((agent) => (
                <TableRow key={agent.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Avatar>
                        <AvatarImage src={agent.avatar || undefined} />
                        <AvatarFallback>{agent.name[0]}</AvatarFallback>
                      </Avatar>
                      <span className="font-medium">{agent.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>{agent.calls}</TableCell>
                  <TableCell>{agent.qualified}</TableCell>
                  <TableCell>{agent.appointments}</TableCell>
                  <TableCell>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        agent.conversion > 30 ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {agent.conversion}%
                    </span>
                  </TableCell>
                  <TableCell>{agent.avgScore}/100</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Real-time Activity Feed */}
      <Card>
        <CardHeader>
          <CardTitle>Attività in Tempo Reale</CardTitle>
        </CardHeader>
        <CardContent>
          <ActivityFeed teamId={stats.teamName} />
        </CardContent>
      </Card>
    </div>
  );
}
