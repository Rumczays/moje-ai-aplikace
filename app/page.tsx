'use client';
import React, { useState, useEffect, useRef } from 'react';
import { 
  Layout, 
  Image as ImageIcon, 
  Video, 
  Send, 
  Facebook, 
  Instagram, 
  Smartphone, 
  Monitor,
  Sparkles,
  Trash2,
  CheckCircle2,
  Copy,
  ExternalLink,
  Loader2,
  Settings,
  X,
  Link as LinkIcon,
  Move,
  ClipboardCheck,
  MousePointer2,
  UploadCloud,
  UserCircle2,
  Users
} from 'lucide-react';
import { Platform, AICaptionSuggestion } from './types';
import { generateSocialContent } from './services/geminiService';

interface Profile {
  id: string;
  name: string;
  avatar: string;
  fbUrl: string;
  igHandle: string;
  color: string;
}

const INITIAL_PROFILES: Profile[] = [
  {
    id: 'tiskarna',
    name: "Tiskárna KB",
    avatar: "https://picsum.photos/seed/tisk/100/100",
    fbUrl: "https://www.facebook.com/profile.php?id=100083058924275",
    igHandle: "tiskarnakb",
    color: "indigo"
  },
  {
    id: 'rum',
    name: "Pravej Rum",
    avatar: "https://picsum.photos/seed/rum/100/100",
    fbUrl: "https://www.facebook.com/pravejRum/",
    igHandle: "pravejrum",
    color: "amber"
  }
];

interface MediaState {
  url: string;
  type: 'image' | 'video';
  base64?: string;
  position: { x: number; y: number };
}

export default function App() {
  const [profiles, setProfiles] = useState<Profile[]>(() => {
    const saved = localStorage.getItem('social_profiles');
    return saved ? JSON.parse(saved) : INITIAL_PROFILES;
  });
  const [selectedProfileId, setSelectedProfileId] = useState(profiles[0].id);
  const activeProfile = profiles.find(p => p.id === selectedProfileId) || profiles[0];

  const [platform, setPlatform] = useState<Platform>(Platform.INSTAGRAM);
  const [text, setText] = useState("");
  const [media, setMedia] = useState<MediaState | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<AICaptionSuggestion | null>(null);
  const [viewMode, setViewMode] = useState<'mobile' | 'desktop'>('mobile');
  const [isPublished, setIsPublished] = useState(false);
  const [showCopyToast, setShowCopyToast] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const dragRef = useRef<{ isDragging: boolean; startX: number; startY: number; startPosX: number; startPosY: number } | null>(null);

  useEffect(() => {
    localStorage.setItem('social_profiles', JSON.stringify(profiles));
  }, [profiles]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const type = file.type.startsWith('video/') ? 'video' : 'image';
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = (reader.result as string).split(',')[1];
        setMedia({
          url: URL.createObjectURL(file),
          type,
          base64,
          position: { x: 50, y: 50 }
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAIDrive = async () => {
    if (!text && !media) return;
    setIsGenerating(true);
    try {
      const result = await generateSocialContent(platform, text, media?.base64);
      setAiSuggestions(result);
      setText(result.caption);
    } catch (err) {
      console.error(err);
      alert("Optimalizace pomocí AI selhala. Zkuste to prosím znovu.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePublish = () => {
    const hashtags = aiSuggestions?.hashtags.join(' ') || '';
    const fullContent = `${text}${hashtags ? '\n\n' + hashtags : ''}`;
    
    navigator.clipboard.writeText(fullContent).then(() => {
      setShowCopyToast(true);
      setTimeout(() => setShowCopyToast(false), 3000);
    });

    const targetUrl = platform === Platform.FACEBOOK ? activeProfile.fbUrl : `https://instagram.com/${activeProfile.igHandle}`;
    window.open(targetUrl, '_blank');

    setShowGuide(true);
    setIsPublished(true);
    setTimeout(() => setIsPublished(false), 2000);
  };

  const copyToClipboard = () => {
    const content = `${text}\n\n${aiSuggestions?.hashtags.join(' ') || ''}`;
    navigator.clipboard.writeText(content);
    setShowCopyToast(true);
    setTimeout(() => setShowCopyToast(false), 3000);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (media?.type !== 'image') return;
    dragRef.current = {
      isDragging: true,
      startX: e.clientX,
      startY: e.clientY,
      startPosX: media.position.x,
      startPosY: media.position.y
    };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!dragRef.current?.isDragging || !media) return;
    const deltaX = (e.clientX - dragRef.current.startX) / 5;
    const deltaY = (e.clientY - dragRef.current.startY) / 5;
    setMedia({
      ...media,
      position: {
        x: Math.max(0, Math.min(100, dragRef.current.startPosX - deltaX)),
        y: Math.max(0, Math.min(100, dragRef.current.startPosY - deltaY))
      }
    });
  };

  const handleMouseUp = () => {
    if (dragRef.current) dragRef.current.isDragging = false;
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-900 select-none">
      {/* Toast Notification */}
      {showCopyToast && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[100] animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="bg-slate-900 text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 border border-slate-700">
            <ClipboardCheck className="text-green-400 w-5 h-5" />
            <span className="font-medium text-sm">Obsah připraven ke vložení (Ctrl+V)!</span>
          </div>
        </div>
      )}

      {/* Guide Modal */}
      {showGuide && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-900/40 backdrop-blur-md p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 border border-white/50">
            <div className="p-8 text-center space-y-6">
              <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-2">
                <CheckCircle2 className="w-10 h-10 text-green-600" />
              </div>
              <h3 className="text-2xl font-bold text-slate-800">Profil {activeProfile.name} je připraven!</h3>
              <p className="text-slate-500">Dokončete příspěvek na sociální síti:</p>
              
              <div className="grid grid-cols-1 gap-4 text-left">
                <div className="bg-slate-50 p-4 rounded-2xl flex gap-4 items-start border border-slate-100">
                  <div className="bg-indigo-600 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold shrink-0 shadow-sm">1</div>
                  <div>
                    <p className="font-bold text-slate-800 flex items-center gap-2">
                       <UploadCloud className="w-4 h-4 text-indigo-500" /> Nahrát soubor
                    </p>
                    <p className="text-sm text-slate-600">Klikněte na tlačítko pro přidání fotky/videa.</p>
                  </div>
                </div>
                <div className="bg-slate-50 p-4 rounded-2xl flex gap-4 items-start border border-slate-100">
                  <div className="bg-indigo-600 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold shrink-0 shadow-sm">2</div>
                  <div>
                    <p className="font-bold text-slate-800 flex items-center gap-2">
                       <MousePointer2 className="w-4 h-4 text-indigo-500" /> Vložit text
                    </p>
                    <p className="text-sm text-slate-600">Klikněte do pole popisku a dejte <kbd className="px-1.5 py-0.5 bg-white border border-slate-300 rounded text-xs font-mono">Ctrl+V</kbd>.</p>
                  </div>
                </div>
              </div>

              <button onClick={() => setShowGuide(false)} className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold text-lg hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 active:scale-95">
                Mám to, díky!
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-6 py-4 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2 group cursor-pointer">
            <div className="bg-indigo-600 p-2 rounded-lg group-hover:rotate-12 transition-transform">
              <Sparkles className="text-white w-6 h-6" />
            </div>
            <h1 className="text-xl font-black bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 animate-gradient-x">
              SocialPost AI Master
            </h1>
          </div>
          <div className="flex gap-4">
             <button 
               onClick={handlePublish}
               className={`flex items-center gap-2 px-6 py-2.5 rounded-full font-bold transition-all shadow-lg active:scale-95 ${isPublished ? 'bg-green-500 text-white' : 'bg-indigo-600 hover:bg-indigo-700 text-white hover:shadow-indigo-200'}`}
             >
               {isPublished ? <CheckCircle2 className="w-5 h-5" /> : <Send className="w-4 h-4" />}
               {isPublished ? "Text připraven!" : "Publikovat nyní"}
             </button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full p-4 lg:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Col: Creator */}
        <section className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
            {/* Step 1: Profile Selection */}
            <div className="mb-8">
              <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                <UserCircle2 className="w-4 h-4 text-indigo-500" /> KROK 1: VÝBĚR ÚČTU
              </h2>
              <div className="grid grid-cols-2 gap-3">
                {profiles.map(p => (
                  <button
                    key={p.id}
                    onClick={() => setSelectedProfileId(p.id)}
                    className={`flex items-center gap-3 p-3 rounded-2xl border-2 transition-all text-left ${selectedProfileId === p.id ? 'border-indigo-600 bg-indigo-50/50 shadow-md ring-4 ring-indigo-50' : 'border-slate-100 bg-white hover:border-slate-200 text-slate-500'}`}
                  >
                    <img src={p.avatar} className={`w-10 h-10 rounded-full border-2 ${selectedProfileId === p.id ? 'border-indigo-200' : 'border-slate-100 grayscale'}`} alt={p.name} />
                    <span className={`text-sm font-bold ${selectedProfileId === p.id ? 'text-indigo-900' : 'text-slate-700'}`}>{p.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Step 2: Content Creator */}
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2 border-t border-slate-100 pt-6">
              <Layout className="w-4 h-4 text-indigo-500" /> KROK 2: TVORBA OBSAHU
            </h2>

            <div className="flex p-1 bg-slate-100 rounded-2xl mb-6">
              <button 
                onClick={() => setPlatform(Platform.INSTAGRAM)}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all ${platform === Platform.INSTAGRAM ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                <Instagram className="w-4 h-4" /> Instagram
              </button>
              <button 
                onClick={() => setPlatform(Platform.FACEBOOK)}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all ${platform === Platform.FACEBOOK ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                <Facebook className="w-4 h-4" /> Facebook
              </button>
            </div>

            {/* Media Upload Area */}
            <div 
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              className={`relative h-64 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center transition-all ${!media ? 'cursor-pointer hover:border-indigo-400 border-slate-200 bg-slate-50/50 hover:bg-indigo-50/20' : 'border-indigo-200 bg-indigo-50/30'}`}
            >
              {media ? (
                <div className="relative w-full h-full p-2 group">
                  {media.type === 'image' ? (
                    <div onMouseDown={handleMouseDown} className="w-full h-full overflow-hidden rounded-xl cursor-move shadow-inner relative group">
                      <img src={media.url} className="w-full h-full object-cover pointer-events-none" style={{ objectPosition: `${media.position.x}% ${media.position.y}%` }} />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 flex items-center justify-center transition-all">
                        <Move className="text-white opacity-0 group-hover:opacity-100 w-8 h-8 drop-shadow-md" />
                      </div>
                    </div>
                  ) : (
                    <video src={media.url} className="w-full h-full object-cover rounded-xl shadow-lg" />
                  )}
                  <div className="absolute top-4 right-4 flex gap-2">
                    <button onClick={(e) => { e.stopPropagation(); setMedia(null); }} className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-lg active:scale-90"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>
              ) : (
                <div onClick={() => fileInputRef.current?.click()} className="flex flex-col items-center justify-center h-full w-full p-6 text-center">
                  <div className="p-4 bg-white rounded-2xl shadow-sm mb-3 group-hover:scale-110 transition-transform border border-slate-100">
                    <ImageIcon className="w-8 h-8 text-indigo-400" />
                  </div>
                  <p className="text-sm font-bold text-slate-700">Vyberte fotku nebo video</p>
                  <p className="text-xs text-slate-400 mt-1">Nahrání souboru pomáhá AI s analýzou</p>
                </div>
              )}
              <input ref={fileInputRef} type="file" accept="image/*,video/*" className="hidden" onChange={handleFileUpload} />
            </div>

            {/* Caption Area - FIXED CONTRAST */}
            <div className="mt-6">
              <label className="block text-sm font-bold text-slate-700 mb-2">Popis příspěvku</label>
              <textarea 
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Popište, o čem má příspěvek být... (např. Akce na tisk vizitek)"
                className="w-full h-32 p-4 rounded-2xl bg-white text-slate-900 border border-slate-200 focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none resize-none transition-all text-sm shadow-inner placeholder:text-slate-400"
              />
              
              <button 
                onClick={handleAIDrive}
                disabled={isGenerating || (!text && !media)}
                className="w-full mt-4 flex items-center justify-center gap-3 py-3.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl font-black shadow-xl shadow-indigo-100 hover:opacity-95 disabled:opacity-40 disabled:cursor-not-allowed transition-all active:scale-[0.98]"
              >
                {isGenerating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
                {isGenerating ? "AI PŘEMÝŠLÍ..." : "OPTIMALIZOVAT POMOCÍ AI"}
              </button>
            </div>
          </div>

          {/* AI Suggestions Panel */}
          {aiSuggestions && (
            <div className="bg-indigo-600 rounded-3xl p-6 shadow-2xl animate-in slide-in-from-bottom duration-500">
              <h3 className="text-white font-black mb-4 flex items-center gap-2 text-sm tracking-widest"><Sparkles className="w-4 h-4" /> AI ANALÝZA</h3>
              <div className="space-y-4">
                <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10">
                  <p className="text-[10px] font-black text-indigo-200 uppercase tracking-widest mb-3">Doporučené hashtagy</p>
                  <div className="flex flex-wrap gap-2">
                    {aiSuggestions.hashtags.map((tag, idx) => (
                      <span key={idx} className="bg-white/20 px-2.5 py-1 rounded-lg text-[11px] text-white border border-white/20 font-bold">{tag}</span>
                    ))}
                  </div>
                </div>
                <button onClick={copyToClipboard} className="w-full flex items-center justify-center gap-2 bg-white text-indigo-600 py-3 rounded-xl text-xs font-black hover:bg-indigo-50 transition-colors shadow-lg">
                  <Copy className="w-4 h-4" /> KOPÍROVAT VŠE DO SCHRÁNKY
                </button>
              </div>
            </div>
          )}
        </section>

        {/* Right Col: Preview */}
        <section className="lg:col-span-7 flex flex-col items-center">
          <div className="w-full mb-6 flex justify-between items-end px-4">
            <div className="animate-in fade-in slide-in-from-left duration-500">
              <h2 className="text-2xl font-black text-slate-800 tracking-tight">Živý náhled</h2>
              <p className="text-sm text-slate-500">Profil: <span className="text-indigo-600 font-black">{activeProfile.name}</span></p>
            </div>
            <div className="flex bg-slate-200/50 rounded-2xl p-1 backdrop-blur-sm border border-slate-200">
              <button onClick={() => setViewMode('mobile')} className={`p-2.5 rounded-xl transition-all ${viewMode === 'mobile' ? 'bg-white text-indigo-600 shadow-md' : 'text-slate-400 hover:text-slate-600'}`}><Smartphone className="w-5 h-5" /></button>
              <button onClick={() => setViewMode('desktop')} className={`p-2.5 rounded-xl transition-all ${viewMode === 'desktop' ? 'bg-white text-indigo-600 shadow-md' : 'text-slate-400 hover:text-slate-600'}`}><Monitor className="w-5 h-5" /></button>
            </div>
          </div>

          <div className={`transition-all duration-700 ease-in-out flex justify-center w-full ${viewMode === 'mobile' ? 'max-w-[375px]' : 'max-w-full'}`}>
            {platform === Platform.INSTAGRAM ? (
              <InstagramPreview user={activeProfile} text={text} media={media} hashtags={aiSuggestions?.hashtags || []} />
            ) : (
              <FacebookPreview user={activeProfile} text={text} media={media} hashtags={aiSuggestions?.hashtags || []} />
            )}
          </div>

          {/* Linked URL Status */}
          <div className="mt-8 bg-white p-6 rounded-3xl border border-slate-200 w-full max-w-md shadow-sm">
            <div className="flex justify-between items-center mb-5">
              <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <LinkIcon className="w-4 h-4 text-indigo-500" /> CÍLOVÉ PROPOJENÍ
              </h4>
              <button onClick={() => setIsSettingsOpen(true)} className="p-2 bg-slate-50 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all">
                <Settings className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-3">
              <div className={`flex items-center justify-between p-4 rounded-2xl border-2 transition-all ${platform === Platform.INSTAGRAM ? 'border-indigo-100 bg-indigo-50/30' : 'border-slate-50 bg-slate-50/50'}`}>
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white shadow-sm ${platform === Platform.INSTAGRAM ? 'bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600' : 'bg-slate-300'}`}><Instagram className="w-5 h-5" /></div>
                  <div>
                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-tighter">Instagram Profile</p>
                    <p className={`text-sm font-bold ${platform === Platform.INSTAGRAM ? 'text-indigo-900' : 'text-slate-500'}`}>@{activeProfile.igHandle}</p>
                  </div>
                </div>
                {platform === Platform.INSTAGRAM && <CheckCircle2 className="w-5 h-5 text-green-500" />}
              </div>
              <div className={`flex items-center justify-between p-4 rounded-2xl border-2 transition-all ${platform === Platform.FACEBOOK ? 'border-blue-100 bg-blue-50/30' : 'border-slate-50 bg-slate-50/50'}`}>
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white shadow-sm ${platform === Platform.FACEBOOK ? 'bg-blue-600' : 'bg-slate-300'}`}><Facebook className="w-5 h-5" /></div>
                  <div>
                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-tighter">Facebook Page</p>
                    <p className={`text-sm font-bold truncate max-w-[150px] ${platform === Platform.FACEBOOK ? 'text-blue-900' : 'text-slate-500'}`}>{activeProfile.fbUrl}</p>
                  </div>
                </div>
                {platform === Platform.FACEBOOK && <CheckCircle2 className="w-5 h-5 text-green-500" />}
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Settings Modal - FIXED CONTRAST */}
      {isSettingsOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/70 backdrop-blur-lg p-4">
          <div className="bg-white rounded-[2rem] w-full max-w-2xl shadow-2xl overflow-hidden border border-slate-200">
            <div className="flex justify-between items-center p-8 border-b border-slate-100 bg-slate-50/50">
              <h3 className="text-2xl font-black text-slate-800 flex items-center gap-3"><Users className="w-6 h-6 text-indigo-600" /> Správa profilů</h3>
              <button onClick={() => setIsSettingsOpen(false)} className="text-slate-400 hover:text-slate-900 p-2 bg-white rounded-full shadow-sm hover:rotate-90 transition-all"><X className="w-6 h-6" /></button>
            </div>
            <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8 max-h-[60vh] overflow-y-auto bg-white">
              {profiles.map((p, idx) => (
                <div key={p.id} className="space-y-5 p-6 border-2 border-slate-100 rounded-3xl bg-slate-50/30 hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-4 border-b border-slate-100 pb-4 mb-2">
                    <img src={p.avatar} className="w-12 h-12 rounded-full border-2 border-white shadow-md" alt="" />
                    <div className="flex-1">
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Název profilu</label>
                      <input 
                        type="text" 
                        value={p.name} 
                        onChange={(e) => {
                          const newProfiles = [...profiles];
                          newProfiles[idx].name = e.target.value;
                          setProfiles(newProfiles);
                        }}
                        className="text-base font-black bg-white border border-slate-200 rounded-lg px-2 py-1 outline-none focus:border-indigo-500 w-full text-slate-900"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Facebook URL</label>
                    <input type="text" value={p.fbUrl} onChange={(e) => {
                      const newProfiles = [...profiles];
                      newProfiles[idx].fbUrl = e.target.value;
                      setProfiles(newProfiles);
                    }} className="w-full p-3 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm text-slate-900 font-medium" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Instagram @handle</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">@</span>
                      <input type="text" value={p.igHandle} onChange={(e) => {
                        const newProfiles = [...profiles];
                        newProfiles[idx].igHandle = e.target.value;
                        setProfiles(newProfiles);
                      }} className="w-full p-3 pl-8 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm text-slate-900 font-medium" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-8 border-t border-slate-100 flex justify-end bg-slate-50/30">
              <button onClick={() => setIsSettingsOpen(false)} className="px-10 py-4 bg-indigo-600 text-white rounded-2xl font-black text-lg hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 active:scale-95">
                ULOŽIT NASTAVENÍ
              </button>
            </div>
          </div>
        </div>
      )}

      <footer className="bg-white border-t border-slate-200 p-8 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4 text-slate-400 text-sm font-medium">
          <p>&copy; 2024 SocialPost AI Master &bull; Made with Gemini Pro</p>
          <div className="flex gap-6">
            <span className="hover:text-indigo-600 cursor-pointer transition-colors">Podpora</span>
            <span className="hover:text-indigo-600 cursor-pointer transition-colors">Návod</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

const InstagramPreview = ({ user, text, media, hashtags }: any) => (
  <div className="w-full bg-white border border-slate-200 rounded-sm overflow-hidden shadow-2xl animate-in zoom-in-95 duration-500">
    <div className="flex items-center p-3 gap-3 border-b border-slate-50">
      <img src={user.avatar} className="w-8 h-8 rounded-full object-cover border border-slate-100 shadow-sm" />
      <div className="flex-1">
        <p className="text-xs font-bold text-slate-800 leading-tight">{user.name}</p>
        <p className="text-[10px] text-slate-400">Sponzorováno</p>
      </div>
      <X className="w-4 h-4 text-slate-300" />
    </div>
    <div className="aspect-square bg-slate-50 flex items-center justify-center overflow-hidden">
      {media ? (
        media.type === 'image' ? (
          <img src={media.url} className="w-full h-full object-cover" style={{ objectPosition: `${media.position.x}% ${media.position.y}%` }} />
        ) : (
          <video src={media.url} className="w-full h-full object-cover" controls />
        )
      ) : (
        <div className="flex flex-col items-center gap-2 text-slate-300">
          <ImageIcon className="w-16 h-16 opacity-20" />
          <p className="text-[10px] font-bold uppercase tracking-widest">MÉDIUM NENÍ VYBRÁNO</p>
        </div>
      )}
    </div>
    <div className="p-4 space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex gap-4">
          <Instagram className="w-6 h-6 text-slate-800 hover:scale-110 transition-transform cursor-pointer" />
          <Layout className="w-6 h-6 text-slate-800 hover:scale-110 transition-transform cursor-pointer" />
          <Send className="w-6 h-6 text-slate-800 hover:scale-110 transition-transform cursor-pointer" />
        </div>
        <div className="w-6 h-6 border-2 border-slate-800 rounded-sm" />
      </div>
      <div className="text-xs text-slate-800 leading-relaxed">
        <p className="mb-2"><span className="font-bold mr-2">{user.name}</span>{text || "Zde se zobrazí váš text generovaný pomocí AI..."}</p>
        <p className="text-blue-900 font-bold tracking-tight">{hashtags.join(' ')}</p>
      </div>
    </div>
  </div>
);

const FacebookPreview = ({ user, text, media, hashtags }: any) => (
  <div className="w-full bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-500">
    <div className="flex items-center p-4 gap-3">
      <img src={user.avatar} className="w-10 h-10 rounded-full object-cover border border-slate-100 shadow-md" />
      <div className="flex-1">
        <p className="text-sm font-bold text-slate-900 leading-tight">{user.name}</p>
        <p className="text-[11px] text-slate-500 flex items-center gap-1">Právě teď &bull; <Facebook className="w-2.5 h-2.5" /> Veřejné</p>
      </div>
      <div className="flex gap-1.5"><div className="w-1 h-1 bg-slate-300 rounded-full"/><div className="w-1 h-1 bg-slate-300 rounded-full"/><div className="w-1 h-1 bg-slate-300 rounded-full"/></div>
    </div>
    <div className="px-4 pb-4">
      <p className="text-[15px] text-slate-800 whitespace-pre-wrap leading-snug">{text || "Váš příspěvek čeká na inspiraci..."}</p>
      <p className="mt-3 text-blue-600 font-bold text-[13px]">{hashtags.join(' ')}</p>
    </div>
    <div className="bg-slate-50 min-h-[300px] flex items-center justify-center overflow-hidden border-y border-slate-100">
      {media ? (
        media.type === 'image' ? (
          <img src={media.url} className="w-full object-cover min-h-[300px]" style={{ objectPosition: `${media.position.x}% ${media.position.y}%` }} />
        ) : (
          <video src={media.url} className="w-full shadow-lg" controls />
        )
      ) : (
        <div className="flex flex-col items-center gap-3 text-slate-300">
          <ImageIcon className="w-20 h-20 opacity-20" />
          <p className="text-xs font-black tracking-tighter opacity-50">NÁHLED MÉDIA</p>
        </div>
      )}
    </div>
    <div className="p-2">
      <div className="flex items-center gap-2 p-2 border-b border-slate-100 mb-1">
        <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center"><CheckCircle2 className="w-3 h-3 text-white" /></div>
        <p className="text-xs text-slate-500 font-medium">99+ To se mi líbí</p>
      </div>
      <div className="grid grid-cols-3">
        <button className="flex items-center justify-center gap-2 p-2.5 text-[13px] text-slate-600 font-black hover:bg-slate-50 rounded-lg transition-colors italic">To se mi líbí</button>
        <button className="flex items-center justify-center gap-2 p-2.5 text-[13px] text-slate-600 font-black hover:bg-slate-50 rounded-lg transition-colors italic">Komentovat</button>
        <button className="flex items-center justify-center gap-2 p-2.5 text-[13px] text-slate-600 font-black hover:bg-slate-50 rounded-lg transition-colors italic">Sdílet</button>
      </div>
    </div>
  </div>
);
