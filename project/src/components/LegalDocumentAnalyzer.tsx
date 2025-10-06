import { useState } from 'react';
import { FileText, Upload, AlertCircle, CheckCircle, Calendar, Users, BookOpen, Loader2, XCircle } from 'lucide-react';
import { analyzeDocument, getDocumentAnalyses } from '../services/documentAnalyzer';
import { DocumentAnalysis } from '../types';

export default function LegalDocumentAnalyzer() {
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<DocumentAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<DocumentAnalysis[]>(getDocumentAnalyses());

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setAnalyzing(true);
    setError(null);
    setAnalysis(null);

    setTimeout(async () => {
      const result = await analyzeDocument(file);

      if (result.success && result.analysis) {
        setAnalysis(result.analysis);
        setHistory(getDocumentAnalyses());
      } else {
        setError(result.error || 'Failed to analyze document');
      }

      setAnalyzing(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-amber-50 to-slate-50">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="flex items-center gap-3 mb-8">
          <div className="p-3 bg-amber-600 rounded-xl">
            <FileText className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Legal Document Analyzer</h1>
            <p className="text-slate-600 mt-1">Extract key details and analyze legal documents</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8">
              <h2 className="text-xl font-semibold text-slate-900 mb-6">Upload Document</h2>

              <div className="border-2 border-dashed border-slate-300 rounded-xl p-12 text-center hover:border-amber-500 transition-colors">
                <input
                  type="file"
                  id="file-upload"
                  accept=".pdf,.doc,.docx,.txt"
                  onChange={handleFileUpload}
                  disabled={analyzing}
                  className="hidden"
                />
                <label
                  htmlFor="file-upload"
                  className={`cursor-pointer ${analyzing ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <div className="flex flex-col items-center">
                    {analyzing ? (
                      <Loader2 className="w-16 h-16 text-amber-600 animate-spin mb-4" />
                    ) : (
                      <Upload className="w-16 h-16 text-slate-400 mb-4" />
                    )}
                    <h3 className="text-lg font-semibold text-slate-900 mb-2">
                      {analyzing ? 'Analyzing Document...' : 'Upload Legal Document'}
                    </h3>
                    <p className="text-sm text-slate-600">
                      PDF, Word (.doc, .docx), or Text files
                    </p>
                    {!analyzing && (
                      <button
                        type="button"
                        className="mt-4 bg-amber-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-amber-700 transition-colors"
                      >
                        Choose File
                      </button>
                    )}
                  </div>
                </label>
              </div>

              {error && (
                <div className="mt-6 p-6 rounded-xl bg-red-50 border-2 border-red-200">
                  <div className="flex items-start gap-4">
                    <XCircle className="w-8 h-8 text-red-600 flex-shrink-0" />
                    <div>
                      <h3 className="text-lg font-bold text-red-900 mb-2">Error</h3>
                      <p className="text-sm text-red-700">{error}</p>
                    </div>
                  </div>
                </div>
              )}

              {analysis && (
                <div className="mt-6 space-y-6">
                  <div className="p-6 rounded-xl bg-green-50 border-2 border-green-200">
                    <div className="flex items-start gap-4">
                      <CheckCircle className="w-8 h-8 text-green-600 flex-shrink-0" />
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-green-900 mb-2">
                          Analysis Complete
                        </h3>
                        <p className="text-sm text-green-700">
                          Document: {analysis.document_name}
                        </p>
                      </div>
                    </div>
                  </div>

                  {analysis.extracted_data && (
                    <div className="grid md:grid-cols-3 gap-4">
                      {analysis.extracted_data.names && analysis.extracted_data.names.length > 0 && (
                        <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                          <div className="flex items-center gap-2 mb-3">
                            <Users className="w-5 h-5 text-amber-600" />
                            <h4 className="font-semibold text-slate-900">Names</h4>
                          </div>
                          <ul className="space-y-1">
                            {analysis.extracted_data.names.slice(0, 5).map((name, i) => (
                              <li key={i} className="text-sm text-slate-700">
                                {name}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {analysis.extracted_data.dates && analysis.extracted_data.dates.length > 0 && (
                        <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                          <div className="flex items-center gap-2 mb-3">
                            <Calendar className="w-5 h-5 text-amber-600" />
                            <h4 className="font-semibold text-slate-900">Dates</h4>
                          </div>
                          <ul className="space-y-1">
                            {analysis.extracted_data.dates.slice(0, 5).map((date, i) => (
                              <li key={i} className="text-sm text-slate-700">
                                {date}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {analysis.extracted_data.terms && analysis.extracted_data.terms.length > 0 && (
                        <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                          <div className="flex items-center gap-2 mb-3">
                            <BookOpen className="w-5 h-5 text-amber-600" />
                            <h4 className="font-semibold text-slate-900">Legal Terms</h4>
                          </div>
                          <ul className="space-y-1">
                            {analysis.extracted_data.terms.slice(0, 5).map((term, i) => (
                              <li key={i} className="text-sm text-slate-700 capitalize">
                                {term}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}

                  {analysis.risky_phrases && analysis.risky_phrases.length > 0 && (
                    <div className="bg-orange-50 rounded-xl p-6 border-2 border-orange-200">
                      <div className="flex items-start gap-4">
                        <AlertCircle className="w-6 h-6 text-orange-600 flex-shrink-0 mt-1" />
                        <div className="flex-1">
                          <h4 className="font-semibold text-orange-900 mb-3">
                            Risky/Unclear Phrases Detected
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {analysis.risky_phrases.map((phrase, i) => (
                              <span
                                key={i}
                                className="px-3 py-1 bg-orange-100 text-orange-800 text-sm rounded-full border border-orange-300"
                              >
                                {phrase}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {analysis.summary && (
                    <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
                      <h4 className="font-semibold text-blue-900 mb-3">
                        Plain Language Summary
                      </h4>
                      <p className="text-sm text-blue-800 leading-relaxed">
                        {analysis.summary}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6 sticky top-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Analysis History</h3>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {history.length === 0 ? (
                  <p className="text-sm text-slate-500 text-center py-8">
                    No analyses yet
                  </p>
                ) : (
                  history.slice(0, 10).map((item) => (
                    <div
                      key={item.id}
                      className="p-3 rounded-lg border bg-slate-50 border-slate-200 hover:border-amber-300 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-1">
                        <FileText className="w-4 h-4 text-amber-600 flex-shrink-0" />
                        {item.risky_phrases && item.risky_phrases.length > 0 && (
                          <AlertCircle className="w-4 h-4 text-orange-600" />
                        )}
                      </div>
                      <p className="text-xs font-medium text-slate-900 truncate mb-1">
                        {item.document_name}
                      </p>
                      <p className="text-xs text-slate-500">
                        {new Date(item.created_at).toLocaleString()}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
