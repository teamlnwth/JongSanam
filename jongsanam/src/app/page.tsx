import prisma from '@/lib/prisma'
import { createBookingPost, joinMatch } from './actions'
import Link from 'next/link'
import { SubmitButton } from '@/components/SubmitButton'

// SVG Icons
const ActivityIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>;
const BarChartIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20V10"/><path d="M18 20V4"/><path d="M6 20v-4"/></svg>;
const UsersIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>;
const CheckCircleIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>;
const ShieldIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>;
const ZapIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>;
const CreditCardIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/></svg>;

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const { error } = await searchParams

  const twoDaysAgo = new Date()
  twoDaysAgo.setDate(twoDaysAgo.getDate() - 2)

  const posts = await prisma.post.findMany({
    where: {
      status: 'OPEN',
      startTime: {
        gte: twoDaysAgo,
      },
    },
    include: {
      bookings: true,
      host: true,
    },
    orderBy: { createdAt: 'desc' }
  })

  return (
    <main className="min-h-screen bg-[#0B0F19] text-slate-100 font-sans selection:bg-blue-500/30 overflow-hidden relative">
      {/* Abstract Glowing Backgrounds */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-600/20 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-purple-600/20 blur-[120px] pointer-events-none" />
      <div className="absolute top-[40%] left-[60%] w-[30%] h-[30%] rounded-full bg-emerald-600/10 blur-[120px] pointer-events-none" />



      <div className="max-w-7xl mx-auto px-6 pt-32 pb-20 relative z-10">
        {/* Header Hero Section */}
        <section className="grid lg:grid-cols-2 gap-12 items-center min-h-[70vh]">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-sm font-medium text-blue-400">
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
              v2.0 Analytics Engine is Live
            </div>
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight leading-[1.1]">
              Data-Driven <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400">
                Sports Matching.
              </span>
            </h1>
            <p className="text-lg md:text-xl text-slate-400 font-light max-w-lg leading-relaxed">
              JongSanam transforms how you find players, split costs, and secure fields. Powered by real-time analytics and seamless team integration.
            </p>
            <div className="flex flex-wrap items-center gap-4">
              <a href="#dashboard" className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-4 rounded-xl font-bold transition-all shadow-[0_0_20px_rgba(37,99,235,0.3)] hover:shadow-[0_0_30px_rgba(37,99,235,0.5)]">
                Launch Dashboard
              </a>
              <a href="#features" className="px-8 py-4 rounded-xl font-bold text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-all flex items-center gap-2">
                <ActivityIcon /> View Live Metrics
              </a>
            </div>
          </div>

          {/* Real-time Data Visualization (Mock Dashboard) */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/10 to-purple-500/10 rounded-2xl transform rotate-3 scale-105 blur-lg"></div>
            <div className="bg-[#111827]/80 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl relative">
              <div className="flex items-center justify-between mb-6 border-b border-white/10 pb-4">
                <div className="flex items-center gap-3">
                  <BarChartIcon />
                  <span className="font-semibold text-sm">Real-time Platform Activity</span>
                </div>
                <div className="flex bg-white/5 p-1 rounded-lg">
                  <span className="text-xs px-2 py-1 bg-white/10 rounded text-slate-200">1H</span>
                  <span className="text-xs px-2 py-1 text-slate-400">24H</span>
                  <span className="text-xs px-2 py-1 text-slate-400">7D</span>
                </div>
              </div>
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/5 border border-white/5 rounded-xl p-4">
                    <p className="text-slate-400 text-xs mb-1">Active Matches</p>
                    <p className="text-2xl font-bold text-blue-400">{posts.length > 0 ? posts.length + 12 : 12}</p>
                    <div className="mt-2 h-1 w-full bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500 w-[60%] rounded-full"></div>
                    </div>
                  </div>
                  <div className="bg-white/5 border border-white/5 rounded-xl p-4">
                    <p className="text-slate-400 text-xs mb-1">Players Looking</p>
                    <p className="text-2xl font-bold text-emerald-400">348</p>
                    <div className="mt-2 h-1 w-full bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500 w-[85%] rounded-full"></div>
                    </div>
                  </div>
                </div>
                <div>
                  <p className="text-slate-400 text-xs mb-2">Matching Velocity</p>
                  <div className="h-24 flex items-end gap-2">
                    {[40, 70, 45, 90, 65, 85, 100, 60, 80].map((h, i) => (
                      <div key={i} className="flex-1 bg-blue-500/20 hover:bg-blue-500/40 rounded-t-sm relative group transition-all" style={{ height: `${h}%` }}>
                        <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 bg-slate-800 text-[10px] px-2 py-1 rounded transition-opacity">
                          {h * 12}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Trust Badges */}
        <section className="py-12 border-y border-white/5 mt-12 overflow-hidden">
          <p className="text-center text-sm font-medium text-slate-500 tracking-widest uppercase mb-8">Trusted by 500+ Local Stadiums & Networks</p>
          <div className="flex flex-wrap justify-center gap-12 md:gap-24 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
            <div className="flex items-center gap-2 font-bold text-xl"><ShieldIcon /> FieldMaster</div>
            <div className="flex items-center gap-2 font-bold text-xl"><UsersIcon /> ThaiSports Net</div>
            <div className="flex items-center gap-2 font-bold text-xl"><ZapIcon /> ArenaSync</div>
            <div className="flex items-center gap-2 font-bold text-xl"><ActivityIcon /> MatchPro</div>
          </div>
        </section>

        {/* Feature Highlights */}
        <section id="features" className="py-24">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">Built for <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">High Performance</span></h2>
            <p className="text-slate-400 max-w-2xl mx-auto">Everything you need to organize, join, and manage football matches with enterprise-grade reliability and analytics.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white/5 border border-white/10 p-8 rounded-3xl hover:bg-white/10 transition-colors group">
              <div className="w-12 h-12 bg-blue-500/20 rounded-2xl flex items-center justify-center text-blue-400 mb-6 group-hover:scale-110 transition-transform">
                <ZapIcon />
              </div>
              <h3 className="text-xl font-bold mb-3">Real-time Matching</h3>
              <p className="text-slate-400 text-sm leading-relaxed">Our proprietary algorithm matches players to fields instantly. No more waiting or unorganized Line groups.</p>
            </div>
            <div className="bg-white/5 border border-white/10 p-8 rounded-3xl hover:bg-white/10 transition-colors group relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10 blur-[2px] group-hover:opacity-20 transition-opacity">
                <BarChartIcon />
              </div>
              <div className="w-12 h-12 bg-purple-500/20 rounded-2xl flex items-center justify-center text-purple-400 mb-6 group-hover:scale-110 transition-transform">
                <ActivityIcon />
              </div>
              <h3 className="text-xl font-bold mb-3">Advanced Analytics</h3>
              <p className="text-slate-400 text-sm leading-relaxed">Track join rates, optimal play times, and total cost splitting across all your hosted matches historically.</p>
            </div>
            <div className="bg-white/5 border border-white/10 p-8 rounded-3xl hover:bg-white/10 transition-colors group">
              <div className="w-12 h-12 bg-emerald-500/20 rounded-2xl flex items-center justify-center text-emerald-400 mb-6 group-hover:scale-110 transition-transform">
                <ShieldIcon />
              </div>
              <h3 className="text-xl font-bold mb-3">Secure Access</h3>
              <p className="text-slate-400 text-sm leading-relaxed">Enterprise-grade room security with passcode protection. Keep your private matches truly private.</p>
            </div>
          </div>
        </section>

        {/* Core App Logic - Dashboard */}
        <section id="dashboard" className="py-24 relative">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">Command <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">Center</span></h2>
            <p className="text-slate-400 max-w-2xl mx-auto">Deploy a new match or monitor active instances from your centralized dashboard.</p>
          </div>

          <div className="grid lg:grid-cols-12 gap-8">
            
            {/* Create Post Form */}
            <div className="lg:col-span-4 flex flex-col">
              <div className="bg-[#111827]/80 backdrop-blur-xl border border-white/10 rounded-3xl p-6 md:p-8 flex-1 flex flex-col shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-blue-500/10 to-transparent rounded-bl-full pointer-events-none"></div>
                
                <div className="mb-8 relative z-10">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse shadow-[0_0_10px_rgba(52,211,153,0.8)]"></span>
                    <h2 className="text-xl font-bold text-white">Initialize New Match</h2>
                  </div>
                  <p className="text-slate-400 text-sm">Deploy configuration parameters for new listing</p>
                </div>

                {error && (
                  <div className="bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl p-4 mb-6 text-sm font-semibold flex items-center gap-3">
                    <span className="text-lg">⚠️</span> {decodeURIComponent(error)}
                  </div>
                )}

                <form action={createBookingPost} className="flex flex-col gap-4 flex-1 relative z-10">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 ml-1">Field EndPoint</label>
                    <input name="fieldName" placeholder="Stadium Name" required className="w-full bg-black/30 border border-white/10 p-3 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all placeholder:text-slate-600 text-sm" />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 ml-1">Type</label>
                        <select name="sportType" className="w-full bg-black/30 border border-white/10 p-3 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all text-sm text-slate-200 appearance-none cursor-pointer">
                        <option value="FOOTBALL" className="bg-slate-900">FOOTBALL (11v11)</option>
                        <option value="FUTSAL" className="bg-slate-900">FUTSAL (5v5)</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 ml-1">Capacity</label>
                        <input type="number" name="maxPlayers" placeholder="Target Players" required className="w-full bg-black/30 border border-white/10 p-3 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all placeholder:text-slate-600 text-sm" />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 bg-black/20 p-4 rounded-2xl border border-white/5">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 ml-1">Exec. Time</label>
                      <input type="datetime-local" name="startTime" required className="w-full bg-black/30 border border-white/10 p-3 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all text-sm text-slate-200 [color-scheme:dark]" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 ml-1">Uptime (Hrs)</label>
                      <input type="number" name="duration" placeholder="Ex: 2" min="1" max="12" step="0.5" required className="w-full bg-black/30 border border-white/10 p-3 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all text-sm placeholder:text-slate-600" />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 ml-1">Total Resource Cost (฿)</label>
                    <input type="number" name="totalPrice" placeholder="Total Budget" required className="w-full bg-black/30 border border-white/10 p-3 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all placeholder:text-slate-600 text-sm" />
                  </div>
                  
                  <div className="relative">
                     <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 ml-1">Access Protocol</label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500"><ShieldIcon /></span>
                      <input name="passcode" type="password" placeholder="Passcode (Optional)" className="w-full bg-black/30 border border-white/10 py-3 pr-3 pl-10 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all placeholder:text-slate-600 text-sm" />
                    </div>
                  </div>

                  <div className="mt-auto pt-6">
                    <SubmitButton isFullWidth className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm py-3.5 rounded-xl transition-all duration-200">
                      Deploy Match Instance
                    </SubmitButton>
                  </div>
                </form>
              </div>
            </div>

            {/* Feed Section */}
            <div className="lg:col-span-8 flex flex-col">
              <div className="flex items-end justify-between mb-6 px-2">
                <div>
                  <h3 className="text-xl font-bold flex items-center gap-2"><ActivityIcon /> Active Instances</h3>
                </div>
                <div className="bg-white/10 border border-white/20 text-slate-300 font-bold text-xs px-3 py-1 rounded-full flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-blue-500"></span> {posts.length} Online
                </div>
              </div>
              
              {posts.length === 0 && (
                <div className="flex-1 flex flex-col items-center justify-center py-16 bg-[#111827]/40 border border-dashed border-white/10 rounded-3xl backdrop-blur-sm empty-state">
                  <div className="p-4 bg-white/5 rounded-full mb-4">
                    <ActivityIcon />
                  </div>
                  <p className="text-slate-400 font-medium">System Idle. Awaiting new match deployments.</p>
                </div>
              )}

              <div className="space-y-4">
                {posts.map((post: typeof posts[0]) => {
                  const pricePerPerson = Number(post.totalPrice) / post.maxPlayers;
                  const currentPlayers = post.bookings.length;
                  const isFull = currentPlayers >= post.maxPlayers;
                  const hasPasscode = !!post.passcode;

                  return (
                    <div key={post.id} className="bg-[#111827]/60 backdrop-blur-md border border-white/10 p-5 rounded-2xl hover:border-white/20 transition-all flex flex-col md:flex-row justify-between items-start md:items-center gap-4 group">
                      
                      <div className="flex-1">
                        <Link href={`/posts/${post.id}`} className="block w-full">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] px-2 py-0.5 rounded-md font-bold tracking-wide uppercase">
                              {post.sportType}
                            </span>
                            {hasPasscode && (
                              <span className="bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[10px] px-2 py-0.5 rounded-md font-bold uppercase flex items-center gap-1">
                                SECURED
                              </span>
                            )}
                            {isFull && (
                              <span className="bg-slate-800 text-slate-400 text-[10px] px-2 py-0.5 rounded-md font-bold uppercase">
                                CAPACITY REACHED
                              </span>
                            )}
                          </div>
                          
                          <h3 className="text-lg font-bold text-white group-hover:text-blue-400 transition-colors line-clamp-1">{post.fieldName}</h3>
                        </Link>

                        <div className="flex flex-wrap gap-x-4 gap-y-2 mt-3">
                          <div className="flex items-center gap-1.5 text-xs text-slate-400">
                            <UsersIcon /> 
                            <span>{post.host?.name || 'Anonymous User'}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-xs text-slate-400">
                            <CreditCardIcon /> 
                            <span>Total Pool: ฿{Number(post.totalPrice).toLocaleString()}</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2 mt-4 text-xs font-mono text-slate-400">
                          <div className="bg-white/5 px-2 py-1 rounded border border-white/5">
                            {post.startTime.toLocaleString('en-US', { month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'Asia/Bangkok' })}
                          </div>
                          <span className="text-slate-600">→</span>
                          <div>
                            Uptime: {post.duration >= 60 ? `${post.duration / 60}h` : `${post.duration}m`}
                          </div>
                        </div>
                      </div>

                      <div className="w-full md:w-auto md:min-w-[200px] bg-black/40 p-4 rounded-xl border border-white/5 flex flex-col">
                        <div className="flex justify-between items-end mb-3">
                          <div>
                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-0.5">Split Cost</p>
                            <p className="text-xl font-bold text-emerald-400">฿{pricePerPerson.toFixed(0)}</p>
                          </div>
                          <div className="text-right">
                             <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-0.5">Payload</p>
                             <p className="text-sm font-bold text-slate-300"><span className={isFull ? "text-red-400" : "text-white"}>{currentPlayers}</span> / {post.maxPlayers}</p>
                          </div>
                        </div>
                        
                        <div className="w-full bg-slate-800 rounded-full h-1 mb-4 overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-1000 ${isFull ? 'bg-slate-500' : 'bg-blue-500'}`}
                            style={{ width: `${Math.min((currentPlayers / post.maxPlayers) * 100, 100)}%` }}
                          />
                        </div>

                        {hasPasscode ? (
                          <Link href={`/posts/${post.id}`} className="w-full block text-center bg-white/10 text-white text-xs font-bold py-2 rounded-lg hover:bg-white/20 transition-all border border-white/10">
                            AUTH REQUIRED
                          </Link>
                        ) : (
                          <form action={joinMatch.bind(null, post.id)} className="w-full">
                            <button 
                              disabled={isFull}
                              className={`w-full text-xs font-bold py-2 rounded-lg transition-all ${
                                isFull 
                                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-white/5' 
                                  : 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 border border-emerald-500/30'
                              }`}
                            >
                              {isFull ? 'SYSTEM FULL' : 'EXECUTE JOIN'}
                            </button>
                          </form>
                        )}
                      </div>

                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </section>



        {/* Footer */}
        <footer className="py-8 border-t border-white/5 mt-12 text-center text-slate-500 text-sm">
          <p>© {new Date().getFullYear()} JongSanam.io Analytics. All rights reserved.</p>
        </footer>
      </div>
    </main>
  )
}