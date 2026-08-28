import React, { useState, useRef, useEffect } from 'react';
import { 
  BrainCircuit, 
  Send, 
  Sparkles, 
  ChevronDown, 
  ChevronUp, 
  HelpCircle, 
  AlertCircle, 
  CheckCircle2, 
  ShieldCheck, 
  TrendingUp, 
  Users, 
  ShoppingBag, 
  DollarSign, 
  Clock, 
  Layers, 
  Info,
  Trash2,
  ArrowRight,
  Database
} from 'lucide-react';
import { DatasetAnalysisResult, ChatMessage, AIConfidence } from '../../types';
import { aiService } from '../../services/aiService';

interface AIDataScientistViewProps {
  dataset: DatasetAnalysisResult;
}

const SUGGESTED_PROMPTS = [
  {
    title: 'Why did my revenue change?',
    icon: TrendingUp,
    category: 'Revenue Trend',
  },
  {
    title: 'Find my best customers',
    icon: Users,
    category: 'Customer Intelligence',
  },
  {
    title: 'Which products are declining?',
    icon: ShoppingBag,
    category: 'Product Performance',
  },
  {
    title: 'Find unusual transactions',
    icon: AlertCircle,
    category: 'Anomaly Detection',
  },
  {
    title: 'What should I do to increase revenue?',
    icon: DollarSign,
    category: 'Growth Strategy',
  },
  {
    title: 'Summarize this dataset',
    icon: Layers,
    category: 'Executive Summary',
  },
];

export const AIDataScientistView: React.FC<AIDataScientistViewProps> = ({ dataset }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputQuery, setInputQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [openWhyId, setOpenWhyId] = useState<string | null>(null);
  const [lastGeneratedTime, setLastGeneratedTime] = useState<string>('just now');
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of chat when new messages appear
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSendMessage = async (queryText: string) => {
    const text = queryText.trim();
    if (!text || isLoading) return;

    const userMessageId = `msg-user-${Date.now()}`;
    const userMsg: ChatMessage = {
      id: userMessageId,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const newHistory = [...messages, userMsg];
    setMessages(newHistory);
    setInputQuery('');
    setIsLoading(true);

    try {
      const response = await aiService.askDataScientist(text, newHistory, dataset);
      const assistantMsgId = `msg-ai-${Date.now()}`;
      
      const assistantMsg: ChatMessage = {
        id: assistantMsgId,
        sender: 'assistant',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        structuredInsight: response,
      };

      setMessages((prev) => [...prev, assistantMsg]);
      setLastGeneratedTime('just now');
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: `msg-err-${Date.now()}`,
        sender: 'assistant',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        text: 'AI analysis is temporarily unavailable. The dashboard metrics and calculations remain completely operational.',
        isError: true,
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearChat = () => {
    setMessages([]);
    setOpenWhyId(null);
  };

  const getConfidenceBadge = (confidence?: AIConfidence) => {
    switch (confidence) {
      case 'High':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            High Confidence
          </span>
        );
      case 'Medium':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <Info className="w-3 h-3 text-amber-600" />
            Medium Confidence
          </span>
        );
      case 'Low':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
            <AlertCircle className="w-3 h-3 text-slate-500" />
            Low Confidence
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
            <CheckCircle2 className="w-3 h-3 text-indigo-600" />
            Evidence-Backed
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Header Section */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-100">
                <BrainCircuit className="w-3.5 h-3.5 text-indigo-600" />
                AI Data Scientist
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
                <Sparkles className="w-3 h-3 text-indigo-600" />
                Powered by Gemini
              </span>
              <span className="inline-flex items-center gap-1 text-xs text-slate-400 font-mono">
                <Clock className="w-3 h-3" />
                Analysis generated {lastGeneratedTime}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              AI Data Scientist
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Ask questions about your data. Get answers backed by evidence.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <div className="text-right hidden md:block">
              <div className="text-xs font-medium text-slate-700 flex items-center gap-1 justify-end">
                <Database className="w-3 h-3 text-slate-400" />
                <span>{dataset.datasetName}</span>
              </div>
              <div className="text-[11px] text-slate-400">
                {dataset.rowCount.toLocaleString()} verified rows • {dataset.columns.length} columns
              </div>
            </div>
            {messages.length > 0 && (
              <button
                id="clear-chat-btn"
                onClick={handleClearChat}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 transition-colors"
                title="Clear current conversation"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Clear Chat
              </button>
            )}
          </div>
        </div>

        {/* Dataset notice pill */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span className="flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            AI insights are based on the currently selected dataset. No data is invented.
          </span>
          <span className="hidden sm:inline font-medium text-slate-700">
            Quality: {dataset.qualityScore.score}/100 ({dataset.qualityScore.grade})
          </span>
        </div>
      </div>

      {/* Suggested Questions Grid (shown when messages is empty or as quick pills) */}
      {messages.length === 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Suggested Questions for this Dataset
            </h2>
            <span className="text-xs text-slate-400">Click to run instant scientific analysis</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {SUGGESTED_PROMPTS.map((prompt, idx) => {
              const Icon = prompt.icon;
              return (
                <button
                  key={idx}
                  id={`suggested-prompt-${idx}`}
                  onClick={() => handleSendMessage(prompt.title)}
                  className="text-left bg-white hover:bg-indigo-50/50 border border-slate-200 hover:border-indigo-300 rounded-xl p-4 transition-all duration-150 shadow-xs hover:shadow-sm group flex flex-col justify-between h-full"
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white flex items-center justify-center transition-colors">
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 group-hover:text-indigo-600">
                      {prompt.category}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-slate-800 group-hover:text-indigo-900 leading-snug">
                      "{prompt.title}"
                    </h3>
                    <div className="flex items-center gap-1 text-[11px] text-slate-400 group-hover:text-indigo-600 font-medium mt-2">
                      <span>Analyze with Gemini</span>
                      <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Chat Messages Log */}
      {messages.length > 0 && (
        <div className="space-y-4">
          {messages.map((msg) => {
            const isUser = msg.sender === 'user';
            const insight = msg.structuredInsight;
            const isWhyOpen = openWhyId === msg.id;

            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
              >
                {/* User Message */}
                {isUser ? (
                  <div className="max-w-2xl bg-indigo-600 text-white rounded-2xl rounded-tr-xs px-4 py-3 shadow-xs text-sm font-medium">
                    <p>{msg.text}</p>
                    <span className="block text-right text-[10px] text-indigo-200 mt-1">
                      {msg.timestamp}
                    </span>
                  </div>
                ) : msg.isError ? (
                  /* Error Message */
                  <div className="max-w-2xl bg-rose-50 border border-rose-200 rounded-2xl rounded-tl-xs p-4 text-rose-800 text-sm">
                    <div className="flex items-center gap-2 font-semibold mb-1">
                      <AlertCircle className="w-4 h-4 text-rose-600" />
                      <span>Analysis Notice</span>
                    </div>
                    <p>{msg.text}</p>
                  </div>
                ) : insight ? (
                  /* Structured AI Data Scientist Response Card */
                  <div className="w-full bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
                    {/* Card Top Banner */}
                    <div className="bg-slate-50 border-b border-slate-200 px-5 py-3 flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-md bg-indigo-600 text-white flex items-center justify-center">
                          <BrainCircuit className="w-3.5 h-3.5" />
                        </div>
                        <span className="font-bold text-slate-800 text-xs tracking-wide">
                          AI Data Scientist Finding
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        {getConfidenceBadge(insight.confidence)}
                        <span className="text-[11px] text-slate-400 font-mono">{msg.timestamp}</span>
                      </div>
                    </div>

                    {/* Structured Content Sections */}
                    <div className="p-5 space-y-4">
                      {/* Section 1: Finding */}
                      <div>
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1 flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                          Finding
                        </h4>
                        <p className="text-base font-semibold text-slate-900 leading-relaxed">
                          {insight.finding}
                        </p>
                      </div>

                      {/* Section 2: Evidence */}
                      <div className="bg-slate-50 border border-slate-200/80 rounded-lg p-3.5">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1 flex items-center gap-1.5">
                          <Database className="w-3.5 h-3.5 text-slate-600" />
                          Evidence
                        </h4>
                        <p className="text-sm text-slate-700 font-mono leading-relaxed">
                          {insight.evidence}
                        </p>
                      </div>

                      {/* Section 3 & 4: Business Impact & Recommendation in a 2-col layout */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Business Impact */}
                        <div className="bg-white border border-slate-200 rounded-lg p-3.5">
                          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1 flex items-center gap-1.5">
                            <TrendingUp className="w-3.5 h-3.5 text-blue-600" />
                            Business Impact
                          </h4>
                          <p className="text-sm text-slate-700 leading-relaxed">
                            {insight.businessImpact}
                          </p>
                        </div>

                        {/* Recommendation */}
                        <div className="bg-white border border-slate-200 rounded-lg p-3.5">
                          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1 flex items-center gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            Recommendation
                          </h4>
                          <p className="text-sm text-slate-700 leading-relaxed">
                            {insight.recommendation}
                          </p>
                        </div>
                      </div>

                      {/* Expandable "Why am I seeing this?" Section */}
                      {insight.whyDetails && (
                        <div className="border-t border-slate-100 pt-3">
                          <button
                            id={`why-btn-${msg.id}`}
                            onClick={() => setOpenWhyId(isWhyOpen ? null : msg.id)}
                            className="flex items-center justify-between w-full py-1.5 text-xs font-semibold text-indigo-700 hover:text-indigo-900 transition-colors"
                          >
                            <span className="flex items-center gap-1.5">
                              <HelpCircle className="w-3.5 h-3.5 text-indigo-600" />
                              Why am I seeing this?
                            </span>
                            {isWhyOpen ? (
                              <ChevronUp className="w-4 h-4 text-indigo-600" />
                            ) : (
                              <ChevronDown className="w-4 h-4 text-indigo-600" />
                            )}
                          </button>

                          {isWhyOpen && (
                            <div
                              id={`why-details-${msg.id}`}
                              className="mt-2.5 bg-slate-900 text-slate-200 rounded-lg p-4 space-y-3 text-xs leading-relaxed"
                            >
                              <div>
                                <span className="font-bold text-slate-100 uppercase tracking-wider text-[10px] block mb-1">
                                  Data Fields Used:
                                </span>
                                <div className="flex flex-wrap gap-1.5">
                                  {insight.whyDetails.dataUsed.map((col, cIdx) => (
                                    <span
                                      key={cIdx}
                                      className="px-2 py-0.5 rounded bg-slate-800 text-indigo-300 font-mono text-[11px] border border-slate-700"
                                    >
                                      {col}
                                    </span>
                                  ))}
                                </div>
                              </div>

                              <div>
                                <span className="font-bold text-slate-100 uppercase tracking-wider text-[10px] block mb-1">
                                  Calculated Statistical Evidence:
                                </span>
                                <ul className="list-disc list-inside space-y-0.5 text-slate-300 font-mono">
                                  {insight.whyDetails.evidenceStats.map((stat, sIdx) => (
                                    <li key={sIdx}>{stat}</li>
                                  ))}
                                </ul>
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 border-t border-slate-800">
                                <div>
                                  <span className="font-bold text-slate-100 uppercase tracking-wider text-[10px] block mb-0.5">
                                    Method:
                                  </span>
                                  <span className="text-slate-300">{insight.whyDetails.method}</span>
                                </div>
                                <div>
                                  <span className="font-bold text-slate-100 uppercase tracking-wider text-[10px] block mb-0.5">
                                    Limitations:
                                  </span>
                                  <span className="text-slate-400">{insight.whyDetails.limitations}</span>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  /* Plain text fallback */
                  <div className="max-w-2xl bg-white border border-slate-200 rounded-2xl rounded-tl-xs p-4 text-slate-800 text-sm shadow-xs">
                    <p>{msg.text}</p>
                    <span className="block text-right text-[10px] text-slate-400 mt-1">
                      {msg.timestamp}
                    </span>
                  </div>
                )}
              </div>
            );
          })}

          {/* Loading Indicator */}
          {isLoading && (
            <div className="flex items-center gap-3 bg-white border border-slate-200 rounded-xl p-4 shadow-xs max-w-md">
              <div className="w-6 h-6 rounded-md bg-indigo-600 text-white flex items-center justify-center animate-pulse">
                <BrainCircuit className="w-4 h-4 animate-spin" />
              </div>
              <div className="space-y-1">
                <div className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
                  <span>Gemini is analyzing calculated metrics...</span>
                </div>
                <div className="text-[11px] text-slate-400">
                  Verifying mathematical evidence across {dataset.rowCount.toLocaleString()} rows
                </div>
              </div>
            </div>
          )}

          <div ref={chatBottomRef} />
        </div>
      )}

      {/* Suggested Prompt Pills (when conversation is active) */}
      {messages.length > 0 && !isLoading && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          <span className="text-slate-400 whitespace-nowrap font-medium">Follow-up:</span>
          {SUGGESTED_PROMPTS.slice(0, 4).map((p, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(p.title)}
              className="px-3 py-1.5 rounded-full bg-white hover:bg-indigo-50 border border-slate-200 hover:border-indigo-300 text-slate-700 hover:text-indigo-700 whitespace-nowrap transition-colors shadow-2xs font-medium"
            >
              {p.title}
            </button>
          ))}
        </div>
      )}

      {/* Chat Input Bar */}
      <div className="sticky bottom-4 z-20 bg-white border border-slate-300 rounded-2xl p-2 shadow-lg focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-100 transition-all">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage(inputQuery);
          }}
          className="flex items-center gap-2"
        >
          <input
            id="chat-input-query"
            type="text"
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            placeholder="Ask anything about this dataset (e.g., 'Which products perform best?')"
            disabled={isLoading}
            className="flex-1 bg-transparent px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden disabled:opacity-50"
          />

          <button
            id="chat-submit-btn"
            type="submit"
            disabled={!inputQuery.trim() || isLoading}
            className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 disabled:text-slate-400 text-white font-semibold text-sm flex items-center gap-1.5 transition-colors shadow-xs shrink-0 cursor-pointer disabled:cursor-not-allowed"
          >
            <span>Ask</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>
    </div>
  );
};
