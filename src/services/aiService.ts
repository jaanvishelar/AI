import { AIInsightItem, GrowthOpportunity, ChatMessage, DatasetAnalysisResult } from '../types';
import { computeComprehensiveDatasetStatistics, ComprehensiveDataSummary } from '../utils/statisticalEngine';

export interface AIAnalysisSession {
  datasetName: string;
  generatedAt: string;
  insights: AIInsightItem[];
  growthOpportunities: GrowthOpportunity[];
  comprehensiveSummary: ComprehensiveDataSummary;
  source: string;
}

class AIService {
  private currentSessionCache: AIAnalysisSession | null = null;
  private inFlightPromise: Promise<AIAnalysisSession> | null = null;

  /**
   * Builds the comprehensive statistical summary locally from the dataset
   */
  buildStatisticalSummary(dataset: DatasetAnalysisResult): ComprehensiveDataSummary {
    const records = dataset.allRows && dataset.allRows.length > 0 ? dataset.allRows : dataset.sampleRows;
    return computeComprehensiveDatasetStatistics(records, dataset);
  }

  /**
   * Generates or retrieves cached AI insights for the current dataset
   */
  async generateInsights(dataset: DatasetAnalysisResult, forceRefresh = false): Promise<AIAnalysisSession> {
    if (!forceRefresh && this.currentSessionCache && this.currentSessionCache.datasetName === dataset.datasetName) {
      return this.currentSessionCache;
    }

    if (this.inFlightPromise && !forceRefresh) {
      return this.inFlightPromise;
    }

    this.inFlightPromise = (async () => {
      const summary = this.buildStatisticalSummary(dataset);

      try {
        const [insightsRes, growthRes] = await Promise.all([
          fetch('/api/gemini/insights', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ summary }),
          }),
          fetch('/api/gemini/growth', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ summary }),
          }),
        ]);

        let insights: AIInsightItem[] = [];
        let growthOpportunities: GrowthOpportunity[] = [];
        let source = 'gemini-3.7-flash';

        if (insightsRes.ok) {
          const data = await insightsRes.json();
          insights = data.insights || [];
          if (data.source) source = data.source;
        }

        if (growthRes.ok) {
          const data = await growthRes.json();
          growthOpportunities = data.opportunities || [];
        }

        const sessionData: AIAnalysisSession = {
          datasetName: dataset.datasetName,
          generatedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          insights,
          growthOpportunities,
          comprehensiveSummary: summary,
          source,
        };

        this.currentSessionCache = sessionData;
        return sessionData;
      } catch (err) {
        console.warn('Backend AI call failed, using client-side statistical fallback:', err);
        // Fallback session
        const fallbackSession: AIAnalysisSession = {
          datasetName: dataset.datasetName,
          generatedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          insights: [],
          growthOpportunities: [],
          comprehensiveSummary: this.buildStatisticalSummary(dataset),
          source: 'deterministic_engine',
        };
        this.currentSessionCache = fallbackSession;
        return fallbackSession;
      } finally {
        this.inFlightPromise = null;
      }
    })();

    return this.inFlightPromise;
  }

  /**
   * Ask natural language questions with conversational history
   */
  async askDataScientist(
    question: string,
    history: ChatMessage[],
    dataset: DatasetAnalysisResult
  ): Promise<ChatMessage['structuredInsight']> {
    const summary = this.buildStatisticalSummary(dataset);

    try {
      const response = await fetch('/api/gemini/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question,
          history,
          summary,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        return data.response;
      } else {
        const errJson = await response.json().catch(() => null);
        throw new Error(errJson?.error || 'AI analysis temporarily unavailable.');
      }
    } catch (err: any) {
      console.error('Chat error:', err);
      throw new Error(err.message || 'AI analysis is temporarily unavailable. Please try again.');
    }
  }

  /**
   * Invalidate cache on dataset change
   */
  clearCache() {
    this.currentSessionCache = null;
  }
}

export const aiService = new AIService();
