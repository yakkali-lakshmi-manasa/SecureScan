import { Shield, FileText, History, ArrowRight, CheckCircle, Zap, Lock } from 'lucide-react';

interface HomePageProps {
  onNavigate: (page: 'scanner' | 'analyzer' | 'history') => void;
}

export default function HomePage({ onNavigate }: HomePageProps) {
  const features = [
    {
      icon: Lock,
      title: 'Advanced Threat Detection',
      description: 'Detect phishing, spam, and malicious content in real-time',
    },
    {
      icon: Zap,
      title: 'Lightning Fast Analysis',
      description: 'Get instant results with our optimized scanning algorithms',
    },
    {
      icon: CheckCircle,
      title: 'Legal Document Validation',
      description: 'Verify and extract key information from legal documents',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center p-4 bg-gradient-to-br from-blue-500 to-amber-500 rounded-2xl mb-6">
            <Shield className="w-16 h-16 text-white" />
          </div>
          <h1 className="text-5xl font-bold text-white mb-4">
            Secure Scan
          </h1>
          <p className="text-xl text-blue-200 max-w-2xl mx-auto">
            Analyze and safeguard your digital content and legal documents. Detect risks, highlight critical terms, and ensure safety with smart, automated insights.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-16">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all"
              >
                <div className="p-3 bg-blue-500/20 rounded-xl w-fit mb-4">
                  <Icon className="w-6 h-6 text-blue-300" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-blue-200 text-sm">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <div
            onClick={() => onNavigate('scanner')}
            className="group bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl p-8 cursor-pointer hover:shadow-2xl hover:scale-105 transition-all border border-blue-400"
          >
            <div className="flex items-start justify-between mb-6">
              <div className="p-4 bg-white/20 rounded-xl">
                <Shield className="w-10 h-10 text-white" />
              </div>
              <ArrowRight className="w-6 h-6 text-white/60 group-hover:text-white group-hover:translate-x-1 transition-all" />
            </div>
            <h2 className="text-3xl font-bold text-white mb-3">
              Content Safety Scanner
            </h2>
            <p className="text-blue-100 mb-6">
              Scan and analyze various types of content for potential security threats and harmful material.
            </p>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-blue-50 text-sm">
                <CheckCircle className="w-4 h-4" />
                <span>Plain text analysis</span>
              </div>
              <div className="flex items-center gap-2 text-blue-50 text-sm">
                <CheckCircle className="w-4 h-4" />
                <span>Website URL scanning</span>
              </div>
              <div className="flex items-center gap-2 text-blue-50 text-sm">
                <CheckCircle className="w-4 h-4" />
                <span>Email address validation</span>
              </div>
              <div className="flex items-center gap-2 text-blue-50 text-sm">
                <CheckCircle className="w-4 h-4" />
                <span>QR code verification</span>
              </div>
            </div>
          </div>

          <div
            onClick={() => onNavigate('analyzer')}
            className="group bg-gradient-to-br from-amber-600 to-amber-700 rounded-2xl p-8 cursor-pointer hover:shadow-2xl hover:scale-105 transition-all border border-amber-400"
          >
            <div className="flex items-start justify-between mb-6">
              <div className="p-4 bg-white/20 rounded-xl">
                <FileText className="w-10 h-10 text-white" />
              </div>
              <ArrowRight className="w-6 h-6 text-white/60 group-hover:text-white group-hover:translate-x-1 transition-all" />
            </div>
            <h2 className="text-3xl font-bold text-white mb-3">
               Legal Document Analyzer
            </h2>
            <p className="text-amber-100 mb-6">
              Upload and analyze legal documents to extract key information and identify potential risks.
            </p>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-amber-50 text-sm">
                <CheckCircle className="w-4 h-4" />
                <span>PDF & Word document support</span>
              </div>
              <div className="flex items-center gap-2 text-amber-50 text-sm">
                <CheckCircle className="w-4 h-4" />
                <span>Extract names, dates & terms</span>
              </div>
              <div className="flex items-center gap-2 text-amber-50 text-sm">
                <CheckCircle className="w-4 h-4" />
                <span>Highlight risky phrases</span>
              </div>
              <div className="flex items-center gap-2 text-amber-50 text-sm">
                <CheckCircle className="w-4 h-4" />
                <span>Plain-language summaries</span>
              </div>
            </div>
          </div>
        </div>

        <div className="text-center">
          <button
            onClick={() => onNavigate('history')}
            className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-lg text-white px-8 py-4 rounded-xl font-semibold hover:bg-white/20 transition-all border border-white/20"
          >
            <History className="w-5 h-5" />
            View Scan History
          </button>
        </div>
      </div>
    </div>
  );
}
