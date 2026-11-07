"use client";

import React from "react";
import { Plus, Trash2, ArrowUp, ArrowDown, HelpCircle } from "lucide-react";

export interface FaqItem {
  id?: string;
  question: string;
  answer: string;
  order: number;
}

interface FaqRepeaterProps {
  faqs: FaqItem[];
  onChange: (faqs: FaqItem[]) => void;
  title?: string;
}

export default function FaqRepeater({
  faqs,
  onChange,
  title = "Frequently Asked Questions (Synced with FAQPage Schema)",
}: FaqRepeaterProps) {
  const handleAddFaq = () => {
    onChange([
      ...faqs,
      {
        question: "",
        answer: "",
        order: faqs.length + 1,
      },
    ]);
  };

  const handleUpdate = (index: number, field: "question" | "answer", value: string) => {
    const updated = [...faqs];
    updated[index] = { ...updated[index], [field]: value };
    onChange(updated);
  };

  const handleRemove = (index: number) => {
    const filtered = faqs.filter((_, i) => i !== index);
    const reordered = filtered.map((item, i) => ({ ...item, order: i + 1 }));
    onChange(reordered);
  };

  const handleMove = (index: number, direction: "up" | "down") => {
    const target = direction === "up" ? index - 1 : index + 1;
    if (target < 0 || target >= faqs.length) return;

    const updated = [...faqs];
    const temp = updated[index];
    updated[index] = updated[target];
    updated[target] = temp;

    const reordered = updated.map((item, i) => ({ ...item, order: i + 1 }));
    onChange(reordered);
  };

  return (
    <div className="bg-white dark:bg-[#141416] border border-gray-200 dark:border-[#202025] rounded-xl p-5 shadow-xs space-y-4">
      <div className="flex items-center justify-between border-b border-gray-100 dark:border-[#202025] pb-3">
        <div className="flex items-center gap-2">
          <HelpCircle className="w-4 h-4 text-purple-600 dark:text-purple-400" />
          <h3 className="text-[14px] font-semibold text-gray-900 dark:text-gray-100">{title}</h3>
        </div>
        <button
          type="button"
          onClick={handleAddFaq}
          className="px-3 py-1.5 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/50 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          Add Question
        </button>
      </div>

      <p className="text-xs text-gray-500 dark:text-neutral-400 leading-relaxed">
        FAQs added here render on the page and are automatically packaged into Google-compliant <code className="bg-gray-100 dark:bg-[#202025] px-1 py-0.5 rounded text-gray-800 dark:text-neutral-200">FAQPage</code> structured data for SERP rich results.
      </p>

      {faqs.length === 0 ? (
        <div className="text-center py-8 border border-dashed border-gray-200 dark:border-[#202025] rounded-lg">
          <p className="text-xs text-gray-500 dark:text-neutral-400 mb-3">No FAQs added yet for this item.</p>
          <button
            type="button"
            onClick={handleAddFaq}
            className="px-3.5 py-1.5 bg-gray-900 dark:bg-white text-white dark:text-black rounded-lg text-xs font-medium inline-flex items-center gap-1.5 hover:bg-gray-800 dark:hover:bg-neutral-200 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            Add First FAQ
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="p-4 border border-gray-200 dark:border-[#202025] rounded-xl bg-gray-50/50 dark:bg-[#18181c] space-y-3 relative group"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-bold text-gray-700 dark:text-neutral-300 uppercase">
                  FAQ #{index + 1}
                </span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => handleMove(index, "up")}
                    disabled={index === 0}
                    className="p-1 hover:bg-gray-200 dark:hover:bg-[#26262c] rounded disabled:opacity-30 cursor-pointer text-gray-600 dark:text-neutral-400"
                    title="Move up"
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleMove(index, "down")}
                    disabled={index === faqs.length - 1}
                    className="p-1 hover:bg-gray-200 dark:hover:bg-[#26262c] rounded disabled:opacity-30 cursor-pointer text-gray-600 dark:text-neutral-400"
                    title="Move down"
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRemove(index)}
                    className="p-1 hover:bg-red-50 dark:hover:bg-red-950/40 text-red-500 rounded cursor-pointer ml-1"
                    title="Remove question"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div>
                <input
                  type="text"
                  placeholder="Question (e.g. How far in advance should this cake be ordered?)"
                  value={faq.question}
                  onChange={(e) => handleUpdate(index, "question", e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-white dark:bg-[#101012] text-gray-900 dark:text-white border border-gray-300 dark:border-[#282830] rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none font-medium placeholder-gray-400 dark:placeholder-neutral-500"
                />
              </div>

              <div>
                <textarea
                  rows={2}
                  placeholder="Answer with concise, helpful details..."
                  value={faq.answer}
                  onChange={(e) => handleUpdate(index, "answer", e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-white dark:bg-[#101012] text-gray-900 dark:text-white border border-gray-300 dark:border-[#282830] rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none placeholder-gray-400 dark:placeholder-neutral-500"
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
