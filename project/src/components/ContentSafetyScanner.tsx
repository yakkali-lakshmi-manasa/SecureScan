import { useState } from 'react';
import { Shield, AlertTriangle, CheckCircle, FileText, Link, Mail, QrCode, Loader2 } from 'lucide-react';
import { scanContent, saveContentScan, getContentScans } from '../services/contentScanner';
import { ContentScan } from '../types';

export default function ContentSafetyScanner() {
  const [scanType, setScanType] = useState<'text' | 'url' | 'email' | 'qr_code'>('text');
  const [inputContent, setInputContent] = useState('');
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<{ result: 'Safe' | 'Unsafe'; detectedReasons?: string[] } | null>(null);
  const [history, setHistory] = useState<ContentScan[]>(getContentScans());

  const handleScan = async () => {
    if (!inputContent.trim()) return;

    setScanning(true);
    setResult(null);

    setTimeout(async () => {
      const scanResult = scanContent(scanType, inputContent);
      setResult(scanResult);
      await saveContentScan(scanType, inputContent, scanResult);
      setHistory(getContentScans());
      setScanning(false);
    }, 800);
  };

  const scanTypeOptions = [
    { value: 'text', label: 'Plain Text', icon: FileText },
    { value: 'url', label: 'Website URL', icon: Link },
    { value: 'email', label: 'Email Address', icon: Mail },
    { value: 'qr_code', label: 'QR Code URL', icon: QrCode },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="flex items-center gap-3 mb-8">
          <div className="p-3 bg-blue-600 rounded-xl">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Content Safety Scanner</h1>
            <p className="text-slate-600 mt-1">Detect phishing, spam, and harmful content</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8">
              <h2 className="text-xl font-semibold text-slate-900 mb-6">Scan Content</h2>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-3">
                    Select Content Type
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {scanTypeOptions.map((option) => {
                      const Icon = option.icon;
                      return (
                        <button
                          key={option.value}
                          onClick={() => setScanType(option.value as any)}
                          className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${
                            scanType === option.value
                              ? 'border-blue-600 bg-blue-50 text-blue-900'
                              : 'border-slate-200 hover:border-slate-300 text-slate-700'
                          }`}
                        >
                          <Icon className="w-5 h-5" />
                          <span className="font-medium">{option.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-3">
                    Enter Content to Scan
                  </label>
                  <textarea
                    value={inputContent}
                    onChange={(e) => setInputContent(e.target.value)}
                    placeholder={`Enter ${scanType === 'url' || scanType === 'qr_code' ? 'URL' : scanType === 'email' ? 'email address' : 'text'} here...`}
                    className="w-full h-32 px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  />
                </div>

                <button
                  onClick={handleScan}
                  disabled={scanning || !inputContent.trim()}
                  className="w-full bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {scanning ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Scanning...
                    </>
                  ) : (
                    <>
                      <Shield className="w-5 h-5" />
                      Scan Content
                    </>
                  )}
                </button>
              </div>

              {result && (
                <div
                  className={`mt-6 p-6 rounded-xl border-2 ${
                    result.result === 'Safe'
                      ? 'bg-green-50 border-green-200'
                      : 'bg-red-50 border-red-200'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    {result.result === 'Safe' ? (
                      <CheckCircle className="w-8 h-8 text-green-600 flex-shrink-0" />
                    ) : (
                      <AlertTriangle className="w-8 h-8 text-red-600 flex-shrink-0" />
                    )}
                    <div className="flex-1">
                      <h3
                        className={`text-lg font-bold mb-2 ${
                          result.result === 'Safe' ? 'text-green-900' : 'text-red-900'
                        }`}
                      >
                        {result.result}
                      </h3>
                      {result.detectedReasons && (
                        <div className="space-y-2">
                          <p className="text-sm font-medium text-red-800">Detected Issues:</p>
                          <ul className="list-disc list-inside space-y-1">
                            {result.detectedReasons.map((reason, index) => (
                              <li key={index} className="text-sm text-red-700">
                                {reason}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {result.result === 'Safe' && (
                        <p className="text-sm text-green-700">
                          No threats or suspicious patterns detected in the content.
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6 sticky top-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Recent Scans</h3>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {history.length === 0 ? (
                  <p className="text-sm text-slate-500 text-center py-8">No scans yet</p>
                ) : (
                  history.slice(0, 10).map((scan) => (
                    <div
                      key={scan.id}
                      className={`p-3 rounded-lg border ${
                        scan.result === 'Safe'
                          ? 'bg-green-50 border-green-200'
                          : 'bg-red-50 border-red-200'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-medium text-slate-600 uppercase">
                          {scan.scan_type.replace('_', ' ')}
                        </span>
                        <span
                          className={`text-xs font-bold ${
                            scan.result === 'Safe' ? 'text-green-700' : 'text-red-700'
                          }`}
                        >
                          {scan.result}
                        </span>
                      </div>
                      <p className="text-xs text-slate-700 truncate">{scan.input_content}</p>
                      <p className="text-xs text-slate-500 mt-1">
                        {new Date(scan.created_at).toLocaleString()}
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
