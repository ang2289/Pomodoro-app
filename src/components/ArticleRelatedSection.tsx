import { Link } from 'react-router-dom'
import type { ArticleToolBadge } from './ArticleToolCTA'

export interface ArticleRelatedItem {
  title: string
  desc: string
  link: string
}

export interface ToolRelatedItem {
  title: string
  desc: string
  link: string
  badge?: ArticleToolBadge
}

export interface ArticleRelatedSectionProps {
  articleHeading: string
  toolHeading: string
  articles: ArticleRelatedItem[]
  tools: ToolRelatedItem[]
}

const badgeClass: Record<ArticleToolBadge, string> = {
  '免費工具': 'bg-emerald-100 text-emerald-800',
  '熱門工具': 'bg-amber-100 text-amber-800',
  'AI工具': 'bg-violet-100 text-violet-800',
  '生活工具': 'bg-sky-100 text-sky-800',
}

const cardClass =
  'flex flex-col rounded-2xl border border-slate-200 bg-white p-5 transition-all duration-200 hover:shadow-lg hover:-translate-y-1'

export default function ArticleRelatedSection({
  articleHeading,
  toolHeading,
  articles,
  tools,
}: ArticleRelatedSectionProps) {
  return (
    <section className="not-prose mt-12">
      <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6 md:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 左欄：相關文章 */}
          <div>
            <h3 className="text-lg font-semibold text-slate-900 mb-4">{articleHeading}</h3>
            <div className="space-y-4">
              {articles.map((item) => (
                <Link
                  key={item.link}
                  to={item.link}
                  className={`block ${cardClass}`}
                >
                  <span className="font-semibold text-slate-900">{item.title}</span>
                  <span className="text-sm text-slate-600 mt-1 leading-relaxed block">{item.desc}</span>
                </Link>
              ))}
            </div>
          </div>

          {/* 右欄：相關工具 */}
          <div>
            <h3 className="text-lg font-semibold text-slate-900 mb-4">{toolHeading}</h3>
            <div className="space-y-4">
              {tools.map((item) => (
                <Link
                  key={item.link}
                  to={item.link}
                  className={`block ${cardClass}`}
                >
                  {item.badge && (
                    <span
                      className={`inline-flex w-fit rounded-full px-2.5 py-0.5 text-xs font-medium mb-3 ${badgeClass[item.badge]}`}
                    >
                      {item.badge}
                    </span>
                  )}
                  <span className="font-semibold text-slate-900">{item.title}</span>
                  <span className="text-sm text-slate-600 mt-1 leading-relaxed block">{item.desc}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
