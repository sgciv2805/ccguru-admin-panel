"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Building2, CreditCard, Gift, Calculator, TrendingUp, Users, BanknoteIcon } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Database } from "@/types/supabase";

const quickLinks = [
  {
    title: "Credit Cards",
    description: "Manage credit card information and details",
    icon: CreditCard,
    href: "/credit-cards",
    color: "from-blue-500/20 to-blue-600/20",
    iconColor: "text-blue-600",
  },
  {
    title: "Benefits",
    description: "Configure card benefits and rewards",
    icon: Gift,
    href: "/benefits",
    color: "from-purple-500/20 to-purple-600/20",
    iconColor: "text-purple-600",
  },
  {
    title: "Calculation Rules",
    description: "Set up reward calculation rules",
    icon: Calculator,
    href: "/calculation-rules",
    color: "from-emerald-500/20 to-emerald-600/20",
    iconColor: "text-emerald-600",
  },
  {
    title: "Banks",
    description: "Manage bank information and partnerships",
    icon: Building2,
    href: "/banks",
    color: "from-amber-500/20 to-amber-600/20",
    iconColor: "text-amber-600",
  },
];

type Stats = {
  totalCards: number;
  activeBanks: number;
  totalUsers: number;
  totalTransactions: number;
};

export default function HomePage() {
  const [stats, setStats] = useState<Stats>({
    totalCards: 0,
    activeBanks: 0,
    totalUsers: 0,
    totalTransactions: 0,
  });
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const supabase = createClientComponentClient<Database>();

  useEffect(() => {
    const fetchStats = async () => {
      const { count: cardsCount } = await supabase
        .from('credit_cards')
        .select('*', { count: 'exact', head: true });
      const { count: banksCount } = await supabase
        .from('banks')
        .select('*', { count: 'exact', head: true });
      const { count: usersCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });
      const { count: transactionsCount } = await supabase
        .from('transactions')
        .select('*', { count: 'exact', head: true });
      setStats({
        totalCards: cardsCount || 0,
        activeBanks: banksCount || 0,
        totalUsers: usersCount || 0,
        totalTransactions: transactionsCount || 0,
      });
    };
    const fetchRecentActivity = async () => {
      const { data: recentUpdates } = await supabase
        .from('update_history')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(5);
      setRecentActivity(recentUpdates || []);
    };
    fetchStats();
    fetchRecentActivity();
  }, [supabase]);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Welcome to CC Guru Admin
          </h1>
          <p className="text-muted-foreground mt-2">
            Manage your credit card data and configurations
          </p>
        </div>
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {quickLinks.map((link) => (
          <Link key={link.href} href={link.href}>
            <Card className={`h-full transition-all duration-200 hover:shadow-md hover:border-primary/50 bg-gradient-to-br ${link.color}`}>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <link.icon className={`w-5 h-5 ${link.iconColor}`} />
                  <CardTitle className="text-xl">{link.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription>{link.description}</CardDescription>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest updates and changes</CardDescription>
          </CardHeader>
          <CardContent>
            {recentActivity.length > 0 ? (
              <div className="space-y-4">
                {recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-start gap-4 p-3 rounded-lg bg-muted/50">
                    <div className="p-2 rounded-full bg-primary/10">
                      <TrendingUp className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{activity.prompt}</p>
                      <p className="text-xs text-muted-foreground">
                        {activity.timestamp ? new Date(activity.timestamp).toLocaleString() : ""}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No recent activity</p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Quick Stats</CardTitle>
            <CardDescription>Overview of your data</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-blue-500/10">
                    <CreditCard className="w-4 h-4 text-blue-600" />
                  </div>
                  <p className="text-sm text-muted-foreground">Total Cards</p>
                </div>
                <p className="text-2xl font-bold">{stats.totalCards}</p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-amber-500/10">
                    <Building2 className="w-4 h-4 text-amber-600" />
                  </div>
                  <p className="text-sm text-muted-foreground">Active Banks</p>
                </div>
                <p className="text-2xl font-bold">{stats.activeBanks}</p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-purple-500/10">
                    <Users className="w-4 h-4 text-purple-600" />
                  </div>
                  <p className="text-sm text-muted-foreground">Total Users</p>
                </div>
                <p className="text-2xl font-bold">{stats.totalUsers}</p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-emerald-500/10">
                    <BanknoteIcon className="w-4 h-4 text-emerald-600" />
                  </div>
                  <p className="text-sm text-muted-foreground">Transactions</p>
                </div>
                <p className="text-2xl font-bold">{stats.totalTransactions}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 