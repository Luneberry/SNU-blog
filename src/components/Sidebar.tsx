'use client';

import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, FolderOpen, FileText, Calendar, Menu } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

export interface Category {
  year: string;
  months: {
    month: string;
    articles: { id: string; title: string }[];
  }[];
}

interface SidebarProps {
  categories: Category[];
  onSelectArticle: (id: string) => void;
  onNewArticle: () => void;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

function Sidebar({ categories, onSelectArticle, onNewArticle, isOpen, setIsOpen }: SidebarProps) {
  const [expandedYears, setExpandedYears] = useState<string[]>([]);

  const toggleYear = (year: string) => {
    setExpandedYears(prev => 
      prev.includes(year) ? prev.filter(y => y !== year) : [...prev, year]
    );
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 left-4 z-50 p-2 bg-lime-500 text-white rounded-full shadow-lg hover:bg-lime-600 transition-colors"
      >
        <Menu size={20} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.aside
            initial={{ x: -300 }}
            animate={{ x: 0 }}
            exit={{ x: -300 }}
            className="fixed top-0 left-0 h-full w-64 bg-slate-50 border-r border-gray-200 z-40 overflow-y-auto pt-16 shadow-xl"
          >
            <div className="p-4">
              <button
                onClick={onNewArticle}
                className="w-full py-2 px-4 bg-lime-500 text-white rounded-md mb-6 hover:bg-lime-600 transition-colors flex items-center justify-center gap-2 font-medium"
              >
                <FileText size={18} />
                새 글 작성
              </button>

              <div className="space-y-4">
                <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                  <FolderOpen size={16} />
                  Articles
                </h2>
                
                {categories.map((cat) => (
                  <div key={cat.year} className="space-y-1">
                    <button
                      onClick={() => toggleYear(cat.year)}
                      className="w-full flex items-center justify-between p-2 hover:bg-lime-100 rounded-md text-gray-700 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <Calendar size={16} className="text-lime-600" />
                        <span className="font-medium">{cat.year}년</span>
                      </div>
                      {expandedYears.includes(cat.year) ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
                    </button>

                    {expandedYears.includes(cat.year) && (
                      <div className="ml-4 space-y-2 pt-1 border-l-2 border-lime-200">
                        {cat.months.map((m) => (
                          <div key={m.month} className="space-y-1">
                            <div className="px-4 py-1 text-xs font-bold text-gray-400">
                              {m.month}월
                            </div>
                            {m.articles.map((article) => (
                              <button
                                key={article.id}
                                onClick={() => onSelectArticle(article.id)}
                                className="w-full text-left px-4 py-1.5 text-sm text-gray-600 hover:text-lime-600 hover:bg-lime-50 transition-all truncate"
                              >
                                {article.title}
                              </button>
                            ))}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
}

export default Sidebar;