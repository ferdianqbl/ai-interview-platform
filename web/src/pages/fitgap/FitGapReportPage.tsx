import { useEffect, useState, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import ComparisonTable from "@/components/fitgap/ComparisonTable";
import { portfoliosApi } from "@/services/portfolios";
import { sessionsApi } from "@/services/sessions";
import { vacanciesApi } from "@/services/vacancies";
import { usePolling } from "@/hooks/usePolling";
import { ArrowLeft, Download, Loader2, RefreshCw, Zap, Sparkles, UserCheck, AlertTriangle } from "lucide-react";
import type { FitGapReport, Portfolio, Vacancy } from "@/types";

export default function FitGapReportPage() {
  const { id, sessionId, vacancyId } = useParams<{
    id: string;
    sessionId: string;
    vacancyId: string;
  }>();

  const [report, setReport] = useState<FitGapReport | null>(null);
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [vacancy, setVacancy] = useState<Vacancy | null>(null);
  const [candidateName, setCandidateName] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState<"pdf" | "json" | null>(null);
  const [regenerating, setRegenerating] = useState(false);

  const fetchReport = useCallback(async () => {
    if (!portfolio) return;
    try {
      const res = await portfoliosApi.getFitGap(portfolio.id, Number(vacancyId));
      setReport(res.data.report);
      setGenerating(false);
    } catch (e: any) {
      if (e?.response?.status === 404 || e?.response?.status === 202) {
        try {
          await portfoliosApi.triggerFitGap(portfolio.id, Number(vacancyId));
          setGenerating(true);
        } catch {
          setGenerating(false);
        }
      }
    }
  }, [portfolio, vacancyId]);

  useEffect(() => {
    Promise.all([
      sessionsApi.getPortfolio(Number(sessionId)),
      sessionsApi.get(Number(sessionId)),
      vacanciesApi.get(Number(vacancyId)),
    ])
      .then(([pRes, sRes, vRes]) => {
        const pData = pRes.data as any;
        if (pData.portfolio) setPortfolio(pData.portfolio);
        setCandidateName(sRes.data.session?.candidate_name ?? null);
        setVacancy(vRes.data.vacancy ?? null);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [sessionId, vacancyId]);

  useEffect(() => {
    if (portfolio) fetchReport();
  }, [portfolio, fetchReport]);

  usePolling(fetchReport, 5000, generating && !!portfolio);

  const handleRegenerate = async () => {
    if (!portfolio) return;
    setRegenerating(true);
    try {
      await portfoliosApi.regenerateFitGap(portfolio.id, Number(vacancyId));
      setReport(null);
      setGenerating(true);
    } finally {
      setRegenerating(false);
    }
  };

  const handleExport = async (format: "pdf" | "json") => {
    if (!portfolio) return;
    setExporting(format);
    try {
      const res = await portfoliosApi.exportPortfolio(portfolio.id, format, Number(vacancyId));
      const ext = format;
      const blob =
        format === "pdf"
          ? new Blob([res.data as BlobPart], { type: "application/pdf" })
          : new Blob([JSON.stringify(res.data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `fitgap-${sessionId}-${vacancyId}.${ext}`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setExporting(null);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6 p-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-foreground">Role Fit & Gap Analysis</h1>
            <Skeleton className="h-4 w-40 mt-1" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-9 w-24" />
            <Skeleton className="h-9 w-20" />
          </div>
        </div>
        <Skeleton className="h-64 w-full rounded-xl" />
        <Skeleton className="h-36 w-full rounded-xl" />
      </div>
    );
  }

  const discoveredSkills = portfolio?.skills?.filter((s) => s.is_discovered) || [];

  return (
    <div className="max-w-4xl mx-auto space-y-6 p-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b">
        <div className="flex items-start gap-3">
          <Link
            to={`/assessments/${id}/sessions/${sessionId}/portfolio`}
            className="p-2 rounded-lg border hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
            title="Back to Portfolio"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-foreground">Role Fit & Gap Analysis</h1>
              <span className="text-xs bg-emerald-50 text-emerald-700 font-semibold px-2.5 py-0.5 rounded-full border border-emerald-200">
                Evaluation Report
              </span>
            </div>
            <p className="text-sm text-muted-foreground mt-0.5">
              Candidate: <span className="font-medium text-foreground">{candidateName || `Session #${sessionId}`}</span>
              {vacancy && <span> • Target Role: <strong className="text-foreground">{vacancy.role_title}</strong></span>}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        {portfolio && (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRegenerate}
              disabled={regenerating || generating}
              className="shadow-xs"
            >
              {regenerating ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <RefreshCw className="h-4 w-4 mr-1.5 text-muted-foreground" />}
              Regenerate Analysis
            </Button>
            {report && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleExport("pdf")}
                  disabled={!!exporting}
                  className="shadow-xs"
                >
                  {exporting === "pdf" ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Download className="h-4 w-4 mr-1.5 text-muted-foreground" />}
                  Export PDF
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleExport("json")}
                  disabled={!!exporting}
                  className="shadow-xs"
                >
                  {exporting === "json" ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Download className="h-4 w-4 mr-1.5 text-muted-foreground" />}
                  Export JSON
                </Button>
              </>
            )}
          </div>
        )}
      </div>

      {/* Generating State */}
      {generating && (
        <div className="border rounded-xl p-12 text-center space-y-4 bg-muted/20">
          <div className="relative mx-auto w-12 h-12 flex items-center justify-center">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-lg text-foreground">Computing Role Fit & Narrative Synthesis</h3>
            <p className="text-sm text-muted-foreground max-w-md mx-auto mt-1">
              Calculating competency level deltas, checking human assessor adjustments, and generating executive hiring narratives via Gemini AI.
            </p>
          </div>
        </div>
      )}

      {/* Report Content */}
      {report && (
        <div className="space-y-6">
          {/* Skill Comparison Table */}
          <Card className="overflow-hidden border shadow-xs">
            <CardHeader className="p-5 pb-3">
              <CardTitle className="text-base font-semibold flex items-center justify-between">
                <span>Skill-by-Skill Requirement Comparison</span>
                <span className="text-xs font-normal text-muted-foreground">
                  Updated: {new Date(report.generated_at).toLocaleString()}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 pt-0">
              <ComparisonTable comparisons={report.skill_comparisons} />
            </CardContent>
          </Card>

          {/* AI Narratives (Culture + Overall) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Culture & Dimension Alignment */}
            <Card className="border shadow-xs bg-card">
              <CardHeader className="p-5 pb-2.5">
                <CardTitle className="text-sm font-semibold flex items-center gap-2 text-foreground">
                  <Sparkles className="h-4 w-4 text-amber-500" />
                  Culture & Working Style Alignment
                </CardTitle>
              </CardHeader>
              <CardContent className="p-5 pt-0">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {report.culture_narrative || "Candidate demonstrates strong general communication and ownership traits."}
                </p>
              </CardContent>
            </Card>

            {/* Executive Recommendation */}
            <Card className="border shadow-xs bg-card">
              <CardHeader className="p-5 pb-2.5">
                <CardTitle className="text-sm font-semibold flex items-center gap-2 text-foreground">
                  <UserCheck className="h-4 w-4 text-emerald-600" />
                  Hiring Recommendation Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="p-5 pt-0">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {report.overall_narrative || "Candidate evaluation complete against role criteria."}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Discovered / Additive Skills */}
          {discoveredSkills.length > 0 && (
            <Card className="border shadow-xs bg-muted/20">
              <CardHeader className="p-5 pb-3">
                <CardTitle className="text-sm font-semibold flex items-center gap-2 text-foreground">
                  <Zap className="h-4 w-4 text-amber-500" />
                  Additive Discovered Competencies ({discoveredSkills.length})
                </CardTitle>
                <p className="text-xs text-muted-foreground">
                  Skills the candidate exhibited during the interview that are beyond the target role's baseline requirements
                </p>
              </CardHeader>
              <CardContent className="p-5 pt-0">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {discoveredSkills.map((s) => (
                    <div key={s.id} className="p-3 bg-background border rounded-lg space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-sm text-foreground">{s.skill_label}</span>
                        <span className="text-xs bg-primary/10 text-primary font-semibold px-2 py-0.5 rounded">
                          L{s.ai_level}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {s.competency_summary}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
