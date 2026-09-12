import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import RSSButton from "@/components/RSSButton";
import { allPosts } from "./blogIndex";

export default function BlogHome() {
  const [filter, setFilter] = useState("ALL");

  useEffect(() => {
    console.log(allPosts.length);
  }, []);

  const sortedPosts = useMemo(() => {
    const copy = [...allPosts];
    return copy.sort((a, b) => {
      if (a.isSEO && !b.isSEO) return -1;
      if (!a.isSEO && b.isSEO) return 1;
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });
  }, []);

  const displayPosts = useMemo(() => {
    if (filter === "ALL") return sortedPosts;
    return sortedPosts.filter((p) => p.category === filter);
  }, [sortedPosts, filter]);

  return (
    <div className="gradient-bg min-h-screen flex justify-center px-4 py-10">
      <div className="max-w-4xl w-full">
        <div className="bg-white/80 backdrop-blur-lg shadow-xl rounded-2xl p-8 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold">文章</h1>
            <Link
              to="/"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition font-medium"
            >
              回首頁
            </Link>
          </div>
          <p className="text-gray-600 text-center mb-6">
            Focus & Mindfulness Articles
          </p>
          <p className="text-center text-gray-700">
            這些文章將幫助你學會運用番茄鐘、專注訓練與唸經修行來提升工作效能與內在平靜。
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <a
              href="/blog/qr-code"
              className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700 hover:bg-blue-100"
            >
              QR Code 主題文章
            </a>
            <a
              href="/blog/ai-tools"
              className="rounded-lg border border-purple-200 bg-purple-50 px-4 py-2 text-sm font-medium text-purple-700 hover:bg-purple-100"
            >
              AI工具文章
            </a>
          </div>
        </div>

        <div className="flex gap-2 my-6 flex-wrap">
          <button
            type="button"
            onClick={() => setFilter("ALL")}
            className={`px-3 py-2 rounded-lg border transition ${
              filter === "ALL"
                ? "bg-blue-600 text-white border-blue-600"
                : "bg-white/70 text-slate-700 border-slate-200 hover:bg-white"
            }`}
          >
            全部
          </button>
          <button
            type="button"
            onClick={() => setFilter("AI")}
            className={`px-3 py-2 rounded-lg border transition ${
              filter === "AI"
                ? "bg-blue-600 text-white border-blue-600"
                : "bg-white/70 text-slate-700 border-slate-200 hover:bg-white"
            }`}
          >
            AI工具
          </button>
          <button
            type="button"
            onClick={() => setFilter("QR")}
            className={`px-3 py-2 rounded-lg border transition ${
              filter === "QR"
                ? "bg-blue-600 text-white border-blue-600"
                : "bg-white/70 text-slate-700 border-slate-200 hover:bg-white"
            }`}
          >
            QR Code
          </button>
          <button
            type="button"
            onClick={() => setFilter("教學")}
            className={`px-3 py-2 rounded-lg border transition ${
              filter === "教學"
                ? "bg-blue-600 text-white border-blue-600"
                : "bg-white/70 text-slate-700 border-slate-200 hover:bg-white"
            }`}
          >
            教學
          </button>
          <button
            type="button"
            onClick={() => setFilter("理財")}
            className={`px-3 py-2 rounded-lg border transition ${
              filter === "理財"
                ? "bg-blue-600 text-white border-blue-600"
                : "bg-white/70 text-slate-700 border-slate-200 hover:bg-white"
            }`}
          >
            理財
          </button>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {displayPosts.map((article) => (
            <Link
              key={article.path}
              to={article.path}
              className="bg-white/80 backdrop-blur-lg shadow-xl rounded-2xl p-6 hover:shadow-2xl transition-shadow duration-300 block"
            >
              <div className="text-4xl mb-4 text-center">{article.image}</div>
              <h2 className="text-xl font-bold mb-3 text-gray-800">
                {article.title}
                {article.isSEO ? (
                  <span className="ml-2 align-middle text-xs font-semibold text-amber-700 bg-amber-100 px-2 py-0.5 rounded">
                    精選
                  </span>
                ) : null}
              </h2>
              <p className="text-sm text-gray-600 mb-3 italic">
                {article.subtitle}
              </p>
              <p className="text-gray-700 leading-relaxed">
                {article.description}
              </p>
              <div className="mt-4 text-blue-600 font-semibold text-center">
                閱讀全文 →
              </div>
            </Link>
          ))}
        </div>

        <div className="flex justify-center mt-8 mb-4">
          <RSSButton />
        </div>

        <div className="mt-8 text-center text-gray-500 text-sm">
          <p>所有文章由 RxV 夢想創作工作室撰寫 · 保留所有權利</p>
        </div>
      </div>
    </div>
  );
}
