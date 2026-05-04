'use client';
export const dynamic = 'force-dynamic';
import { useState, useEffect } from 'react';
import AdminHeader from '@/components/admin/AdminHeader';
import { useAdmin } from '@/components/admin/AdminContext';
import { supabase } from '@/lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import { toast, Toaster } from 'react-hot-toast';

export default function QuizStudioPage() {
  const { lang } = useAdmin();
  const [activeTab, setActiveTab] = useState<'analytics' | 'editor'>('analytics');
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('quiz_submissions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSubmissions(data || []);
    } catch (err) {
      console.error('Failed to fetch submissions:', err);
    } finally {
      setLoading(false);
    }
  };

  const [quizConfig, setQuizConfig] = useState<any[]>([]);

  const fetchQuizConfig = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('quiz_config')
        .select('*, quiz_options(*)');

      if (error) throw error;
      setQuizConfig(data || []);
    } catch (err) {
      console.error('Failed to fetch quiz config:', err);
    } finally {
      setLoading(false);
    }
  };

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<any>(null);

  const startEditing = (config: any) => {
    setEditingId(config.id);
    setEditForm({ ...config });
  };

  const [deletedOptionIds, setDeletedOptionIds] = useState<number[]>([]);

  const handleSave = async () => {
    try {
      setLoading(true);
      
      // 1. Update Config (Titles)
      const { error: configError } = await supabase
        .from('quiz_config')
        .update({
          title_ko: editForm.title_ko,
          title_en: editForm.title_en,
          subtitle_ko: editForm.subtitle_ko,
          subtitle_en: editForm.subtitle_en
        })
        .eq('id', editingId);

      if (configError) throw configError;

      // 2. Handle Deleted Options
      if (deletedOptionIds.length > 0) {
        const { error: delError } = await supabase
          .from('quiz_options')
          .delete()
          .in('id', deletedOptionIds);
        if (delError) throw delError;
      }

      // 3. Update or Insert Options
      for (const opt of editForm.quiz_options) {
        if (typeof opt.id === 'number' && opt.id > 0) {
          // Update existing
          const { error: optError } = await supabase
            .from('quiz_options')
            .update({
              label_ko: opt.label_ko,
              label_en: opt.label_en,
              score: opt.score,
              emoji: opt.emoji,
              sub_text_en: opt.sub_text_en
            })
            .eq('id', opt.id);
          if (optError) throw optError;
        } else {
          // Insert new
          const { error: insError } = await supabase
            .from('quiz_options')
            .insert([{
              config_id: editingId,
              label_ko: opt.label_ko,
              label_en: opt.label_en,
              score: opt.score,
              emoji: opt.emoji,
              sub_text_en: opt.sub_text_en
            }]);
          if (insError) throw insError;
        }
      }
      
      toast.success(lang === 'ko' ? '모든 변경사항이 저장되었습니다.' : 'All changes saved successfully.');
      setEditingId(null);
      setDeletedOptionIds([]);
      fetchQuizConfig();
    } catch (err) {
      console.error('Save failed:', err);
      toast.error(lang === 'ko' ? '저장 실패' : 'Save failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleOptionChange = (optId: any, field: string, value: any) => {
    const updatedOptions = editForm.quiz_options.map((o: any) => 
      o.id === optId ? { ...o, [field]: value } : o
    );
    setEditForm({ ...editForm, quiz_options: updatedOptions });
  };

  const addOption = () => {
    const newOpt = {
      id: `new-${Date.now()}`,
      label_ko: '새 선택지',
      label_en: 'New Option',
      score: 0,
      emoji: '✨',
      sub_text_en: ''
    };
    setEditForm({ ...editForm, quiz_options: [...editForm.quiz_options, newOpt] });
  };

  const deleteOption = (optId: any) => {
    if (typeof optId === 'number') {
      setDeletedOptionIds([...deletedOptionIds, optId]);
    }
    const filtered = editForm.quiz_options.filter((o: any) => o.id !== optId);
    setEditForm({ ...editForm, quiz_options: filtered });
  };

  useEffect(() => {
    const loadData = async () => {
      if (activeTab === 'analytics') {
        await fetchSubmissions();
      } else if (activeTab === 'editor') {
        await fetchQuizConfig();
      }
    };
    loadData();
  }, [activeTab]);

  return (
    <>
      <Toaster position="top-right" />
      <AdminHeader title="Quiz Studio." titleKo="퀴즈 스튜디오." />
      
      <div className="admin-tabs" style={{ marginBottom: '30px', display: 'flex', gap: '20px', borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
        <button 
          onClick={() => setActiveTab('analytics')}
          style={{ padding: '15px 5px', fontSize: '0.9rem', fontWeight: 600, color: activeTab === 'analytics' ? 'var(--p-blue)' : '#94A3B8', borderBottom: activeTab === 'analytics' ? '2px solid var(--p-blue)' : 'none', background: 'none', cursor: 'pointer' }}
        >
          {lang === 'ko' ? '퀴즈 결과 분석' : 'Quiz Analytics'}
        </button>
        <button 
          onClick={() => setActiveTab('editor')}
          style={{ padding: '15px 5px', fontSize: '0.9rem', fontWeight: 600, color: activeTab === 'editor' ? 'var(--p-blue)' : '#94A3B8', borderBottom: activeTab === 'editor' ? '2px solid var(--p-blue)' : 'none', background: 'none', cursor: 'pointer' }}
        >
          {lang === 'ko' ? '퀴즈 질문 편집' : 'Quiz Editor'}
        </button>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'analytics' ? (
          <motion.div key="analytics" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
            <div className="admin-glass-card" style={{ padding: '0' }}>
              {loading && !submissions.length ? (
                <div style={{ padding: '100px', textAlign: 'center' }}>
                  <div className="admin-loading-spinner" style={{ margin: '0 auto' }} />
                </div>
              ) : (
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>{lang === 'ko' ? '날짜' : 'Date'}</th>
                      <th>{lang === 'ko' ? '이메일' : 'Email'}</th>
                      <th>{lang === 'ko' ? '점수' : 'Score'}</th>
                      <th>{lang === 'ko' ? '등급' : 'Tier'}</th>
                      <th>{lang === 'ko' ? '유입 경로' : 'Source'}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {submissions.length === 0 ? (
                      <tr>
                        <td colSpan={5} style={{ textAlign: 'center', padding: '60px', color: '#94A3B8' }}>
                          {lang === 'ko' ? '아직 제출된 퀴즈가 없습니다.' : 'No submissions yet.'}
                        </td>
                      </tr>
                    ) : (
                      submissions.map((sub) => (
                        <tr key={sub.id}>
                          <td style={{ fontSize: '0.8rem', color: '#94A3B8' }}>{new Date(sub.created_at).toLocaleDateString()}</td>
                          <td style={{ fontWeight: 600 }}>{sub.email || 'Anonymous'}</td>
                          <td style={{ fontWeight: 700, color: 'var(--p-blue)' }}>{sub.score}</td>
                          <td>
                            <span className={`status-chip status-${sub.tier === 'danger' ? 'pending' : 'done'}`}>
                              {sub.tier?.toUpperCase()}
                            </span>
                          </td>
                          <td style={{ fontSize: '0.8rem', color: '#94A3B8' }}>{sub.utm_source || '-'}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              )}
            </div>
          </motion.div>
        ) : (
          <motion.div key="editor" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
            <div className="grid gap-6">
              {loading && !quizConfig.length ? (
                <div style={{ padding: '100px', textAlign: 'center' }}>
                  <div className="admin-loading-spinner" style={{ margin: '0 auto' }} />
                </div>
              ) : (
                quizConfig.map((config) => (
                  <div key={config.id} className="admin-glass-card" style={{ padding: '30px' }}>
                    {editingId === config.id ? (
                      <div className="flex flex-col gap-8">
                        <div className="flex justify-between items-center pb-4 border-bottom border-gray-100">
                          <h4 className="font-bold text-blue-600 text-lg">Step {config.step_order} Master Edit</h4>
                          <div className="flex gap-2">
                            <button onClick={() => setEditingId(null)} className="admin-btn-secondary" style={{ padding: '8px 15px' }}>Cancel</button>
                            <button onClick={handleSave} className="admin-btn-primary" style={{ padding: '8px 25px', background: 'var(--p-blue)', color: 'white', borderRadius: '10px', fontWeight: 600 }}>Save All Changes</button>
                          </div>
                        </div>
                        
                        {/* Title & Subtitle Edit */}
                        <div className="grid grid-cols-2 gap-8">
                          <div className="space-y-4 p-5 bg-gray-50/50 rounded-2xl">
                            <h5 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Korean Content</h5>
                            <div>
                              <label className="block text-xs font-semibold text-gray-500 mb-1">Main Title</label>
                              <input className="w-full p-3 rounded-xl border border-gray-200 bg-white" value={editForm.title_ko} onChange={e => setEditForm({...editForm, title_ko: e.target.value})} />
                            </div>
                            <div>
                              <label className="block text-xs font-semibold text-gray-500 mb-1">Subtitle</label>
                              <textarea className="w-full p-3 rounded-xl border border-gray-200 bg-white" rows={2} value={editForm.subtitle_ko} onChange={e => setEditForm({...editForm, subtitle_ko: e.target.value})} />
                            </div>
                          </div>
                          <div className="space-y-4 p-5 bg-gray-50/50 rounded-2xl">
                            <h5 className="text-xs font-bold text-gray-400 uppercase tracking-widest">English Content</h5>
                            <div>
                              <label className="block text-xs font-semibold text-gray-500 mb-1">Main Title</label>
                              <input className="w-full p-3 rounded-xl border border-gray-200 bg-white" value={editForm.title_en} onChange={e => setEditForm({...editForm, title_en: e.target.value})} />
                            </div>
                            <div>
                              <label className="block text-xs font-semibold text-gray-500 mb-1">Subtitle</label>
                              <textarea className="w-full p-3 rounded-xl border border-gray-200 bg-white" rows={2} value={editForm.subtitle_en} onChange={e => setEditForm({...editForm, subtitle_en: e.target.value})} />
                            </div>
                          </div>
                        </div>

                        {/* Options Edit */}
                        <div className="space-y-4">
                          <div className="flex justify-between items-center">
                            <h5 className="text-sm font-bold text-gray-800">Edit Choices & Options</h5>
                            <button 
                              onClick={addOption}
                              className="text-xs font-bold text-blue-600 hover:text-blue-700 bg-blue-50 px-3 py-1.5 rounded-lg transition-colors"
                            >
                              + Add New Option
                            </button>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {editForm.quiz_options.map((opt: any) => (
                              <div key={opt.id} className="p-5 border border-gray-100 rounded-2xl bg-white shadow-sm flex flex-col gap-3 relative group">
                                <button 
                                  onClick={() => deleteOption(opt.id)}
                                  className="absolute top-3 right-3 text-gray-300 hover:text-red-500 transition-colors p-1"
                                  title="Delete Option"
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                  </svg>
                                </button>

                                <div className="flex gap-2 items-center">
                                  <input className="w-12 p-2 border rounded-lg text-center text-xl" value={opt.emoji} onChange={e => handleOptionChange(opt.id, 'emoji', e.target.value)} />
                                  <input className="flex-1 p-2 border rounded-lg text-sm" placeholder="Label (KO)" value={opt.label_ko} onChange={e => handleOptionChange(opt.id, 'label_ko', e.target.value)} />
                                </div>
                                <div className="flex gap-2 items-center">
                                  <div className="w-12 text-center text-[10px] font-bold text-gray-400">EN</div>
                                  <input className="flex-1 p-2 border rounded-lg text-sm" placeholder="Label (EN)" value={opt.label_en} onChange={e => handleOptionChange(opt.id, 'label_en', e.target.value)} />
                                </div>
                                <div className="flex gap-2 items-center">
                                  <div className="w-12 text-center text-[10px] font-bold text-gray-400">DESC</div>
                                  <input className="flex-1 p-2 border rounded-lg text-[11px] bg-gray-50" placeholder="Sub-description (EN)" value={opt.sub_text_en || ''} onChange={e => handleOptionChange(opt.id, 'sub_text_en', e.target.value)} />
                                </div>
                                <div className="flex justify-between items-center pt-2 mt-2 border-t border-dashed">
                                  <span className="text-xs font-bold text-gray-400">Score Impact</span>
                                  <input type="number" className="w-20 p-2 border rounded-lg text-right text-blue-600 font-bold" value={opt.score} onChange={e => handleOptionChange(opt.id, 'score', parseInt(e.target.value))} />
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', alignItems: 'flex-start' }}>
                          <div>
                            <span style={{ fontSize: '0.7rem', color: 'var(--p-blue)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Step {config.step_order}</span>
                            <h4 style={{ fontSize: '1.25rem', fontWeight: 600, marginTop: '4px', color: '#111' }}>{lang === 'ko' ? config.title_ko : config.title_en}</h4>
                            <p style={{ fontSize: '0.9rem', color: '#64748B', marginTop: '4px', fontWeight: 400 }}>{lang === 'ko' ? config.subtitle_ko : config.subtitle_en}</p>
                          </div>
                          <button 
                            onClick={() => startEditing(config)}
                            className="admin-btn-secondary" 
                            style={{ padding: '10px 20px', fontSize: '0.85rem', borderRadius: '10px' }}
                          >
                            {lang === 'ko' ? '편집' : 'Edit Content'}
                          </button>
                        </div>
                        
                        <div style={{ borderTop: '1px solid rgba(0,0,0,0.05)', paddingTop: '20px' }}>
                          <h5 style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94A3B8', marginBottom: '15px', textTransform: 'uppercase' }}>Options & Choices</h5>
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '15px' }}>
                            {config.quiz_options?.map((opt: any) => (
                              <div key={opt.id} style={{ padding: '15px', background: 'white', borderRadius: '16px', border: '1px solid rgba(0,0,0,0.06)', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                                  <span style={{ fontSize: '1.25rem' }}>{opt.emoji}</span>
                                  <span style={{ fontSize: '0.95rem', fontWeight: 500 }}>{lang === 'ko' ? opt.label_ko : opt.label_en}</span>
                                </div>
                                {opt.sub_text_en && <p style={{ fontSize: '0.75rem', color: '#94A3B8', marginBottom: '8px' }}>{opt.sub_text_en}</p>}
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px', paddingTop: '10px', borderTop: '1px dashed rgba(0,0,0,0.05)' }}>
                                  <span style={{ fontSize: '0.7rem', color: '#94A3B8' }}>Impact Score</span>
                                  <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--p-blue)' }}>+{opt.score}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
