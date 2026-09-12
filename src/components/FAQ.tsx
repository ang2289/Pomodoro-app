import React from 'react';

type QA = { q: string; a: string };

export default function FAQ({ items, title = '常見問題' }: { items: QA[]; title?: string }) {
  if (!items?.length) return null;

  return (
    <section className="mt-8">
      <h2 className="text-xl font-bold mb-4">{title}</h2>
      <ul className="space-y-3">
        {items.map((it, idx) => (
          <li key={idx} className="p-4 rounded-lg border">
            <p className="font-semibold mb-1">Q：{it.q}</p>
            <p className="text-gray-700 leading-relaxed">A：{it.a}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
