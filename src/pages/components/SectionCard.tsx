import type { ReactNode } from 'react';

type SectionCardProps = {
  title: ReactNode;
  children: ReactNode;
  className?: string;
};

export default function SectionCard({ title, children, className = '' }: SectionCardProps) {
  return (
    <section className={`rounded-2xl border border-slate-200 bg-white p-5 shadow-sm ${className}`.trim()}>
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
      </div>
      <div>{children}</div>
    </section>
  );
}
