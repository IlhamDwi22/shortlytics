"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Copy,
  Check,
  ExternalLink,
  Globe2,
  Smartphone,
  Laptop,
  Tablet,
  Monitor,
  Activity,
  Radio,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ClicksOverTimeChart } from "@/components/charts/clicks-over-time-chart";
import { DeviceBreakdownChart } from "@/components/charts/device-breakdown-chart";
import { useRealtimeAnalytics } from "@/hooks/useRealtimeAnalytics";
import { cn } from "@/lib/utils";

const MONO = "font-mono tracking-tight";

interface LinkDetail {
  id: string;
  shortCode: string;
  shortUrl: string;
  originalUrl: string;
  isActive: boolean;
  totalClicks: number;
  createdAt: string;
}

interface AnalyticsData {
  totalClicks: number;
  clicksByDay: { date: string; count: number }[];
  deviceBreakdown: { type: string; count: number }[];
  browserBreakdown: { browser: string; count: number }[];
  topReferrers: { referrer: string; count: number }[];
  topCountries: { country: string; count: number }[];
  recentClicks: {
    id: string;
    clickedAt: string;
    maskedIp: string;
    country: string;
    city: string;
    deviceType: string;
    browser: string;
    referrer: string;
  }[];
}

const DEVICE_ICONS: Record<string, React.ElementType> = {
  mobile: Smartphone,
  desktop: Laptop,
  tablet: Tablet,
};

export default function LinkDetailPage() {
  const params = useParams();
  const router = useRouter();
  const linkId = params.id as string;

  const [link, setLink] = React.useState<LinkDetail | null>(null);
  const [analytics, setAnalytics] = React.useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [copied, setCopied] = React.useState(false);

  const { totalClicks: liveClicks, isConnected } = useRealtimeAnalytics(linkId, {
    initialTotalClicks: link?.totalClicks || 0,
  });

  React.useEffect(() => {
    async function fetchData() {
      try {
        const [linkRes, analyticsRes] = await Promise.all([
          fetch(`/api/links/${linkId}`),
          fetch(`/api/links/${linkId}/analytics`),
        ]);

        if (!linkRes.ok) {
          router.push("/dashboard");
          return;
        }

        const linkData = await linkRes.json();
        setLink(linkData);

        if (analyticsRes.ok) {
          const analyticsData = await analyticsRes.json();
          setAnalytics(analyticsData);
        }
      } catch {
        router.push("/dashboard");
      }
      setIsLoading(false);
    }
    fetchData();
  }, [linkId, router]);

  const copyToClipboard = async () => {
    if (!link) return;
    try {
      await navigator.clipboard.writeText(link.shortUrl);
      setCopied(true);
      toast.success("Copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy.");
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-24 w-full" />
        <div className="grid gap-4 md:grid-cols-2">
          <Skeleton className="h-[200px] sm:h-[320px]" />
          <Skeleton className="h-[200px] sm:h-[320px]" />
        </div>
      </div>
    );
  }

  if (!link) return null;

  const deviceIcon = (type: string) => {
    const Icon = DEVICE_ICONS[type] || Monitor;
    return <Icon className="size-3.5 text-lime-300" />;
  };

  return (
    <div className="space-y-6">
      {/* Back nav */}
      <Link
        href="/dashboard"
        className={cn(
          MONO,
          "inline-flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-zinc-500 transition-colors hover:text-zinc-300"
        )}
      >
        <ArrowLeft className="size-3.5" />
        Dashboard
      </Link>

      {/* Link header */}
      <div className="rounded-lg border border-white/10 bg-zinc-900/50 p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
              <h1 className={cn(MONO, "min-w-0 truncate text-lg font-semibold text-lime-300")}>
                {link.shortUrl.replace(/^https?:\/\//, "")}
              </h1>
              <div className="flex items-center gap-2">
                <Badge variant={link.isActive ? "success" : "destructive"}>
                  {link.isActive ? "active" : "inactive"}
                </Badge>
                <div className="flex items-center gap-1.5">
                  <span
                    className={cn(
                      "size-1.5 rounded-full",
                      isConnected ? "bg-lime-400 animate-pulse" : "bg-zinc-600"
                    )}
                  />
                  <span className={cn(MONO, "text-[10px] text-zinc-600")}>
                    {isConnected ? "live" : "offline"}
                  </span>
                </div>
              </div>
            </div>
            <p className={cn(MONO, "mt-1 truncate text-xs text-zinc-500")}>
              → {link.originalUrl}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={copyToClipboard}
              className="border-white/10 text-zinc-300 hover:bg-white/5 hover:text-zinc-100"
            >
              {copied ? (
                <Check className="mr-1.5 size-3.5 text-lime-400" />
              ) : (
                <Copy className="mr-1.5 size-3.5" />
              )}
              {copied ? "Copied" : "Copy"}
            </Button>
            <a
              href={link.shortUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                "inline-flex h-7 items-center gap-1.5 rounded-md border border-white/10 px-2.5 text-[11px] text-zinc-400 transition-colors hover:bg-white/5 hover:text-zinc-200"
              )}
            >
              <ExternalLink className="size-3.5" />
              Visit
            </a>
          </div>
        </div>

        {/* Live click counter */}
        <div className="mt-5 flex items-center gap-6 border-t border-white/5 pt-5">
          <div>
            <span className={cn(MONO, "text-[10px] uppercase tracking-[0.16em] text-zinc-500")}>
              Total clicks
            </span>
            <div className={cn(MONO, "mt-1 text-3xl font-semibold text-zinc-50 tabular-nums")}>
              {liveClicks.toLocaleString()}
            </div>
          </div>
          <div>
            <span className={cn(MONO, "text-[10px] uppercase tracking-[0.16em] text-zinc-500")}>
              Created
            </span>
            <div className={cn(MONO, "mt-1 text-sm text-zinc-300")}>
              {new Date(link.createdAt).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Charts row */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-sm">
                <Activity className="size-4 text-lime-300" />
                Clicks over time
              </CardTitle>
              <Radio className="size-3 animate-pulse text-zinc-600" />
            </div>
          </CardHeader>
          <CardContent>
            <ClicksOverTimeChart data={analytics?.clicksByDay || []} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Globe2 className="size-4 text-lime-300" />
              Device breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            <DeviceBreakdownChart data={analytics?.deviceBreakdown || []} />
          </CardContent>
        </Card>
      </div>

      {/* Data tables row */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Top Referrers */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Top Referrers</CardTitle>
          </CardHeader>
          <CardContent>
            {analytics?.topReferrers && analytics.topReferrers.length > 0 ? (
              <ul className="space-y-2">
                {analytics.topReferrers.map((r) => {
                  const maxCount = analytics.topReferrers[0].count;
                  const pct = maxCount > 0 ? (r.count / maxCount) * 100 : 0;
                  return (
                    <li key={r.referrer} className="flex items-center gap-3">
                      <span className={cn(MONO, "w-20 min-w-0 shrink-0 truncate text-xs text-zinc-300 sm:w-28")}>
                        {r.referrer}
                      </span>
                      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/5">
                        <div
                          className="h-full rounded-full bg-zinc-500 transition-all duration-500"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className={cn(MONO, "w-8 shrink-0 text-right text-xs tabular-nums text-zinc-400")}>
                        {r.count}
                      </span>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="text-sm text-zinc-500">No referrer data yet.</p>
            )}
          </CardContent>
        </Card>

        {/* Top Countries */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Top Countries</CardTitle>
          </CardHeader>
          <CardContent>
            {analytics?.topCountries && analytics.topCountries.length > 0 ? (
              <ul className="space-y-2">
                {analytics.topCountries.map((c) => {
                  const maxCount = analytics.topCountries[0].count;
                  const pct = maxCount > 0 ? (c.count / maxCount) * 100 : 0;
                  return (
                    <li key={c.country} className="flex items-center gap-3">
                      <span className={cn(MONO, "w-20 min-w-0 shrink-0 truncate text-xs text-zinc-300 sm:w-28")}>
                        {c.country}
                      </span>
                      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/5">
                        <div
                          className="h-full rounded-full bg-lime-400/60 transition-all duration-500"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className={cn(MONO, "w-8 shrink-0 text-right text-xs tabular-nums text-zinc-400")}>
                        {c.count}
                      </span>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="text-sm text-zinc-500">No country data yet.</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Browser breakdown */}
      {analytics?.browserBreakdown && analytics.browserBreakdown.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Browser Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
              {analytics.browserBreakdown.map((b) => (
                <div
                  key={b.browser}
                  className="rounded-md border border-white/5 bg-zinc-950/40 p-3"
                >
                  <span className={cn(MONO, "text-[10px] uppercase tracking-wider text-zinc-500")}>
                    {b.browser}
                  </span>
                  <div className={cn(MONO, "mt-1 text-lg font-semibold text-zinc-100 tabular-nums")}>
                    {b.count}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent clicks table */}
      {analytics?.recentClicks && analytics.recentClicks.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm">Recent Clicks</CardTitle>
              <div className="flex items-center gap-1.5">
                <span className="size-1.5 rounded-full bg-lime-400 animate-pulse" />
                <span className={cn(MONO, "text-[10px] text-zinc-600")}>live</span>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-white/5">
                    <th className={cn(MONO, "pb-2 pr-4 text-[10px] uppercase tracking-wider text-zinc-500 font-medium")}>Time</th>
                    <th className={cn(MONO, "pb-2 pr-4 text-[10px] uppercase tracking-wider text-zinc-500 font-medium")}>Country</th>
                    <th className={cn(MONO, "pb-2 pr-4 text-[10px] uppercase tracking-wider text-zinc-500 font-medium")}>Device</th>
                    <th className={cn(MONO, "pb-2 pr-4 text-[10px] uppercase tracking-wider text-zinc-500 font-medium")}>Browser</th>
                    <th className={cn(MONO, "pb-2 text-[10px] uppercase tracking-wider text-zinc-500 font-medium")}>Referrer</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {analytics.recentClicks.map((click) => (
                    <tr key={click.id} className="text-zinc-300">
                      <td className={cn(MONO, "py-2 pr-4 tabular-nums text-zinc-500")}>
                        {new Date(click.clickedAt).toLocaleTimeString("en-US", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>
                      <td className="py-2 pr-4">
                        {deviceIcon(click.deviceType)}
                        <span className="ml-1.5">{click.country}</span>
                      </td>
                      <td className={cn(MONO, "py-2 pr-4 capitalize text-zinc-400")}>
                        {click.deviceType}
                      </td>
                      <td className={cn(MONO, "py-2 pr-4 text-zinc-400")}>
                        {click.browser}
                      </td>
                      <td className={cn(MONO, "py-2 truncate max-w-[160px] text-zinc-500")}>
                        {click.referrer}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
