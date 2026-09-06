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
  AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ClicksOverTimeChart } from "@/components/charts/clicks-over-time-chart";
import { DeviceBreakdownChart } from "@/components/charts/device-breakdown-chart";
import { useRealtimeAnalytics } from "@/hooks/useRealtimeAnalytics";
import { useCopy } from "@/hooks/useCopy";
import { cn } from "@/lib/utils";
import {
  fetchJson,
  type LinkDetail,
  type AnalyticsResponse,
} from "@/lib/api-types";

const MONO = "font-mono tracking-tight";

const DEVICE_ICONS: Record<string, React.ElementType> = {
  mobile: Smartphone,
  desktop: Laptop,
  tablet: Tablet,
};

export default function LinkDetailPage() {
  const params = useParams();
  const router = useRouter();
  const rawLinkId = params.id;
  const linkId = Array.isArray(rawLinkId) ? rawLinkId[0] : (rawLinkId as string) ?? "";

  const [link, setLink] = React.useState<LinkDetail | null>(null);
  const [analytics, setAnalytics] = React.useState<AnalyticsResponse | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [analyticsError, setAnalyticsError] = React.useState<string | null>(null);
  const { copied, copy } = useCopy();

  const { totalClicks: liveClicks, isConnected } = useRealtimeAnalytics(linkId, {
    initialTotalClicks: link?.totalClicks ?? 0,
  });

  React.useEffect(() => {
    async function fetchData() {
      if (!linkId) {
        router.push("/dashboard");
        return;
      }
      setAnalyticsError(null);
      try {
        const [linkData, analyticsData] = await Promise.all([
          fetchJson<LinkDetail>(`/api/links/${linkId}`).catch(() => null),
          fetchJson<AnalyticsResponse>(`/api/links/${linkId}/analytics`).catch(
            () => null
          ),
        ]);

        if (!linkData) {
          router.push("/dashboard");
          return;
        }

        setLink(linkData);

        if (!analyticsData) {
          // Don't silently drop analytics failures — surface them with a banner.
          setAnalyticsError("Failed to load analytics data.");
          setAnalytics(null);
          return;
        }
        setAnalytics(analyticsData);
      } catch {
        router.push("/dashboard");
      }
      setIsLoading(false);
    }
    fetchData();
  }, [linkId, router]);

  const copyToClipboard = async () => {
    if (!link) return;
    const ok = await copy(link.shortUrl);
    toast.success(ok ? "Copied to clipboard!" : "Failed to copy.");
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-28 w-full" />
        <div className="grid gap-4 md:grid-cols-2">
          <Skeleton className="h-[220px] sm:h-[340px]" />
          <Skeleton className="h-[220px] sm:h-[340px]" />
        </div>
      </div>
    );
  }

  if (!link) return null;

  const deviceIcon = (type: string) => {
    const Icon = DEVICE_ICONS[type] || Monitor;
    return <Icon className="size-4 text-lime-300" />;
  };

  return (
    <div className="space-y-6">
      {/* Back nav */}
      <Link
        href="/dashboard"
        className={cn(
          MONO,
          "inline-flex items-center gap-1.5 text-xs uppercase tracking-wider text-muted-foreground transition-colors hover:text-foreground"
        )}
      >
        <ArrowLeft className="size-4" />
        Dashboard
      </Link>

      {/* Link header */}
      <div className="rounded-xl border border-border bg-card p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
              <h1 className={cn(MONO, "min-w-0 truncate text-xl font-semibold text-lime-300")}>
                {link.shortUrl.replace(/^https?:\/\//, "")}
              </h1>
              <div className="flex items-center gap-2">
                <Badge variant={link.isActive ? "success" : "destructive"}>
                  {link.isActive ? "active" : "inactive"}
                </Badge>
                <div className="flex items-center gap-1.5">
                  <span
                    className={cn(
                      "size-2 rounded-full",
                      isConnected ? "bg-lime-400 animate-pulse" : "bg-muted-foreground/40"
                    )}
                  />
                  <span className={cn(MONO, "text-[11px] text-muted-foreground/70")}>
                    {isConnected ? "live" : "offline"}
                  </span>
                </div>
              </div>
            </div>
            <p className={cn(MONO, "mt-1.5 truncate text-sm text-muted-foreground")}>
              → {link.originalUrl}
            </p>
          </div>
          <div className="flex items-center gap-2.5">
            <Button
              variant="outline"
              size="sm"
              onClick={copyToClipboard}
              className="h-9 border-border px-4 text-foreground/70 hover:bg-muted hover:text-foreground"
            >
              {copied ? (
                <Check className="mr-1.5 size-4 text-lime-400" />
              ) : (
                <Copy className="mr-1.5 size-4" />
              )}
              {copied ? "Copied" : "Copy"}
            </Button>
            <a
              href={link.shortUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                "inline-flex h-9 items-center gap-1.5 rounded-md border border-border px-3.5 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              )}
            >
              <ExternalLink className="size-4" />
              Buka
            </a>
          </div>
        </div>

        {/* Live click counter */}
        <div className="mt-6 flex items-center gap-8 border-t border-border/30 pt-6">
          <div>
            <span className={cn(MONO, "text-xs uppercase tracking-[0.14em] text-muted-foreground")}>
              Total clicks
            </span>
            <div className={cn(MONO, "mt-1 text-4xl font-semibold text-foreground tabular-nums")}>
              {liveClicks.toLocaleString()}
            </div>
          </div>
          <div>
            <span className={cn(MONO, "text-xs uppercase tracking-[0.14em] text-muted-foreground")}>
              Created
            </span>
            <div className={cn(MONO, "mt-1.5 text-base text-foreground/70")}>
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
      {analyticsError && (
        <div className="flex items-center gap-3 rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
          <AlertTriangle className="size-4.5 shrink-0" />
          <span>{analyticsError}</span>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-base">
                <Activity className="size-5 text-lime-300" />
                Clicks over time
              </CardTitle>
              <Radio className="size-3.5 animate-pulse text-muted-foreground/40" />
            </div>
          </CardHeader>
          <CardContent>
            <ClicksOverTimeChart data={analytics?.clicksByDay || []} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <Globe2 className="size-5 text-lime-300" />
              Devices
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
            <CardTitle className="text-base">Top referrers</CardTitle>
          </CardHeader>
          <CardContent>
            {analytics?.topReferrers && analytics.topReferrers.length > 0 ? (
              <ul className="space-y-2.5">
                {analytics.topReferrers.map((r) => {
                  const maxCount = analytics.topReferrers[0].count;
                  const pct = maxCount > 0 ? (r.count / maxCount) * 100 : 0;
                  return (
                    <li key={r.referrer} className="flex items-center gap-3">
                       <span className={cn(MONO, "w-24 min-w-0 shrink-0 truncate text-sm text-foreground/70 sm:w-32")}>
                        {r.referrer}
                      </span>
                      <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted/50">
                        <div
                          className="h-full rounded-full bg-muted-foreground/50 transition-all duration-500"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className={cn(MONO, "w-10 shrink-0 text-right text-sm tabular-nums text-muted-foreground")}>
                        {r.count}
                      </span>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="text-base text-muted-foreground">No referrer data yet.</p>
            )}
          </CardContent>
        </Card>

        {/* Top Countries */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Top Countries</CardTitle>
          </CardHeader>
          <CardContent>
            {analytics?.topCountries && analytics.topCountries.length > 0 ? (
              <ul className="space-y-2.5">
                {analytics.topCountries.map((c) => {
                  const maxCount = analytics.topCountries[0].count;
                  const pct = maxCount > 0 ? (c.count / maxCount) * 100 : 0;
                  return (
                    <li key={c.country} className="flex items-center gap-3">
                       <span className={cn(MONO, "w-24 min-w-0 shrink-0 truncate text-sm text-foreground/70 sm:w-32")}>
                        {c.country}
                      </span>
                      <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted/50">
                        <div
                          className="h-full rounded-full bg-lime-400/60 transition-all duration-500"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className={cn(MONO, "w-10 shrink-0 text-right text-sm tabular-nums text-muted-foreground")}>
                        {c.count}
                      </span>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="text-base text-muted-foreground">No country data yet.</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Browser breakdown */}
      {analytics?.browserBreakdown && analytics.browserBreakdown.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Browsers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
              {analytics.browserBreakdown.map((b) => (
                <div
                  key={b.browser}
                  className="rounded-lg border border-border/30 bg-background/60 p-4"
                >
                    <span className={cn(MONO, "text-xs uppercase tracking-wider text-muted-foreground")}>
                    {b.browser}
                  </span>
                  <div className={cn(MONO, "mt-1.5 text-2xl font-semibold text-foreground tabular-nums")}>
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
              <CardTitle className="text-base">Recent clicks</CardTitle>
              <div className="flex items-center gap-1.5">
                <span className="size-2 rounded-full bg-lime-400 animate-pulse" />
                <span className={cn(MONO, "text-[11px] text-muted-foreground/70")}>live</span>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                    <tr className="border-b border-border/30">
                      <th className={cn(MONO, "pb-2.5 pr-4 text-xs uppercase tracking-wider text-muted-foreground font-medium")}>Time</th>
                      <th className={cn(MONO, "pb-2.5 pr-4 text-xs uppercase tracking-wider text-muted-foreground font-medium")}>Country</th>
                      <th className={cn(MONO, "pb-2.5 pr-4 text-xs uppercase tracking-wider text-muted-foreground font-medium")}>Device</th>
                      <th className={cn(MONO, "pb-2.5 pr-4 text-xs uppercase tracking-wider text-muted-foreground font-medium")}>Browser</th>
                      <th className={cn(MONO, "pb-2.5 text-xs uppercase tracking-wider text-muted-foreground font-medium")}>Referrer</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/30">
                  {analytics.recentClicks.map((click) => (
                    <tr key={click.id} className="text-foreground/70">
                      <td className={cn(MONO, "py-2.5 pr-4 tabular-nums text-muted-foreground")}>
                        {new Date(click.clickedAt).toLocaleTimeString("en-US", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>
                      <td className="py-2.5 pr-4">{click.country}</td>
                      <td className={cn(MONO, "py-2.5 pr-4 capitalize text-muted-foreground")}>
                        <span className="inline-flex items-center gap-1.5">
                          {deviceIcon(click.deviceType)}
                          {click.deviceType}
                        </span>
                      </td>
                      <td className={cn(MONO, "py-2.5 pr-4 text-muted-foreground")}>
                        {click.browser}
                      </td>
                      <td className={cn(MONO, "py-2.5 truncate max-w-[160px] text-muted-foreground")}>
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
