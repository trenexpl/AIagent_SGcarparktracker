import React, { useEffect, useState } from 'react';
import { 
  MessageSquare, 
  ExternalLink, 
  Send, 
  ThumbsUp, 
  Sparkles, 
  MapPin, 
  CheckCircle2, 
  Tag, 
  User, 
  AlertCircle, 
  Zap, 
  DollarSign, 
  HelpCircle, 
  Trash2,
  Share2,
  RefreshCw
} from 'lucide-react';
import { CommunityComment, CommentCategory } from '../types/carpark';
import { storageService } from '../services/storageService';
import { SINGAPORE_CARPARKS } from '../data/singaporeCarparks';

interface DisqusCommentsProps {
  url?: string;
  identifier?: string;
  title?: string;
}

const CATEGORY_META: Record<CommentCategory, { label: string; icon: string; bg: string; text: string; border: string }> = {
  parking_tip: {
    label: 'Parking Tip',
    icon: '💡',
    bg: 'bg-amber-50',
    text: 'text-amber-900',
    border: 'border-amber-200',
  },
  gantry_rates: {
    label: 'Gantry / Rates',
    icon: '💵',
    bg: 'bg-emerald-50',
    text: 'text-emerald-900',
    border: 'border-emerald-200',
  },
  ev_charging: {
    label: 'EV Charging',
    icon: '⚡',
    bg: 'bg-teal-50',
    text: 'text-teal-900',
    border: 'border-teal-200',
  },
  question: {
    label: 'Question',
    icon: '❓',
    bg: 'bg-purple-50',
    text: 'text-purple-900',
    border: 'border-purple-200',
  },
  general: {
    label: 'General',
    icon: '💬',
    bg: 'bg-slate-50',
    text: 'text-slate-800',
    border: 'border-slate-200',
  },
};

function formatTimeAgo(isoDate: string): string {
  try {
    const diffMs = Date.now() - new Date(isoDate).getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  } catch {
    return 'Recent';
  }
}

export const DisqusComments: React.FC<DisqusCommentsProps> = ({
  url,
  identifier,
  title = 'What The Park - Singapore Carpark Discussion',
}) => {
  const [activeView, setActiveView] = useState<'direct' | 'disqus'>('direct');
  const [comments, setComments] = useState<CommunityComment[]>([]);
  const [selectedFilterCategory, setSelectedFilterCategory] = useState<string>('all');
  const [loadFailed, setLoadFailed] = useState(false);

  // Form State
  const [authorName, setAuthorName] = useState<string>(() => {
    return localStorage.getItem('parksg_user_nickname') || '';
  });
  const [selectedCarpark, setSelectedCarpark] = useState<string>('General / All Singapore');
  const [category, setCategory] = useState<CommentCategory>('parking_tip');
  const [commentContent, setCommentContent] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [showSuccessToast, setShowSuccessToast] = useState<boolean>(false);

  // Load comments from storage on mount
  useEffect(() => {
    setComments(storageService.getCommunityComments());
  }, []);

  // Initialize Disqus Embed Script
  useEffect(() => {
    try {
      let pageUrl = url;
      if (!pageUrl && typeof window !== 'undefined') {
        const href = window.location.href;
        pageUrl = href && href.startsWith('http') ? href : 'https://what-the-park.app/carpark-discussion';
      }
      const pageId = identifier || 'what-the-park-singapore-drivers';

      // Set global configuration safely
      (window as any).disqus_config = function (this: any) {
        this.page.url = pageUrl;
        this.page.identifier = pageId;
        this.page.title = title;
      };

      // If DISQUS is already loaded in the window, trigger reset with updated config
      if ((window as any).DISQUS) {
        try {
          (window as any).DISQUS.reset({
            reload: true,
            config: function (this: any) {
              this.page.url = pageUrl;
              this.page.identifier = pageId;
              this.page.title = title;
            },
          });
        } catch {
          // Ignore disqus reset quirks
        }
      } else if (typeof document !== 'undefined') {
        // Inject embed script if not present
        let existingScript = document.getElementById('disqus-embed-script') as HTMLScriptElement | null;
        if (!existingScript) {
          const s = document.createElement('script');
          s.id = 'disqus-embed-script';
          s.src = 'https://jt-ai-vc.disqus.com/embed.js';
          s.setAttribute('data-timestamp', String(+new Date()));
          s.async = true;
          s.onerror = () => {
            setLoadFailed(true);
          };
          (document.head || document.body).appendChild(s);
        }

        // Inject count script if not present
        let existingCountScript = document.getElementById('dsq-count-scr') as HTMLScriptElement | null;
        if (!existingCountScript) {
          const cs = document.createElement('script');
          cs.id = 'dsq-count-scr';
          cs.src = 'https://jt-ai-vc.disqus.com/count.js';
          cs.async = true;
          cs.onerror = () => {};
          (document.head || document.body).appendChild(cs);
        }
      }
    } catch {
      setLoadFailed(true);
    }
  }, [url, identifier, title]);

  const handleSubmitComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentContent.trim()) return;

    setIsSubmitting(true);
    const finalAuthor = authorName.trim() || 'SG Driver';
    localStorage.setItem('parksg_user_nickname', finalAuthor);

    const newComment = storageService.addCommunityComment({
      authorName: finalAuthor,
      carparkName: selectedCarpark === 'General / All Singapore' ? undefined : selectedCarpark,
      category,
      content: commentContent.trim(),
    });

    setComments(storageService.getCommunityComments());
    setCommentContent('');
    setIsSubmitting(false);
    setShowSuccessToast(true);
    setTimeout(() => setShowSuccessToast(false), 4000);
  };

  const handleToggleLike = (commentId: string) => {
    const updated = storageService.toggleLikeComment(commentId);
    setComments([...updated]);
  };

  const handleDeleteComment = (commentId: string) => {
    const updated = storageService.deleteCommunityComment(commentId);
    setComments([...updated]);
  };

  const filteredComments = comments.filter((c) => {
    if (selectedFilterCategory === 'all') return true;
    return c.category === selectedFilterCategory;
  });

  return (
    <div id="driver-discussions-section" className="bg-slate-50/50 py-6 sm:py-10">
      <div className="max-w-4xl mx-auto px-3 sm:px-6 lg:px-8 space-y-6">
        
        {/* Header Title & Controls */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center shadow-xs">
              <MessageSquare className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-black text-slate-950 tracking-tight">
                  Driver Community &amp; Comments
                </h2>
                <span className="px-2 py-0.5 rounded-full text-xs font-black bg-amber-100 text-amber-900 border border-amber-300">
                  {comments.length} Tips
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
                Directly share parking tips, gantry notices, EV status, or discuss on Disqus with fellow Singapore drivers.
              </p>
            </div>
          </div>

          {/* View Mode Switcher */}
          <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-2xl border border-slate-200/80">
            <button
              type="button"
              id="btn-tab-direct-comments"
              onClick={() => setActiveView('direct')}
              className={`px-3.5 py-1.5 rounded-xl font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer ${
                activeView === 'direct'
                  ? 'bg-white text-slate-950 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Send className="w-3.5 h-3.5 text-amber-600" />
              <span>Direct Comments</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-amber-100 text-amber-900 font-black">
                {comments.length}
              </span>
            </button>

            <button
              type="button"
              id="btn-tab-disqus-embed"
              onClick={() => setActiveView('disqus')}
              className={`px-3.5 py-1.5 rounded-xl font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer ${
                activeView === 'disqus'
                  ? 'bg-white text-slate-950 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5 text-sky-600" />
              <span>Disqus Thread</span>
            </button>
          </div>
        </div>

        {/* 1. DIRECT IN-APP COMMENT INPUT SECTION */}
        <div className="bg-gradient-to-br from-white to-amber-50/30 rounded-3xl p-5 sm:p-7 border border-amber-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-600" />
              <h3 className="font-extrabold text-sm sm:text-base text-slate-900">
                Post a Direct Driver Comment or Parking Tip
              </h3>
            </div>
            <span className="text-xs text-slate-500 font-medium">No account required • Instant Post</span>
          </div>

          <form onSubmit={handleSubmitComment} className="space-y-3.5">
            {/* Input Row: Author Name & Carpark Location Tag */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-black uppercase tracking-wider text-slate-500 mb-1">
                  Your Driver Name / Nickname
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    id="input-comment-author"
                    placeholder="e.g. Kenji T. / SG Driver"
                    value={authorName}
                    onChange={(e) => setAuthorName(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 bg-white rounded-xl border border-slate-200 text-xs sm:text-sm font-bold text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:border-amber-500 shadow-2xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-black uppercase tracking-wider text-slate-500 mb-1">
                  Target Carpark / Location
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <select
                    id="select-comment-carpark"
                    value={selectedCarpark}
                    onChange={(e) => setSelectedCarpark(e.target.value)}
                    className="w-full pl-10 pr-8 py-2.5 bg-white rounded-xl border border-slate-200 text-xs sm:text-sm font-bold text-slate-900 focus:outline-hidden focus:border-amber-500 shadow-2xs appearance-none"
                  >
                    <option value="General / All Singapore">General / All Singapore Drivers</option>
                    {SINGAPORE_CARPARKS.map((cp) => (
                      <option key={cp.id} value={cp.name}>
                        {cp.name} ({cp.area})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Category Tags Selection */}
            <div>
              <label className="block text-[11px] font-black uppercase tracking-wider text-slate-500 mb-1.5">
                Select Tip Category
              </label>
              <div className="flex items-center gap-1.5 flex-wrap">
                {(Object.keys(CATEGORY_META) as CommentCategory[]).map((catKey) => {
                  const meta = CATEGORY_META[catKey];
                  const isSelected = category === catKey;
                  return (
                    <button
                      key={catKey}
                      type="button"
                      onClick={() => setCategory(catKey)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer border ${
                        isSelected
                          ? `${meta.bg} ${meta.text} ${meta.border} ring-2 ring-amber-400/40 shadow-2xs`
                          : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <span>{meta.icon}</span>
                      <span>{meta.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Comment Textarea */}
            <div>
              <label className="block text-[11px] font-black uppercase tracking-wider text-slate-500 mb-1">
                Your Comment or Advice
              </label>
              <textarea
                id="input-comment-textarea"
                rows={3}
                required
                value={commentContent}
                onChange={(e) => setCommentContent(e.target.value)}
                placeholder="Share real-time parking advice, gantry clearance height notices, grace periods, EV lot availability, or entry tips..."
                className="w-full p-3.5 bg-white rounded-2xl border border-slate-200 text-xs sm:text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:border-amber-500 shadow-2xs resize-none"
              />
            </div>

            {/* Action Row & Success Toast */}
            <div className="flex items-center justify-between flex-wrap gap-3 pt-1">
              <div className="flex items-center gap-2">
                {showSuccessToast && (
                  <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl animate-in fade-in slide-in-from-left-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Comment posted directly to driver feed!</span>
                  </div>
                )}
              </div>

              <button
                type="submit"
                id="btn-submit-direct-comment"
                disabled={isSubmitting || !commentContent.trim()}
                className="py-2.5 px-6 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 text-slate-950 font-black text-xs sm:text-sm rounded-xl shadow-xs transition-all flex items-center gap-2 cursor-pointer ml-auto"
              >
                <Send className="w-4 h-4" />
                <span>Post Comment</span>
              </button>
            </div>
          </form>
        </div>

        {/* 2. DIRECT COMMENTS FEED OR DISQUS EMBED VIEW */}
        {activeView === 'direct' ? (
          <div className="space-y-4">
            {/* Category Filter Bar */}
            <div className="flex items-center justify-between flex-wrap gap-2 pb-2">
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
                <button
                  type="button"
                  onClick={() => setSelectedFilterCategory('all')}
                  className={`px-3 py-1 rounded-xl text-xs font-black whitespace-nowrap transition-all border ${
                    selectedFilterCategory === 'all'
                      ? 'bg-slate-900 text-white border-slate-900 shadow-2xs'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  All ({comments.length})
                </button>
                {(Object.keys(CATEGORY_META) as CommentCategory[]).map((catKey) => {
                  const meta = CATEGORY_META[catKey];
                  const count = comments.filter((c) => c.category === catKey).length;
                  const isSelected = selectedFilterCategory === catKey;
                  return (
                    <button
                      key={catKey}
                      type="button"
                      onClick={() => setSelectedFilterCategory(catKey)}
                      className={`px-3 py-1 rounded-xl text-xs font-black whitespace-nowrap transition-all border flex items-center gap-1 ${
                        isSelected
                          ? `${meta.bg} ${meta.text} ${meta.border} shadow-2xs`
                          : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <span>{meta.icon}</span>
                      <span>{meta.label}</span>
                      <span className="text-[10px] opacity-70">({count})</span>
                    </button>
                  );
                })}
              </div>

              <button
                type="button"
                onClick={() => setComments(storageService.getCommunityComments())}
                className="text-xs font-bold text-slate-500 hover:text-slate-800 flex items-center gap-1 p-1"
                title="Refresh comments"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Refresh</span>
              </button>
            </div>

            {/* Comments List */}
            <div className="space-y-3">
              {filteredComments.length > 0 ? (
                filteredComments.map((c) => {
                  const meta = CATEGORY_META[c.category] || CATEGORY_META.general;
                  return (
                    <div
                      key={c.id}
                      className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 hover:border-amber-300 transition-all shadow-2xs space-y-2.5 group"
                    >
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <div className="w-7 h-7 rounded-full bg-slate-100 font-black text-slate-700 text-xs flex items-center justify-center">
                            {c.authorName.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <span className="font-extrabold text-xs sm:text-sm text-slate-900">
                              {c.authorName}
                            </span>
                            <span className="text-[11px] text-slate-400 ml-2">
                              {formatTimeAgo(c.timestamp)}
                            </span>
                          </div>

                          <span
                            className={`text-[10px] font-black px-2 py-0.5 rounded-lg border ${meta.bg} ${meta.text} ${meta.border} flex items-center gap-1`}
                          >
                            <span>{meta.icon}</span>
                            <span>{meta.label}</span>
                          </span>
                        </div>

                        {c.carparkName && (
                          <div className="flex items-center gap-1 text-[11px] font-bold text-sky-800 bg-sky-50 border border-sky-200/80 px-2.5 py-0.5 rounded-lg truncate max-w-[220px]">
                            <MapPin className="w-3 h-3 text-sky-600 shrink-0" />
                            <span className="truncate">{c.carparkName}</span>
                          </div>
                        )}
                      </div>

                      <p className="text-xs sm:text-sm text-slate-800 font-medium leading-relaxed">
                        {c.content}
                      </p>

                      <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-xs text-slate-500">
                        <button
                          type="button"
                          onClick={() => handleToggleLike(c.id)}
                          className={`flex items-center gap-1.5 py-1 px-2.5 rounded-lg font-bold transition-colors cursor-pointer ${
                            c.likedByMe
                              ? 'bg-amber-100 text-amber-900 font-black'
                              : 'hover:bg-slate-100 text-slate-600'
                          }`}
                        >
                          <ThumbsUp className={`w-3.5 h-3.5 ${c.likedByMe ? 'fill-amber-600 text-amber-600' : ''}`} />
                          <span>{c.likes} Helpful</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDeleteComment(c.id)}
                          className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-rose-600 transition-opacity p-1 rounded"
                          title="Remove comment"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-10 px-4 bg-white rounded-2xl border border-slate-200 space-y-2">
                  <div className="w-10 h-10 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
                    <MessageSquare className="w-5 h-5" />
                  </div>
                  <h4 className="font-bold text-sm text-slate-800">No comments in this category</h4>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto">
                    Be the first driver to post a tip or question using the form above!
                  </p>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* 3. DISQUS EMBED THREAD CONTAINER */
          <div className="bg-white rounded-3xl p-5 sm:p-7 border border-slate-200 shadow-2xs min-h-[220px] relative space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-extrabold text-slate-700">Official Disqus Thread</span>
                <span className="text-[11px] text-slate-400">(Syncs across Disqus community)</span>
              </div>

              <a
                href="https://jt-ai-vc.disqus.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-bold text-sky-700 hover:text-sky-800 bg-sky-50 hover:bg-sky-100 px-3 py-1 rounded-xl border border-sky-200 transition-colors flex items-center gap-1.5"
              >
                <span>Open in Disqus Portal</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            <div id="disqus_thread"></div>

            {loadFailed && (
              <div className="py-8 text-center space-y-3">
                <p className="text-sm font-semibold text-slate-600">
                  Disqus iframe was blocked by browser sandbox/cookies. You can use the Direct Driver Comments tab above or open on Disqus.
                </p>
                <div className="flex items-center justify-center gap-2 flex-wrap">
                  <button
                    type="button"
                    onClick={() => setActiveView('direct')}
                    className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-extrabold rounded-xl shadow-xs transition-all cursor-pointer"
                  >
                    Switch to Direct Driver Comments
                  </button>
                  <a
                    href="https://jt-ai-vc.disqus.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white text-xs font-extrabold rounded-xl shadow-xs transition-all"
                  >
                    <span>View &amp; Post on Disqus</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            )}

            <noscript>
              Please enable JavaScript to view the{' '}
              <a
                href="https://disqus.com/?ref_noscript"
                className="text-sky-600 underline font-bold"
                target="_blank"
                rel="noreferrer"
              >
                comments powered by Disqus.
              </a>
            </noscript>
          </div>
        )}

        {/* Footer info banner */}
        <div className="text-center pt-2 border-t border-slate-100">
          <p className="text-[11px] text-slate-400 font-medium">
            What The Park • Real-Time Singapore Carpark Tracker • Community Driver Discussions
          </p>
        </div>
      </div>
    </div>
  );
};
