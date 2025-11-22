import SEO from '../../components/SEO'
import { Link } from 'react-router-dom'

export default function AISummaryGuide() {
  return (
    <>
      <SEO
        title="AI Tools Guide — How the Summary Tool Works"
        description="Learn how AI summary tools work, JSON schema stability, multilingual support, daily limits, and developer templates."
        keywords="AI tools, AI summary, Supabase Edge Function, Gemini Flash, JSON schema, developer tools"
        url="https://pomodoro-app-eight-rouge.vercel.app/tools/ai-summary"
      />

      {/* 限量提示條 */}
      <div className="w-full bg-yellow-100 text-yellow-800 text-center py-2 text-sm font-medium border-b border-yellow-300">
        🔥 Early Bird — Only 50 Copies Available (50% OFF) | Current Price: $14.5
      </div>

      <main className="max-w-4xl mx-auto px-6 py-12">
        {/* Hero Section */}
        <section className="text-center mb-16">
          <h1 className="text-4xl font-bold mb-4">
            AI Tools Guide
            <span className="block text-blue-600 mt-2">
              How the Summary Tool Works
            </span>
          </h1>

          <p className="text-gray-700 text-lg leading-relaxed max-w-2xl mx-auto mb-6">
            Learn how our AI summary tool works, from JSON schema validation to multilingual support.
            Perfect for developers and content creators.
          </p>

          <div className="flex gap-4 justify-center">
            <Link
              to="/summary"
              className="inline-block px-6 py-3 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white text-lg font-semibold shadow-md hover:shadow-lg hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer"
              style={{ color: '#ffffff !important', fontWeight: 600 }}
              onMouseEnter={(e) => {
                e.currentTarget.style.setProperty('color', '#ffffff', 'important')
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.setProperty('color', '#ffffff', 'important')
              }}
            >
              <span style={{ color: '#ffffff' }}>Try Summary Tool</span>
            </Link>
            <a
              href="https://ko-fi.com/s/b5b4180ff1"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block px-6 py-3 rounded-lg bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white text-lg font-semibold shadow-md hover:shadow-lg hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer"
              style={{ color: '#ffffff !important', fontWeight: 600 }}
              onMouseEnter={(e) => {
                e.currentTarget.style.setProperty('color', '#ffffff', 'important')
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.setProperty('color', '#ffffff', 'important')
              }}
            >
              <span style={{ color: '#ffffff' }}>Buy Template</span>
            </a>
          </div>
        </section>

        {/* Content Sections */}
        <section className="space-y-8 mb-16">
          <div className="p-6 border rounded-xl shadow-sm bg-white">
            <h2 className="text-2xl font-semibold mb-4">🚀 How It Works</h2>
            <p className="text-gray-700 leading-relaxed">
              Our AI summary tool uses Supabase Edge Functions combined with Gemini Flash to generate
              clean, validated JSON summaries. The system enforces JSON Schema validation to ensure
              99% valid JSON output with zero hallucinated keys.
            </p>
          </div>

          <div className="p-6 border rounded-xl shadow-sm bg-white">
            <h2 className="text-2xl font-semibold mb-4">🔧 Technical Stack</h2>
            <ul className="list-disc list-inside text-gray-700 space-y-2">
              <li><strong>Supabase Edge Functions:</strong> Serverless backend with input validation</li>
              <li><strong>Gemini Flash 2.0:</strong> Fast and accurate AI model</li>
              <li><strong>JSON Schema:</strong> Ensures stable, machine-readable output</li>
              <li><strong>React + TypeScript:</strong> Modern frontend framework</li>
            </ul>
          </div>

          <div className="p-6 border rounded-xl shadow-sm bg-white">
            <h2 className="text-2xl font-semibold mb-4">🌐 Features</h2>
            <ul className="list-disc list-inside text-gray-700 space-y-2">
              <li><strong>Automatic Language Detection:</strong> Supports English and Chinese</li>
              <li><strong>Daily Limits:</strong> Free 3 summaries per day (auto-reset at midnight)</li>
              <li><strong>Clean JSON Output:</strong> Validated schema, production-ready</li>
              <li><strong>Multiple Input Types:</strong> Articles, URLs, and YouTube content</li>
            </ul>
          </div>

          <div className="p-6 border rounded-xl shadow-sm bg-white">
            <h2 className="text-2xl font-semibold mb-4">💡 Developer Template</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Want to build your own AI summary tool? Get the full developer template with:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4">
              <li>Complete Supabase Edge Function code</li>
              <li>JSON Schema definitions</li>
              <li>Frontend React components</li>
              <li>Production-ready API setup</li>
            </ul>
            <a
              href="https://ko-fi.com/s/b5b4180ff1"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block px-10 py-4 rounded-lg bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-semibold shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer"
              style={{ color: '#ffffff !important', fontWeight: 600 }}
              onMouseEnter={(e) => {
                e.currentTarget.style.setProperty('color', '#ffffff', 'important')
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.setProperty('color', '#ffffff', 'important')
              }}
            >
              <span style={{ color: '#ffffff' }}>Buy Developer Template →</span>
            </a>
          </div>
        </section>

        {/* Navigation */}
        <section className="text-center py-8 border-t">
          <Link
            to="/"
            className="text-blue-600 hover:text-blue-700 underline"
          >
            ← Back to AI Tools Hub
          </Link>
        </section>
      </main>

      {/* 浮動購買按鈕 */}
      <div className="fixed bottom-4 right-4 z-50">
        <a
          href="https://ko-fi.com/s/b5b4180ff1"
          target="_blank"
          rel="noopener noreferrer"
          className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white px-5 py-3 rounded-full shadow-xl hover:shadow-2xl hover:scale-110 active:scale-95 text-sm font-semibold transition-all duration-200 cursor-pointer"
          style={{ color: '#ffffff !important', fontWeight: 600 }}
          onMouseEnter={(e) => {
            e.currentTarget.style.setProperty('color', '#ffffff', 'important')
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.setProperty('color', '#ffffff', 'important')
          }}
        >
          <span style={{ color: '#ffffff' }}>🚀 Buy Template</span>
        </a>
      </div>
    </>
  )
}

