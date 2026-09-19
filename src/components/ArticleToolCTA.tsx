import { Link } from 'react-router-dom'

export type ArticleToolBadge = '免費工具' | '熱門工具' | 'AI工具' | '生活工具'

export interface ArticleToolCTAItem {
  title: string
  desc: string
  link: string
  badge?: ArticleToolBadge
}

export interface ArticleToolCTAProps {
  heading: string
  subheading?: string
  items: ArticleToolCTAItem[]
}

const badgeClass: Record<ArticleToolBadge, string> = {
  '免費工具': 'bg-emerald-100 text-emerald-800',
  '熱門工具': 'bg-amber-100 text-amber-800',
  'AI工具': 'bg-violet-100 text-violet-800',
  '生活工具': 'bg-sky-100 text-sky-800',
}

export default function ArticleToolCTA({ heading, subheading, items }: ArticleToolCTAProps) {
  return (
    <section className="not-prose mt-12">
      <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6 md:p-8">
        <h3 className="text-lg font-semibold text-slate-900 mb-1">
          {heading}
        </h3>
        {subheading && (
          <p className="text-sm text-slate-600 mb-6 leading-relaxed">
            {subheading}
          </p>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((item) => (
            <Link
              key={item.link}
              to={item.link}
              className="flex flex-col rounded-2xl border border-slate-200 bg-white p-5 transition-all duration-200 hover:shadow-lg hover:-translate-y-1"
            >
              {item.badge && (
                <span
                  className={`inline-flex w-fit rounded-full px-2.5 py-0.5 text-xs font-medium mb-3 ${badgeClass[item.badge]}`}
                >
                  {item.badge}
                </span>
              )}
              <span className="font-semibold text-slate-900">{item.title}</span>
              <span className="text-sm text-slate-600 mt-1 leading-relaxed">{item.desc}</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
