'use client';

import React, { useState, useEffect } from 'react';
import Sidebar, { Category } from '@/components/Sidebar';
import Editor from '@/components/Editor';
import { cn } from '@/lib/utils';
import { Plus, Clock, ChevronRight, ArrowLeft, Edit3, Save, Trash2 } from 'lucide-react';

export default function Home() {
  const [articles, setArticles] = useState<any[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [viewMode, setViewMode] = useState<'list' | 'view' | 'edit'>('list');
  const [currentArticle, setCurrentArticle] = useState<any>({
    title: '',
    content: '',
    date: new Date().toISOString()
  });
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchArticles = async () => {
    try {
      const res = await fetch('/api/articles');
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      const sortedData = data.sort((a: any, b: any) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      );
      setArticles(sortedData);
      
      const catMap: Record<string, Record<string, any[]>> = {};
      sortedData.forEach((art: any) => {
        if (!catMap[art.year]) catMap[art.year] = {};
        if (!catMap[art.year][art.month]) catMap[art.year][art.month] = [];
        catMap[art.year][art.month].push(art);
      });

      const formattedCats: Category[] = Object.keys(catMap)
        .sort((a, b) => b.localeCompare(a))
        .map(year => ({
          year,
          months: Object.keys(catMap[year])
            .sort((a, b) => Number(b) - Number(a))
            .map(month => ({
              month,
              articles: catMap[year][month]
            }))
        }));
      
      setCategories(formattedCats);
    } catch (err) {
      console.error('Failed to fetch articles', err);
    }
  };

  useEffect(() => {
    fetchArticles();
  }, []);

  const handleSelectArticle = async (id: string) => {
    try {
      const res = await fetch(`/api/articles/${id}`);
      const data = await res.json();
      setCurrentArticle(data);
      setViewMode('view');
    } catch (err) {
      console.error('Error loading article', err);
    }
  };

  const handleNewArticle = () => {
    setCurrentArticle({
      title: '',
      content: '',
      date: new Date().toISOString()
    });
    setViewMode('edit');
  };

  const handleSave = async () => {
    if (!currentArticle.title) {
      const title = window.prompt('글 제목을 입력하세요');
      if (!title) return;
      currentArticle.title = title;
    }

    setIsSaving(true);
    try {
      const res = await fetch('/api/articles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(currentArticle)
      });
      if (res.ok) {
        alert('저장되었습니다!');
        await fetchArticles();
        setViewMode('view');
      }
    } catch (err) {
      alert('저장 실패');
    } finally {
      setIsSaving(false);
    }
  };

  const handleEditDirectly = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    try {
      const res = await fetch(`/api/articles/${id}`);
      const data = await res.json();
      setCurrentArticle(data);
      setViewMode('edit');
    } catch (err) {
      console.error('Error loading article', err);
    }
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!window.confirm('정말로 이 리포트를 삭제하시겠습니까? 파일이 영구적으로 제거됩니다.')) return;

    setDeletingId(id);
    try {
      const res = await fetch(`/api/articles/${id}`, { method: 'DELETE' });
      if (res.ok) {
        await fetchArticles();
      }
    } catch (err) {
      alert('삭제 실패');
    } finally {
      setDeletingId(null);
    }
  };

  const handleCancel = () => {
    if (!currentArticle.id) {
      setViewMode('list');
    } else {
      setViewMode('view');
    }
  };

  return (
    <main className="min-h-screen bg-[#fcfdfa] flex">
      <Sidebar 
        categories={categories} 
        onSelectArticle={handleSelectArticle}
        onNewArticle={handleNewArticle}
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
      />
      
      <div className={cn(
        "flex-1 transition-all duration-300 p-4 md:p-10 pt-20",
        isSidebarOpen ? "md:ml-64" : "ml-0"
      )}>
        <div className="max-w-7xl mx-auto">
          {viewMode === 'list' ? (
            <div className="space-y-8">
              <div className="flex justify-between items-end border-b border-lime-100 pb-6">
                <div>
                  <h1 className="text-4xl font-black text-gray-900 tracking-tight">SNU Lab Log</h1>
                  <p className="text-gray-500 mt-2">연구 기록 및 실험 리포트를 관리합니다.</p>
                </div>
                <button
                  onClick={handleNewArticle}
                  className="bg-lime-500 hover:bg-lime-600 text-white px-6 py-3 rounded-full font-bold flex items-center gap-2 shadow-lg shadow-lime-200 transition-all transform hover:-translate-y-1"
                >
                  <Plus size={20} />
                  새 리포트 작성
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {articles.length > 0 ? (
                  articles.map((article) => (
                    <div 
                      key={article.id}
                      onClick={() => handleSelectArticle(article.id)}
                      className="group bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:border-lime-200 transition-all cursor-pointer flex flex-col justify-between h-64"
                    >
                      <div>
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex items-center gap-2 text-lime-600">
                            <Clock size={14} />
                            <span className="text-xs font-bold uppercase tracking-wider">
                              {new Date(article.date).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button 
                              onClick={(e) => handleEditDirectly(e, article.id)}
                              className="p-2 bg-gray-50 text-gray-500 hover:bg-lime-50 hover:text-lime-600 rounded-full transition-colors"
                              title="수정하기"
                            >
                              <Edit3 size={16} />
                            </button>
                                                      <button 
                                                        onClick={(e) => handleDelete(e, article.id)}
                                                        disabled={deletingId === article.id}
                                                        className={cn(
                                                          "p-2 rounded-full transition-colors",
                                                          deletingId === article.id 
                                                            ? "bg-red-100 text-red-600 animate-pulse cursor-not-allowed" 
                                                            : "bg-gray-50 text-gray-400 hover:bg-red-50 hover:text-red-500"
                                                        )}
                                                        title={deletingId === article.id ? "삭제 중..." : "삭제하기"}
                                                      >
                                                        <Trash2 size={16} />
                                                      </button>                          </div>
                        </div>
                        <h3 className="text-xl font-bold text-gray-800 group-hover:text-lime-600 transition-colors line-clamp-3 mb-4">
                          {article.title}
                        </h3>
                      </div>
                      <div className="flex items-center text-gray-400 text-sm font-medium">
                        자세히 보기 <ChevronRight size={16} className="ml-1 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-span-full py-24 text-center bg-white rounded-3xl border-2 border-dashed border-lime-100 flex flex-col items-center justify-center">
                    <button
                      onClick={handleNewArticle}
                      className="group/plus bg-lime-50 p-5 rounded-full mb-6 hover:bg-lime-100 hover:scale-110 transition-all shadow-sm active:scale-95"
                    >
                      <Plus size={32} className="text-lime-500 group-hover/plus:rotate-90 transition-transform duration-300" />
                    </button>
                    <p className="text-gray-500 text-lg font-bold">작성된 글이 없습니다.</p>
                    <p className="text-gray-400 mt-2">중앙의 버튼을 눌러 첫 번째 연구 기록을 시작해보세요!</p>
                  </div>
                )}
              </div>
            </div>
          ) : viewMode === 'view' ? (
            <div className="space-y-6 animate-in fade-in duration-500">
              <div className="flex justify-between items-center mb-8">
                <button 
                  onClick={() => setViewMode('list')}
                  className="flex items-center gap-2 text-gray-400 hover:text-lime-600 transition-colors font-medium"
                >
                  <ArrowLeft size={18} />
                  목록으로
                </button>
                <button 
                  onClick={() => setViewMode('edit')}
                  className="flex items-center gap-2 bg-lime-50 text-lime-600 px-4 py-2 rounded-full hover:bg-lime-100 transition-colors font-bold"
                >
                  <Edit3 size={18} />
                  수정하기
                </button>
              </div>

              <h1 className="text-5xl font-black text-gray-900 leading-tight">{currentArticle.title}</h1>
              <div className="flex items-center gap-4 text-sm text-gray-400 border-b border-gray-100 pb-8">
                <span className="font-bold text-gray-500">
                  {new Date(currentArticle.date).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' })}
                </span>
              </div>

              <div 
                className="prose prose-slate max-w-none py-10 min-h-[500px]"
                dangerouslySetInnerHTML={{ __html: currentArticle.content }}
              />
            </div>
          ) : (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex justify-between items-center">
                <button 
                  onClick={handleCancel}
                  className="flex items-center gap-2 text-gray-400 hover:text-lime-600 transition-colors font-medium mb-4"
                >
                  <ArrowLeft size={18} />
                  취소하고 돌아가기
                </button>
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className={cn(
                    "bg-lime-500 text-white px-6 py-2 rounded-full font-bold flex items-center gap-2 shadow-md transition-all",
                    isSaving ? "opacity-70 cursor-not-allowed" : "hover:bg-lime-600"
                  )}
                >
                  <Save size={18} className={cn(isSaving && "animate-pulse")} />
                  {isSaving ? '저장 중...' : '저장하기'}
                </button>
              </div>

              <input
                type="text"
                placeholder="제목을 입력하세요..."
                value={currentArticle.title}
                onChange={(e) => setCurrentArticle({ ...currentArticle, title: e.target.value })}
                className="w-full text-5xl font-black bg-transparent border-none outline-none placeholder-gray-200 text-gray-900 py-4 leading-tight mb-4"
              />
              
              <Editor 
                content={currentArticle.content}
                onChange={(content) => setCurrentArticle({ ...currentArticle, content })}
                onSave={handleSave}
              />
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
