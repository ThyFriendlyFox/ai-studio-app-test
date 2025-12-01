
import React, { useState } from 'react';
import Scanner from './components/Scanner';
import FixGuide from './components/FixGuide';
import ToolFinder from './components/ToolFinder';
import { analyzeIssue, generateStepDiagram } from './services/geminiService';
import { AppView, FixPlan, LoadingState, UserProfile, CommunityPost } from './types';

// Mock Initial User Profile
const initialProfile: UserProfile = {
  name: "Alex",
  streak: 3,
  badges: ["Wrench Wizard", "Safety First"],
  points: 120,
  skillLevel: "Apprentice"
};

// Mock Community Data
const INITIAL_COMMUNITY_POSTS: CommunityPost[] = [
  { id: '1', author: 'Sarah J.', title: 'Leaky Pipe under sink', description: 'Water keeps dripping even after tightening. Do I need tape?', likes: 4, comments: 2, timeAgo: '2h ago' },
  { id: '2', author: 'Mike T.', title: 'Bookshelf Wobble', description: 'IKEA Billy bookcase leans to the left. Lost the wall bracket.', likes: 12, comments: 5, timeAgo: '5h ago' },
  { id: '3', author: 'Jen K.', title: 'Weird Fridge Noise', description: 'Making a humming sound every 20 mins. Is it the fan?', likes: 1, comments: 0, timeAgo: '1d ago' },
];

// Data for quick tips
const QUICK_TIPS = [
  { title: "Test Alarms", icon: "🚨", time: "2m", query: "How to test smoke alarms and change batteries properly" },
  { title: "Bleed Radiators", icon: "🌡️", time: "10m", query: "How to bleed a radiator to fix cold spots and improve heating" },
  { title: "Unclog Sink", icon: "🚰", time: "15m", query: "How to unclog a bathroom sink drain using household items" },
  { title: "Silence Door", icon: "🚪", time: "5m", query: "How to fix a squeaky door hinge" },
];

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>(AppView.DASHBOARD);
  const [loadingState, setLoadingState] = useState<LoadingState>(LoadingState.IDLE);
  const [currentPlan, setCurrentPlan] = useState<FixPlan | null>(null);
  const [profile] = useState<UserProfile>(initialProfile);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [subscriptionType, setSubscriptionType] = useState<'monthly' | 'annual'>('monthly');
  
  // Social State
  const [communityPosts, setCommunityPosts] = useState<CommunityPost[]>(INITIAL_COMMUNITY_POSTS);
  const [myPosts, setMyPosts] = useState<CommunityPost[]>([]);
  const [newPostTitle, setNewPostTitle] = useState('');
  const [newPostDesc, setNewPostDesc] = useState('');
  const [selectedPost, setSelectedPost] = useState<CommunityPost | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  // Handlers
  const handleAnalyze = async (text: string, imageBase64?: string) => {
    setLoadingState(LoadingState.ANALYZING);
    try {
      const plan = await analyzeIssue(text, imageBase64);
      setCurrentPlan(plan);
      setCurrentView(AppView.FIX_GUIDE);
    } catch (error) {
      console.error(error);
      alert("Oops! Had trouble analyzing that. Try again?");
    } finally {
      setLoadingState(LoadingState.IDLE);
    }
  };

  const handleGenerateImage = async (stepIndex: number, prompt: string) => {
    if (!currentPlan) return;
    setLoadingState(LoadingState.GENERATING_IMAGE);
    try {
      const imageUrl = await generateStepDiagram(prompt);
      
      // Update state immutably
      const updatedSteps = [...currentPlan.steps];
      updatedSteps[stepIndex] = {
        ...updatedSteps[stepIndex],
        generatedImageUrl: imageUrl
      };
      
      setCurrentPlan({
        ...currentPlan,
        steps: updatedSteps
      });
      
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingState(LoadingState.IDLE);
    }
  };

  const handleSubmitHelp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostTitle || !newPostDesc) return;

    const newPost: CommunityPost = {
      id: Date.now().toString(),
      author: 'You',
      title: newPostTitle,
      description: newPostDesc,
      likes: 0,
      comments: 0,
      timeAgo: 'Just now'
    };

    setMyPosts([newPost, ...myPosts]);
    setNewPostTitle('');
    setNewPostDesc('');
    setCurrentView(AppView.DASHBOARD); // Go back to dashboard to see "My Requests"
  };

  const handleConnect = () => {
    setIsConnecting(true);
    // Simulate connection delay
    setTimeout(() => {
        setIsConnecting(false);
        alert(`Secure connection established with ${selectedPost?.author}. Opening video bridge...`);
        setSelectedPost(null);
    }, 2000);
  };

  // Lunchbox Modal Component (Inline for simplicity)
  const Lunchbox = () => (
    <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={() => setCurrentView(AppView.DASHBOARD)}>
      <div className="bg-gradient-to-br from-gray-200 to-gray-400 p-1 rounded-xl shadow-2xl max-w-sm w-full rotate-1" onClick={e => e.stopPropagation()}>
         {/* Metal Lunchbox Body */}
         <div className="bg-gray-100 rounded-lg p-6 border-4 border-gray-300 relative shadow-inner">
            <div className="absolute top-2 left-1/2 -translate-x-1/2 w-24 h-4 bg-gray-300 rounded-full shadow-inner"></div>
            
            <h2 className="text-center font-serif font-black text-2xl text-gray-700 mb-6 uppercase tracking-widest border-b-2 border-gray-200 pb-4">My Stash</h2>
            
            <div className="grid grid-cols-3 gap-4 mb-6">
              {profile.badges.map((badge, idx) => (
                <div key={idx} className="flex flex-col items-center animate-clunk" style={{ animationDelay: `${idx * 100}ms` }}>
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-yellow-300 to-yellow-500 shadow-lg flex items-center justify-center border-2 border-white text-2xl transform hover:scale-110 transition-transform cursor-pointer">
                    {idx === 0 ? '🔧' : '⛑️'}
                  </div>
                  <span className="text-[10px] font-bold text-gray-500 mt-2 text-center leading-tight uppercase">{badge}</span>
                </div>
              ))}
              <div className="flex flex-col items-center opacity-30 grayscale">
                 <div className="w-16 h-16 rounded-full bg-gray-300 border-dashed border-2 border-gray-400 flex items-center justify-center text-2xl">🏆</div>
                 <span className="text-[10px] font-bold text-gray-500 mt-2 text-center uppercase">Pro Fixer</span>
              </div>
            </div>

            <div className="bg-paper p-4 rounded border border-gray-200 transform -rotate-1 shadow-sm">
               <div className="flex justify-between items-center mb-1">
                 <span className="font-mono text-xs font-bold text-gray-500">CURRENT STREAK</span>
                 <span className="font-black text-xl text-confidence-green">{profile.streak} DAYS</span>
               </div>
               <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                 <div className="h-full bg-confidence-green w-3/4"></div>
               </div>
            </div>
            
            <button 
              onClick={() => setCurrentView(AppView.DASHBOARD)}
              className="mt-6 w-full py-3 bg-gray-800 text-white font-bold rounded shadow-lg uppercase tracking-wider hover:bg-gray-700"
            >
              Close Box
            </button>
         </div>
      </div>
    </div>
  );

  // Subscription Modal Component
  const SubscriptionModal = () => (
    <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={() => setShowSubscriptionModal(false)}>
      <div className="bg-paper p-6 rounded-sm shadow-[8px_8px_0px_rgba(0,0,0,0.2)] max-w-sm w-full transform -rotate-1 border-2 border-gray-200 relative" onClick={e => e.stopPropagation()}>
         {/* Receipt holes */}
         <div className="absolute top-0 left-0 w-full h-4 -mt-2 flex justify-around">
            {[...Array(6)].map((_,i) => <div key={i} className="w-3 h-3 rounded-full bg-walnut-dark shadow-inner"></div>)}
         </div>

        <div className="text-center border-b-2 border-dashed border-gray-300 pb-4 mb-4 mt-2">
           <div className="w-16 h-16 bg-confidence-green text-white rounded-full flex items-center justify-center mx-auto mb-2 text-3xl shadow-md border-4 border-white">
             💎
           </div>
           <h2 className="font-serif font-black text-2xl text-gray-800">MEMBERSHIP</h2>
           <p className="font-mono text-xs text-gray-500 uppercase tracking-widest">Receipt #8842-A</p>
        </div>

        <div className="space-y-4 mb-6">
           <div className="flex justify-between items-end border-b border-gray-100 pb-2">
              <span className="font-bold font-serif text-gray-700">Current Plan</span>
              <span className="font-mono text-confidence-green font-bold bg-green-100 px-2 rounded">PRO FIXER</span>
           </div>
           <div className="flex justify-between items-end border-b border-gray-100 pb-2">
              <span className="font-bold font-serif text-gray-700">Billed</span>
              <span className="font-mono text-gray-600">
                {subscriptionType === 'monthly' ? '$4.99 / mo' : '$49.99 / yr'}
              </span>
           </div>
           <div className="flex justify-between items-end border-b border-gray-100 pb-2">
              <span className="font-bold font-serif text-gray-700">Next Bill</span>
              <span className="font-mono text-gray-600">Oct 24, 2025</span>
           </div>
        </div>

        <div className="space-y-3">
           {subscriptionType === 'monthly' ? (
             <button 
               onClick={() => {
                 setSubscriptionType('annual');
                 alert("Upgrade successful! Welcome to the Annual Plan.");
               }} 
               className="w-full py-3 bg-confidence-green text-white font-bold rounded shadow-[2px_2px_0px_rgba(0,0,0,0.2)] uppercase tracking-wider hover:translate-y-[1px] hover:shadow-none transition-all"
             >
                Upgrade to Annual (Save 20%)
             </button>
           ) : (
             <button disabled className="w-full py-3 bg-gray-200 text-gray-500 font-bold rounded border-2 border-gray-300 uppercase tracking-wider cursor-default">
                Annual Plan Active ✅
             </button>
           )}
           <button onClick={() => { alert("Subscription cancelled."); setShowSubscriptionModal(false); }} className="w-full py-3 bg-white border-2 border-gray-300 text-gray-500 font-bold rounded shadow-[2px_2px_0px_rgba(0,0,0,0.1)] uppercase tracking-wider hover:translate-y-[1px] hover:shadow-none transition-all">
              Cancel Subscription
           </button>
        </div>
        
        <div className="mt-6 text-center">
            <button onClick={() => setShowSubscriptionModal(false)} className="text-xs font-mono text-gray-400 underline hover:text-gray-600">Close Receipt</button>
        </div>
      </div>
    </div>
  );

  // Help Offer Modal
  const HelpOfferModal = () => (
    <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={() => setSelectedPost(null)}>
      <div className="bg-paper p-6 rounded-sm shadow-2xl max-w-sm w-full transform rotate-0 border-t-8 border-trust-blue relative" onClick={e => e.stopPropagation()}>
         {/* Clipboard Clip style for job sheet */}
         <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-20 h-8 bg-gray-700 rounded-b-lg shadow-md flex items-center justify-center">
            <div className="w-12 h-1 bg-gray-500 rounded-full"></div>
         </div>

         <div className="text-center mb-6 pt-4">
             <h2 className="font-serif font-black text-2xl text-gray-800 uppercase tracking-wide">Job Sheet</h2>
             <p className="font-mono text-xs text-trust-blue font-bold mt-1">CONNECTING NEIGHBORS</p>
         </div>

         <div className="bg-gray-50 p-4 rounded border border-gray-200 mb-6">
            <h3 className="font-bold text-lg text-gray-800 mb-1">{selectedPost?.title}</h3>
            <p className="font-mono text-xs text-gray-500 mb-3">Posted by {selectedPost?.author} • {selectedPost?.timeAgo}</p>
            <p className="text-gray-600 italic text-sm border-l-4 border-gray-300 pl-3">"{selectedPost?.description}"</p>
         </div>

         <div className="space-y-3">
            {isConnecting ? (
               <div className="bg-trust-blue text-white py-4 rounded font-bold text-center flex items-center justify-center gap-3">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>ESTABLISHING SECURE LINE...</span>
               </div>
            ) : (
                <>
                    <button 
                        onClick={handleConnect}
                        className="w-full py-4 bg-trust-blue text-white font-black font-serif text-lg tracking-wider rounded shadow-[4px_4px_0px_rgba(0,0,0,0.2)] hover:bg-blue-400 hover:translate-y-[1px] hover:shadow-[2px_2px_0px_rgba(0,0,0,0.2)] transition-all flex items-center justify-center gap-2"
                    >
                        <span>📹</span> VIDEO ASSIST
                    </button>
                    <button 
                         onClick={() => { alert("Chat feature coming soon!"); }}
                        className="w-full py-4 bg-white text-gray-700 border-2 border-gray-300 font-bold font-serif text-lg tracking-wider rounded shadow-[2px_2px_0px_rgba(0,0,0,0.1)] hover:bg-gray-50 hover:translate-y-[1px] transition-all flex items-center justify-center gap-2"
                    >
                        <span>💬</span> TEXT CHAT
                    </button>
                </>
            )}
         </div>

         <p className="text-center text-[10px] text-gray-400 mt-6 max-w-[200px] mx-auto">
            Your phone number is hidden. Community guidelines apply.
         </p>
      </div>
    </div>
  );

  // Views
  const renderView = () => {
    switch (currentView) {
      case AppView.DASHBOARD:
        return (
          <div className="p-6 h-full flex flex-col relative overflow-hidden no-scrollbar pb-24">
            {/* Header */}
            <div className="flex justify-between items-start pt-2 mb-10">
              <div>
                <p className="font-mono text-ivory/60 text-xs mb-1">WORKBENCH</p>
                <h1 className="text-4xl font-serif text-ivory font-black">Hi, {profile.name}.</h1>
              </div>
              <div className="flex gap-2">
                 <div 
                  onClick={() => setCurrentView(AppView.SETTINGS)}
                  className="bg-gray-200 p-2 rounded-lg border-b-4 border-gray-400 cursor-pointer hover:translate-y-1 hover:border-b-0 transition-all active:shadow-inner"
                >
                  <span className="text-2xl">⚙️</span>
                </div>
                <div 
                  onClick={() => setCurrentView(AppView.LUNCHBOX)}
                  className="bg-gray-200 p-2 rounded-lg border-b-4 border-gray-400 cursor-pointer hover:translate-y-1 hover:border-b-0 transition-all active:shadow-inner"
                >
                  <span className="text-2xl">🍱</span>
                </div>
              </div>
            </div>

            {/* Main Action - Clipboard Style */}
            <div 
              onClick={() => setCurrentView(AppView.SCANNER)}
              className="bg-paper p-1 rounded-sm shadow-[10px_10px_0px_rgba(0,0,0,0.2)] transform rotate-1 hover:rotate-0 hover:scale-[1.02] transition-all cursor-pointer group shrink-0 mb-10"
            >
              <div className="border-4 border-walnut-dark p-8 flex flex-col items-center text-center border-dashed">
                <div className="w-24 h-24 bg-walnut-dark rounded-full flex items-center justify-center mb-6 shadow-lg group-hover:bg-confidence-green transition-colors">
                   <span className="text-4xl text-ivory">🛠️</span>
                </div>
                <h2 className="text-3xl font-serif font-black text-walnut-dark mb-2">NEW FIX</h2>
                <p className="font-mono text-gray-500 text-sm">SNAP A PHOTO OR DESCRIBE</p>
              </div>
            </div>

            {/* SPACER TO PUSH LOWER ITEMS DOWN */}
            <div className="h-12 w-full shrink-0"></div>

            {/* Lower Workbench Area */}
            <div className="flex flex-col gap-8 pb-8">
                {/* My Requests Section */}
                {myPosts.length > 0 && (
                  <div className="shrink-0">
                    <div className="flex items-center gap-2 mb-3 border-b border-ivory/20 pb-2">
                        <span className="text-xl">📋</span>
                        <h3 className="font-serif font-bold text-ivory tracking-wide">MY OPEN REQUESTS</h3>
                    </div>
                    <div className="space-y-3">
                      {myPosts.map((post) => (
                        <div key={post.id} className="bg-paper rounded shadow-md p-4 flex justify-between items-center transform -rotate-1">
                            <div>
                              <h4 className="font-bold text-gray-800">{post.title}</h4>
                              <p className="text-xs font-mono text-gray-500">Posted {post.timeAgo}</p>
                            </div>
                            <span className="bg-gray-100 text-gray-500 text-[10px] font-bold px-2 py-1 rounded">PENDING</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Quick Tips Taped to Bench */}
                <div className="w-full overflow-x-auto no-scrollbar shrink-0">
                  <div className="flex gap-4">
                    {QUICK_TIPS.map((tip, idx) => (
                      <div 
                        key={idx} 
                        onClick={() => handleAnalyze(tip.query)}
                        className="bg-yellow-100 min-w-[140px] p-4 shadow-sm flex flex-col justify-between h-28 transform -rotate-1 relative cursor-pointer hover:rotate-1 hover:-translate-y-1 transition-all active:scale-95 group"
                      >
                        {/* Tape */}
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-16 h-6 bg-white/40 rotate-1 backdrop-blur-sm shadow-sm"></div>
                        <span className="text-3xl group-hover:scale-110 transition-transform">{tip.icon}</span>
                        <div>
                          <h4 className="font-bold font-serif text-gray-800 text-sm leading-tight group-hover:text-confidence-green transition-colors">{tip.title}</h4>
                          <span className="font-mono text-xs text-gray-500">{tip.time}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
            </div>

          </div>
        );

      case AppView.SCANNER:
        return <Scanner onAnalyze={handleAnalyze} loadingState={loadingState} />;

      case AppView.FIX_GUIDE:
        return currentPlan ? (
          <FixGuide 
            plan={currentPlan} 
            onGenerateImage={handleGenerateImage} 
            loadingState={loadingState}
            onFindTools={() => setCurrentView(AppView.TOOL_FINDER)}
          />
        ) : <div className="p-10 text-ivory font-mono text-center">Loading Fix Plan...</div>;

      case AppView.TOOL_FINDER:
        return <ToolFinder toolQuery={currentPlan ? (currentPlan.tools || []).map(t => t.name).join(", ") : "hardware"} />;
      
      case AppView.LUNCHBOX:
        return <Lunchbox />;

      case AppView.COMMUNITY:
        return (
          <div className="p-6 h-full flex flex-col relative z-10 overflow-y-auto no-scrollbar pb-24">
            <h2 className="text-3xl font-serif font-black text-ivory mb-6 border-b-4 border-ivory/20 pb-2">THE BENCH</h2>
            <p className="text-ivory/60 font-mono text-xs mb-6">NEIGHBORHOOD PROJECTS NEEDING A HAND</p>
            
            <div className="grid gap-6">
              {communityPosts.map((post, idx) => (
                <div 
                    key={post.id} 
                    onClick={() => setSelectedPost(post)}
                    className={`bg-paper p-5 shadow-lg relative ${idx % 2 === 0 ? 'rotate-1' : '-rotate-1'} transition-transform hover:rotate-0 hover:z-10 hover:scale-[1.02] cursor-pointer group`}
                >
                  {/* Pin Graphic */}
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-red-500 shadow-sm border-2 border-red-700"></div>
                  
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold font-serif text-xl text-gray-800 leading-tight group-hover:text-trust-blue transition-colors">{post.title}</h3>
                    <span className="font-mono text-[10px] text-gray-400 uppercase tracking-wider">{post.timeAgo}</span>
                  </div>
                  
                  <p className="text-gray-600 font-sans text-sm mb-4 leading-relaxed">{post.description}</p>
                  
                  <div className="flex justify-between items-center border-t border-gray-200 pt-3">
                    <div className="flex items-center gap-2">
                       <div className="w-6 h-6 rounded-full bg-gray-300 flex items-center justify-center text-xs font-bold text-gray-600">
                         {post.author.charAt(0)}
                       </div>
                       <span className="text-xs font-bold text-gray-500">{post.author}</span>
                    </div>
                    <button className="px-3 py-1 bg-trust-blue text-white text-xs font-bold rounded shadow-sm hover:bg-blue-500 uppercase transition-colors group-hover:shadow-md">
                      Lend a Hand
                    </button>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-8 text-center opacity-50">
               <p className="text-ivory font-mono text-xs">END OF BOARD</p>
            </div>
          </div>
        );

      case AppView.ASK_HELP:
        return (
          <div className="p-6 h-full flex flex-col relative z-10 overflow-hidden pb-24">
             <h2 className="text-3xl font-serif font-black text-ivory mb-2 border-b-4 border-ivory/20 pb-2">ASK FOR HELP</h2>
             <p className="text-ivory/60 font-mono text-xs mb-8">POST YOUR PROJECT TO THE BENCH</p>
             
             <form onSubmit={handleSubmitHelp} className="bg-paper p-6 rounded-sm shadow-[8px_8px_0px_rgba(0,0,0,0.2)] rotate-1">
                <div className="mb-4">
                  <label className="block font-bold font-serif text-gray-700 mb-2">Project Title</label>
                  <input 
                    type="text" 
                    value={newPostTitle}
                    onChange={(e) => setNewPostTitle(e.target.value)}
                    placeholder="e.g. Broken Deck Chair"
                    className="w-full bg-gray-100 border-2 border-gray-300 p-3 rounded font-sans focus:outline-none focus:border-confidence-green"
                    required
                  />
                </div>
                
                <div className="mb-6">
                  <label className="block font-bold font-serif text-gray-700 mb-2">Description</label>
                  <textarea 
                    value={newPostDesc}
                    onChange={(e) => setNewPostDesc(e.target.value)}
                    placeholder="Describe what's wrong..."
                    rows={4}
                    className="w-full bg-gray-100 border-2 border-gray-300 p-3 rounded font-sans focus:outline-none focus:border-confidence-green"
                    required
                  ></textarea>
                </div>
                
                <button 
                  type="submit"
                  className="w-full py-3 bg-confidence-green text-white font-black font-serif text-lg tracking-wider rounded shadow-md border-b-4 border-green-800 active:border-b-0 active:translate-y-1 transition-all"
                >
                  POST TICKET
                </button>
             </form>

             <div className="mt-8 bg-walnut-dark/50 p-4 rounded border border-ivory/10">
                <div className="flex items-start gap-3">
                   <span className="text-2xl">💡</span>
                   <div>
                      <h4 className="font-bold text-ivory text-sm">Tip for faster help</h4>
                      <p className="text-ivory/60 text-xs mt-1">Include a clear description of the problem. Photos can be added after someone accepts your request.</p>
                   </div>
                </div>
             </div>
          </div>
        );

      case AppView.SETTINGS:
        return (
          <div className="p-6 h-full flex flex-col relative z-10 overflow-y-auto no-scrollbar pb-24">
              <div className="flex items-center gap-4 mb-6 border-b-4 border-ivory/20 pb-2">
                 <button onClick={() => setCurrentView(AppView.DASHBOARD)} className="text-ivory text-xl">←</button>
                 <h2 className="text-3xl font-serif font-black text-ivory">SETUP</h2>
              </div>
              
              <div className="space-y-4">
                  <div className="bg-paper p-4 rounded shadow-md transform rotate-1">
                      <h3 className="font-bold font-serif text-gray-800 mb-4">PREFERENCES</h3>
                      
                      {/* Existing Sound Pref */}
                      <div className="flex justify-between items-center border-b border-dashed border-gray-300 pb-3 mb-3">
                          <span className="font-mono text-sm text-gray-600">Sound Effects</span>
                          <div className="w-10 h-5 bg-confidence-green rounded-full relative cursor-pointer shadow-inner">
                            <div className="absolute right-1 top-1 w-3 h-3 bg-white rounded-full shadow"></div>
                          </div>
                      </div>

                      {/* New Units Pref */}
                      <div className="flex justify-between items-center border-b border-dashed border-gray-300 pb-3 mb-3">
                        <span className="font-mono text-sm text-gray-600">Measurement Units</span>
                        <div className="flex bg-gray-200 rounded p-1 shadow-inner cursor-pointer">
                            <span className="px-2 py-1 text-[10px] font-bold text-gray-400">IMPERIAL</span>
                            <span className="px-2 py-1 text-[10px] font-bold bg-white rounded shadow text-gray-800">METRIC</span>
                        </div>
                      </div>

                      {/* New Haptics Pref */}
                      <div className="flex justify-between items-center border-b border-dashed border-gray-300 pb-3 mb-3">
                          <span className="font-mono text-sm text-gray-600">Haptic Feedback</span>
                          <div className="w-10 h-5 bg-confidence-green rounded-full relative cursor-pointer shadow-inner">
                            <div className="absolute right-1 top-1 w-3 h-3 bg-white rounded-full shadow"></div>
                          </div>
                      </div>

                      {/* New Voice Guide Pref */}
                      <div className="flex justify-between items-center border-b border-dashed border-gray-300 pb-3 mb-3">
                          <span className="font-mono text-sm text-gray-600">Voice Coach</span>
                          <div className="w-10 h-5 bg-gray-300 rounded-full relative cursor-pointer shadow-inner">
                            <div className="absolute left-1 top-1 w-3 h-3 bg-white rounded-full shadow"></div>
                          </div>
                      </div>

                      {/* Existing Contrast Pref */}
                      <div className="flex justify-between items-center">
                          <span className="font-mono text-sm text-gray-600">High Contrast</span>
                          <div className="w-10 h-5 bg-gray-300 rounded-full relative cursor-pointer shadow-inner">
                            <div className="absolute left-1 top-1 w-3 h-3 bg-white rounded-full shadow"></div>
                          </div>
                      </div>
                  </div>

                  <div className="bg-paper p-4 rounded shadow-md transform -rotate-1">
                      <h3 className="font-bold font-serif text-gray-800 mb-2">ACCOUNT</h3>
                       <div className="flex justify-between items-center mb-2">
                          <span className="font-mono text-sm text-gray-600">Member Status</span>
                          <span className="font-bold text-confidence-green text-xs bg-green-100 px-2 py-1 rounded">PRO FIXER</span>
                      </div>
                      <button 
                        onClick={() => setShowSubscriptionModal(true)}
                        className="w-full py-2 bg-gray-200 text-gray-600 font-bold text-xs rounded uppercase tracking-wider hover:bg-gray-300 transition-colors"
                      >
                        Manage Subscription
                      </button>
                  </div>
                  
                  <div className="bg-paper/10 p-4 rounded border border-ivory/20 text-center mt-8">
                     <p className="font-mono text-xs text-ivory/50">HandyMate v1.0.0</p>
                  </div>
              </div>
          </div>
        );

      default:
        return <div className="p-10 text-center text-ivory">Work in Progress</div>;
    }
  };

  return (
    <div className="max-w-md mx-auto h-screen flex flex-col bg-walnut shadow-2xl overflow-hidden relative">
      {/* Wood Texture Overlay */}
      <div className="absolute inset-0 texture-grain pointer-events-none z-0"></div>

      {/* Viewport */}
      <main className="flex-1 overflow-hidden relative z-10">
        {renderView()}

        {/* Dashboard Loading Overlay */}
        {loadingState === LoadingState.ANALYZING && currentView === AppView.DASHBOARD && (
           <div className="absolute inset-0 z-50 bg-walnut/80 backdrop-blur-sm flex flex-col items-center justify-center animate-fade-in">
              <div className="w-20 h-20 bg-walnut-dark rounded-full flex items-center justify-center shadow-xl border-4 border-ivory mb-4 animate-bounce">
                <span className="text-4xl">🤔</span>
              </div>
              <h3 className="font-serif font-black text-2xl text-ivory tracking-widest mb-2">THINKING...</h3>
              <p className="font-mono text-ivory/60 text-xs">REVIEWING 1,000+ MANUALS</p>
           </div>
        )}
        
        {/* Modals */}
        {showSubscriptionModal && <SubscriptionModal />}
        {selectedPost && <HelpOfferModal />}

      </main>

      {/* Bottom Tool Rail (Nav) */}
      <nav className="h-24 bg-walnut-dark relative z-20 shrink-0 flex items-end justify-between px-6 pb-4 border-t-8 border-black/20 shadow-[0_-10px_20px_rgba(0,0,0,0.3)]">
         {/* Screw heads visuals */}
         <div className="absolute top-2 left-2 w-3 h-3 rounded-full bg-gray-600 shadow-inner flex items-center justify-center"><div className="w-2 h-0.5 bg-gray-800 rotate-45"></div></div>
         <div className="absolute top-2 right-2 w-3 h-3 rounded-full bg-gray-600 shadow-inner flex items-center justify-center"><div className="w-2 h-0.5 bg-gray-800 rotate-45"></div></div>

        <button 
          onClick={() => setCurrentView(AppView.DASHBOARD)}
          className={`flex flex-col items-center group w-20 transition-all ${currentView === AppView.DASHBOARD ? 'opacity-100 scale-105' : 'opacity-60'}`}
        >
          <div className={`w-12 h-12 flex items-center justify-center rounded-lg shadow-lg border-b-4 group-active:border-b-0 group-active:translate-y-1 transition-all ${currentView === AppView.DASHBOARD ? 'bg-confidence-green border-green-900' : 'bg-gray-700 border-gray-900'}`}>
             <span className="text-2xl">🏠</span>
          </div>
          <span className={`text-[10px] font-bold mt-1 font-mono tracking-widest ${currentView === AppView.DASHBOARD ? 'text-confidence-green' : 'text-ivory'}`}>HOME</span>
        </button>

        <button 
          onClick={() => setCurrentView(AppView.COMMUNITY)}
          className={`flex flex-col items-center group w-20 transition-all ${currentView === AppView.COMMUNITY ? 'opacity-100 scale-105' : 'opacity-60'}`}
        >
          <div className={`w-12 h-12 flex items-center justify-center rounded-lg shadow-lg border-b-4 group-active:border-b-0 group-active:translate-y-1 transition-all ${currentView === AppView.COMMUNITY ? 'bg-confidence-green border-green-900' : 'bg-gray-700 border-gray-900'}`}>
             <span className="text-2xl">🪑</span>
          </div>
          <span className={`text-[10px] font-bold mt-1 font-mono tracking-widest ${currentView === AppView.COMMUNITY ? 'text-confidence-green' : 'text-ivory'}`}>BENCH</span>
        </button>

        <button 
           onClick={() => setCurrentView(AppView.ASK_HELP)}
           className={`flex flex-col items-center group w-20 transition-all ${currentView === AppView.ASK_HELP ? 'opacity-100 scale-105' : 'opacity-60'}`}
        >
          <div className={`w-12 h-12 flex items-center justify-center rounded-lg shadow-lg border-b-4 group-active:border-b-0 group-active:translate-y-1 transition-all ${currentView === AppView.ASK_HELP ? 'bg-confidence-green border-green-900' : 'bg-gray-700 border-gray-900'}`}>
            <span className="text-2xl">📣</span>
          </div>
          <span className={`text-[10px] font-bold mt-1 font-mono tracking-widest ${currentView === AppView.ASK_HELP ? 'text-confidence-green' : 'text-ivory'}`}>ASK</span>
        </button>
      </nav>
    </div>
  );
};

export default App;
