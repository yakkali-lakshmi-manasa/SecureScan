import { useState } from 'react';
import { Shield, FileText, History, Home } from 'lucide-react';
import HomePage from './components/HomePage';
import ContentSafetyScanner from './components/ContentSafetyScanner';
import LegalDocumentAnalyzer from './components/LegalDocumentAnalyzer';
import ScanHistory from './components/ScanHistory';

type Page = 'home' | 'scanner' | 'analyzer' | 'history';

function App() {
  const [activePage, setActivePage] = useState<Page>('home');

  const renderPage = () => {
    switch (activePage) {
      case 'home':
        return <HomePage onNavigate={setActivePage} />;
      case 'scanner':
        return <ContentSafetyScanner />;
      case 'analyzer':
        return <LegalDocumentAnalyzer />;
      case 'history':
        return <ScanHistory onNavigate={setActivePage} />;
      default:
        return <HomePage onNavigate={setActivePage} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {activePage !== 'home' && activePage !== 'history' && (
        <nav className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
          <div className="max-w-6xl mx-auto px-4">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center gap-2 cursor-pointer" onClick={() => setActivePage('home')}>
                <div className="p-2 bg-gradient-to-br from-blue-600 to-amber-600 rounded-lg">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <h1 className="text-xl font-bold text-slate-900">Secure Scan</h1>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setActivePage('home')}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  <Home className="w-4 h-4" />
                  Home
                </button>
                <button
                  onClick={() => setActivePage('scanner')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                    activePage === 'scanner'
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <Shield className="w-4 h-4" />
                  Content Scanner
                </button>
                <button
                  onClick={() => setActivePage('analyzer')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                    activePage === 'analyzer'
                      ? 'bg-amber-600 text-white'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <FileText className="w-4 h-4" />
                  Document Analyzer
                </button>
                <button
                  onClick={() => setActivePage('history')}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  <History className="w-4 h-4" />
                  History
                </button>
              </div>
            </div>
          </div>
        </nav>
      )}

      {renderPage()}
    </div>
  );
}

export default App;
