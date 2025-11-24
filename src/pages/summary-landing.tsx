import SEO from '../components/SEO'

export default function SummaryLanding() {
  return (
    <>
      <SEO
        title="AI Summary Tool — Fast, Accurate, and Schema-Safe"
        description="A modern AI summary tool powered by Supabase Edge Functions + Gemini Flash. Get clean, validated JSON summaries instantly. Perfect for developers, content creators, and automation workflows."
        keywords="AI summary tool, JSON schema, Supabase Edge Function, Gemini, article summarizer, developer tools"
        url="https://pomodoro-app-eight-rouge.vercel.app/summary-landing"
      />

      <main className="max-w-4xl mx-auto px-6 py-12">
        {/* Hero Section */}
        <section className="text-center mb-16">
          <h1 className="text-4xl font-bold mb-4">
            AI Summary Tool{' '}
            <span className="block text-blue-600">
              Clean JSON Output, Every Time
            </span>
          </h1>

          <p className="text-gray-700 text-lg leading-relaxed max-w-2xl mx-auto">
            Summarize articles, URLs, and YouTube videos using a stable JSON schema
            enforced by Supabase Edge Functions.{' '}
            99% valid JSON. Zero hallucinated keys. Perfect for production.
          </p>

          <a
            href="https://pomodoro-app-eight-rouge.vercel.app/summary"
            className="mt-6 inline-block bg-blue-600 text-white px-6 py-3 rounded-lg text-lg font-semibold hover:bg-blue-700 transition"
          >
            Try Free Version (3 summaries/day)
          </a>

          <div className="mt-4 text-sm text-gray-500">
            No signup. No login. Instant usage.
          </div>
        </section>

        {/* Features */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          <div className="p-6 border rounded-xl shadow-sm bg-white">
            <h3 className="text-xl font-semibold mb-3">🚀 Clean JSON Output</h3>
            <p className="text-gray-600">
              Enforced with JSON Schema to ensure stable, machine-readable responses.
            </p>
          </div>

          <div className="p-6 border rounded-xl shadow-sm bg-white">
            <h3 className="text-xl font-semibold mb-3">🔧 Production-Ready Edge Function</h3>
            <p className="text-gray-600">
              Powered by Supabase Edge Functions with input validation & error handling.
            </p>
          </div>

          <div className="p-6 border rounded-xl shadow-sm bg-white">
            <h3 className="text-xl font-semibold mb-3">🌐 Bilingual Support</h3>
            <p className="text-gray-600">
              Automatically supports both English and Chinese inputs.
            </p>
          </div>

          <div className="p-6 border rounded-xl shadow-sm bg-white">
            <h3 className="text-xl font-semibold mb-3">💵 Free 3 Summaries per Day</h3>
            <p className="text-gray-600">
              Unlimited version available via the developer template.
            </p>
          </div>
        </section>

        {/* CTA Section */}
        <section className="text-center py-12 bg-gray-50 rounded-2xl border mb-16">
          <h2 className="text-3xl font-bold mb-4">
            Want Unlimited Summaries?
          </h2>

          <p className="text-gray-700 text-lg mb-6">
            Get the full developer template with the exact Supabase Edge Function,
            JSON schema, and production-ready API.
          </p>

          <a
            href="https://ko-fi.com/s/b5b4180ff1"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block bg-green-600 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-green-700 transition"
          >
            Buy Developer Template →
          </a>

          <div className="mt-3 text-sm text-gray-500">
            One-time purchase. Instant download.
          </div>
        </section>

        {/* Bottom Section */}
        <section className="text-center text-gray-600 text-sm">
          Built with Supabase · Gemini Flash · React
          <br />
          © 2025 RxV Dream Studio
        </section>
      </main>
    </>
  )
}








