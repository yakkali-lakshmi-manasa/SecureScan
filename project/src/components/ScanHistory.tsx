import { useState, useEffect } from 'react';
import { History, Shield, FileText, Calendar, Filter, CheckCircle, AlertTriangle, Trash2 } from 'lucide-react';
import { getContentScans } from '../services/contentScanner';
import { getDocumentAnalyses } from '../services/documentAnalyzer';
import { ContentScan, DocumentAnalysis } from '../types';

interface ScanHistoryProps {
  onNavigate: (page: 'home' | 'scanner' | 'analyzer') => void;
}

type HistoryItem = (ContentScan & { type: 'content' }) | (DocumentAnalysis & { type: 'document' });

export default function ScanHistory({ onNavigate }: ScanHistoryProps) {
  const [filter, setFilter] = useState<'all' | 'content' | 'document'>('all');
  const [history, setHistory] = useState<HistoryItem[]>([]);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = () => {
    const contentScans = getContentScans().map((scan: ContentScan) => ({ ...scan, type: 'content' as const }));
    const documentAnalyses = getDocumentAnalyses().map((doc: DocumentAnalysis) => ({ ...doc, type: 'document' as const }));

    const combined = [...contentScans, ...documentAnalyses].sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

    setHistory(combined);
  };

  const clearHistory = () => {
    if (confirm('Are you sure you want to clear all history?')) {
      localStorage.removeItem('content_scans');
      localStorage.removeItem('document_analyses');
      loadHistory();
    }
  };

  const filteredHistory = history.filter(item => {
    if (filter === 'all') return true;
    return item.type === filter;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-slate-50">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-indigo-600 rounded-xl">
              <History className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Scan History</h1>
              <p className="text-slate-600 mt-1">View all your scans and analyses</p>
            </div>
          </div>
          <button
            onClick={() => onNavigate('home')}
            className="px-6 py-3 bg-slate-600 text-white rounded-xl font-semibold hover:bg-slate-700 transition-colors"
          >
            Back to Home
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6 mb-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <Filter className="w-5 h-5 text-slate-600" />
              <span className="text-sm font-medium text-slate-700">Filter:</span>
              <div className="flex gap-2">
                <button
                  onClick={() => setFilter('all')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    filter === 'all'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setFilter('content')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    filter === 'content'
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  Content Scans
                </button>
                <button
                  onClick={() => setFilter('document')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    filter === 'document'
                      ? 'bg-amber-600 text-white'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  Documents
                </button>
              </div>
            </div>
            <button
              onClick={clearHistory}
              className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors text-sm font-medium"
            >
              <Trash2 className="w-4 h-4" />
              Clear History
            </button>
          </div>
        </div>

        {filteredHistory.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-12 text-center">
            <History className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-900 mb-2">No History Found</h3>
            <p className="text-slate-600 mb-6">
              {filter === 'all'
                ? 'Start scanning content or analyzing documents to see your history here.'
                : `No ${filter === 'content' ? 'content scans' : 'document analyses'} found.`}
            </p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => onNavigate('scanner')}
                className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors"
              >
                <Shield className="w-5 h-5" />
                Content Scanner
              </button>
              <button
                onClick={() => onNavigate('analyzer')}
                className="flex items-center gap-2 px-6 py-3 bg-amber-600 text-white rounded-xl font-semibold hover:bg-amber-700 transition-colors"
              >
                <FileText className="w-5 h-5" />
                Document Analyzer
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredHistory.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-xl shadow border border-slate-200 p-6 hover:shadow-md transition-all"
              >
                {item.type === 'content' ? (
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-blue-100 rounded-lg flex-shrink-0">
                      <Shield className="w-6 h-6 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <h3 className="text-lg font-semibold text-slate-900">
                            Content Safety Scan
                          </h3>
                          <span className="px-3 py-1 bg-slate-100 text-slate-700 text-xs font-medium rounded-full uppercase">
                            {item.scan_type.replace('_', ' ')}
                          </span>
                        </div>
                        <div
                          className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
                            item.result === 'Safe'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {item.result === 'Safe' ? (
                            <CheckCircle className="w-5 h-5" />
                          ) : (
                            <AlertTriangle className="w-5 h-5" />
                          )}
                          <span className="font-bold">{item.result}</span>
                        </div>
                      </div>
                      <p className="text-slate-700 mb-3 break-words">{item.input_content}</p>
                      {item.detected_reasons && (
                        <div className="mb-3 p-3 bg-red-50 rounded-lg">
                          <p className="text-sm font-medium text-red-900 mb-1">Detected Issues:</p>
                          <p className="text-sm text-red-700">{item.detected_reasons}</p>
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-sm text-slate-500">
                        <Calendar className="w-4 h-4" />
                        <span>{new Date(item.created_at).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-amber-100 rounded-lg flex-shrink-0">
                      <FileText className="w-6 h-6 text-amber-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-lg font-semibold text-slate-900">
                          Legal Document Analysis
                        </h3>
                        <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-bold rounded-lg flex items-center gap-1">
                          <CheckCircle className="w-4 h-4" />
                          ANALYZED
                        </span>
                      </div>
                      <p className="text-slate-700 font-medium mb-2">{item.document_name}</p>
                      {item.summary && (
                        <p className="text-sm text-slate-600 mb-3">{item.summary}</p>
                      )}
                      {item.risky_phrases && item.risky_phrases.length > 0 && (
                        <div className="mb-3 p-3 bg-orange-50 rounded-lg">
                          <p className="text-sm font-medium text-orange-900 mb-2">Risky Phrases Found:</p>
                          <div className="flex flex-wrap gap-2">
                            {item.risky_phrases.map((phrase, i) => (
                              <span
                                key={i}
                                className="px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded-full border border-orange-200"
                              >
                                {phrase}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-sm text-slate-500">
                        <Calendar className="w-4 h-4" />
                        <span>{new Date(item.created_at).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
