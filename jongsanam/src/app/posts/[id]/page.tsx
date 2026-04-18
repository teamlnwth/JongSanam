import prisma from '@/lib/prisma'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { joinMatch, cancelPost, kickParticipant, addComment, submitReview } from '@/app/actions'
import { createClient } from '@/lib/supabase/server'
import { SubmitButton } from '@/components/SubmitButton'

export default async function PostDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ error?: string }>
}) {
  const { id } = await params
  const { error } = await searchParams

  const post = await prisma.post.findUnique({
    where: { id },
    include: {
      host: true,
      bookings: {
        include: { user: true },
        orderBy: { joinedAt: 'asc' },
      },
      comments: {
        include: { user: true },
        orderBy: { createdAt: 'asc' },
      },
      reviews: true
    },
  })

  if (!post) notFound()

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  let profile = null
  if (user) {
    profile = await prisma.profile.findUnique({ where: { id: user.id } })
  }

  const isHost = user?.id === post.hostId || profile?.role === 'ADMIN'
  const isJoined = post.bookings.some((b: { userId: string }) => b.userId === user?.id)
  const isCancelled = post.status === 'CANCELLED'

  const pricePerPerson = Number(post.totalPrice) / post.maxPlayers
  const currentPlayers = post.bookings.length
  const isFull = currentPlayers >= post.maxPlayers

  const endTime = new Date(post.startTime.getTime() + post.duration * 60 * 1000)
  const fmtTime = (d: Date) =>
    d.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Bangkok' })
  const fmtDate = (d: Date) =>
    d.toLocaleDateString('th-TH', { dateStyle: 'medium', timeZone: 'Asia/Bangkok' })

  return (
    <main className="min-h-screen bg-transparent p-4 md:p-10 text-slate-100 relative z-10 pt-24 md:pt-32">
      <div className="max-w-4xl mx-auto space-y-8 relative">

        {/* Top Navbar Back */}
        <div className="flex items-center justify-between mb-4">
          <Link href="/" className="group flex items-center gap-2 bg-white/5 px-5 py-2.5 rounded-full border border-white/10 hover:bg-white/10 transition-all text-sm font-bold text-slate-300 hover:text-white">
            <span className="group-hover:-translate-x-1 transition-transform">←</span> Back to Dashboard
          </Link>
          {isCancelled && (
            <span className="bg-red-500/10 text-red-400 font-bold px-4 py-2 rounded-full text-xs border border-red-500/20 flex items-center gap-2 shadow-sm uppercase tracking-wider">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
              </span>
              Instance Terminated
            </span>
          )}
        </div>

        {/* Post Hero Card */}
        <div className="bg-[#111827]/80 backdrop-blur-xl rounded-[2rem] shadow-2xl border border-white/10 overflow-hidden relative">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-blue-500/10 to-transparent rounded-bl-full pointer-events-none"></div>

          <div className="p-8 md:p-10 relative z-10">
            <div className="flex flex-wrap items-center gap-3 mb-6">
              <span className="bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs px-3 py-1.5 rounded-md font-bold tracking-wide uppercase">
                {post.sportType === 'FOOTBALL' ? '⚽ FOOTBALL' : '⚡ FUTSAL'}
              </span>
              {post.passcode && (
                <span className="bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xs px-3 py-1.5 rounded-md font-bold flex items-center gap-1.5 uppercase tracking-wide">
                  <span>🔒</span> Secured Network
                </span>
              )}
            </div>

            <h1 className="text-3xl md:text-5xl font-black text-white mb-8 tracking-tight leading-tight">
              {post.fieldName}
            </h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-black/20 rounded-[1.5rem] p-6 border border-white/5">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-xl text-slate-300">👤</div>
                <div>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Host Entity</p>
                  <p className="font-bold text-slate-200">{post.host?.name || 'Anonymous'}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-xl text-slate-300">📅</div>
                <div>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Execution Time</p>
                  <p className="font-bold text-slate-200">{fmtDate(post.startTime)}</p>
                  <p className="text-xs text-slate-400 font-medium font-mono mt-0.5">
                    {fmtTime(post.startTime)} → {fmtTime(endTime)} <span className="opacity-60 font-sans ml-1">({post.duration >= 60 ? `${post.duration / 60}h` : `${post.duration}m`})</span>
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-xl text-slate-300">💰</div>
                <div>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Total Payload</p>
                  <p className="font-black text-blue-400 text-xl">฿{Number(post.totalPrice).toLocaleString()}</p>
                </div>
              </div>
              <div className="flex items-center gap-4 p-4 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xl font-black">⚡</div>
                <div>
                  <p className="text-[10px] font-bold text-emerald-500/70 uppercase tracking-widest mb-0.5">P2P Split Cost</p>
                  <p className="font-black text-emerald-400 text-2xl">฿{pricePerPerson.toFixed(0)}</p>
                </div>
              </div>
            </div>

            {error && (
              <div className="mt-8 bg-red-500/10 text-red-400 border border-red-500/20 rounded-xl p-4 flex items-center gap-3 font-semibold text-sm">
                <span className="text-lg">⚠️</span> {decodeURIComponent(error)}
              </div>
            )}

            {/* Progress */}
            <div className="mt-10 mb-8 max-w-2xl mx-auto">
              <div className="flex justify-between items-end mb-3">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Node Capacity</span>
                <span className="font-black text-2xl text-white">{currentPlayers} <span className="text-slate-500 text-lg">/ {post.maxPlayers}</span></span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden shadow-inner">
                <div
                  className={`h-full rounded-full transition-all duration-1000 ${isFull ? 'bg-slate-500' : 'bg-gradient-to-r from-blue-500 to-indigo-500'}`}
                  style={{ width: `${Math.min((currentPlayers / post.maxPlayers) * 100, 100)}%` }}
                />
              </div>
            </div>

            {/* Actions & QR Code */}
            <div className="mt-8 border-t border-white/5 pt-8">
              {(isHost || isJoined) && post.host?.promptpayQR && (
                <div className="mb-8 p-6 bg-white/5 border border-white/10 rounded-2xl max-w-sm mx-auto backdrop-blur-md">
                  <h3 className="text-xs font-bold text-slate-400 mb-4 text-center uppercase tracking-wider">📱 Secure Payment Protocol (PromptPay)</h3>
                  <div className="bg-white p-2 rounded-xl flex justify-center hover:scale-105 transition-transform duration-300 shadow-xl shadow-blue-500/10">
                    <img src={post.host.promptpayQR} alt="PromptPay QR Code" className="w-48 h-48 object-contain rounded-lg" />
                  </div>
                  <p className="text-[10px] font-bold text-slate-500 text-center mt-4">Execute transfer before network joins.</p>
                </div>
              )}

              {isHost && !isCancelled && (
                <form action={cancelPost.bind(null, post.id)} className="max-w-sm mx-auto">
                  <SubmitButton
                    isFullWidth
                    className="text-red-400 text-xs font-bold bg-transparent border border-red-500/30 hover:border-red-500 hover:bg-red-500/10 py-4 rounded-xl transition-all"
                  >
                    TERMINATE INSTANCE
                  </SubmitButton>
                </form>
              )}

              {!isHost && !isJoined && !isCancelled && (
                <form action={joinMatch.bind(null, post.id)} className="space-y-4 max-w-md mx-auto">
                  {post.passcode && (
                    <div className="bg-amber-500/5 p-4 rounded-xl border border-amber-500/20 backdrop-blur-sm">
                      <label className="block text-xs font-bold text-amber-500/80 mb-3 text-center uppercase tracking-widest">
                        🔒 Decryption Key Required
                      </label>
                      <input
                        type="password"
                        name="passcode"
                        required
                        placeholder="Enter 4-6 Digit Pin"
                        className="w-full text-center tracking-[0.5em] text-lg font-mono bg-black/40 border border-amber-500/30 p-3 rounded-lg focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 outline-none transition-all placeholder:text-amber-500/30 placeholder:tracking-normal text-amber-400"
                      />
                    </div>
                  )}
                  <SubmitButton
                    isFullWidth
                    disabled={isFull}
                    className={`py-4 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${isFull
                        ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-white/5'
                        : 'bg-emerald-500/20 border border-emerald-500/50 text-emerald-400 hover:bg-emerald-500/30 hover:shadow-[0_0_20px_rgba(16,185,129,0.2)]'
                      }`}
                  >
                    {isFull ? 'CAPACITY LIMIT EXCEEDED' : 'EXECUTE JOIN'}
                  </SubmitButton>
                </form>
              )}
            </div>
          </div>
        </div>

        {/* Bookings List */}
        <div className="bg-[#111827]/80 backdrop-blur-xl rounded-[2rem] shadow-2xl border border-white/10 p-8 md:p-10">
          <h2 className="text-xl font-bold text-white mb-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-blue-400">❖</span> Network Nodes
            </div>
            <span className="bg-white/5 border border-white/10 text-slate-400 px-3 py-1 text-xs rounded-full uppercase tracking-wider">{currentPlayers}/{post.maxPlayers} Mapped</span>
          </h2>

          {post.bookings.length === 0 ? (
            <div className="text-center py-12 border border-dashed border-white/10 rounded-2xl bg-black/20">
              <span className="text-4xl mb-3 block opacity-20">🕳️</span>
              <p className="text-slate-500 font-mono text-sm">0 nodes connected. Awaiting connections.</p>
            </div>
          ) : (
            <ul className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {post.bookings.map((booking: typeof post.bookings[0], index: number) => (
                <li
                  key={booking.id}
                  className="flex flex-wrap items-center gap-4 p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-colors border border-white/5"
                >
                  <div className="w-10 h-10 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center font-black shadow-inner shadow-blue-500/10 text-sm shrink-0 border border-blue-500/30">
                    {index + 1}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-slate-200 truncate mb-1 text-sm">
                      {booking.user?.name || 'Anonymous_User'}
                    </p>
                    <p className="text-[10px] font-mono text-slate-500">
                      Connected: {booking.joinedAt.toLocaleString('en-US', { month: 'short', day: '2-digit', hour: '2-digit', minute:'2-digit', hour12: false, timeZone: 'Asia/Bangkok' })}
                    </p>
                  </div>
                  {index === 0 ? (
                    <span className="text-[10px] bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-2 py-1 rounded uppercase font-bold shrink-0 tracking-wide">
                      HOST
                    </span>
                  ) : (
                    isHost && (
                      <form action={kickParticipant.bind(null, post.id, booking.id)} className="shrink-0 self-start mt-1">
                        <SubmitButton pendingText="" className="text-[10px] bg-red-500/10 text-red-400 hover:bg-red-500/20 px-3 py-1 rounded border border-red-500/30 uppercase font-bold tracking-wider">
                          Eject
                        </SubmitButton>
                      </form>
                    )
                  )}

                  {/* Rating Form */}
                  <div className="w-full mt-2 col-span-2 sm:col-span-1 border-t border-white/5 pt-2">
                    {user?.id !== booking.user?.id && (isJoined || isHost) && !post.reviews?.some((r: any) => r.reviewerId === user?.id && r.revieweeId === booking.userId) && (
                      <form action={submitReview} className="flex gap-2 items-center bg-black/40 p-2 rounded-lg border border-white/5">
                        <input type="hidden" name="revieweeId" value={booking.userId} />
                        <input type="hidden" name="postId" value={post.id} />
                        <select name="rating" required defaultValue="" className="text-[10px] uppercase font-bold shrink-0 rounded px-2 py-1.5 border border-white/10 outline-none bg-[#0B0F19] text-amber-400 cursor-pointer">
                          <option value="" disabled className="text-slate-500">Rate</option>
                          <option value="5">5 ⭐ Excelnt</option>
                          <option value="4">4 ⭐ Good</option>
                          <option value="3">3 ⭐ Avg</option>
                          <option value="2">2 ⭐ Poor</option>
                          <option value="1">1 ⭐ Bad</option>
                        </select>
                        <input type="text" name="comment" placeholder="Optional log" autoComplete="off" className="text-[10px] px-2 py-1.5 min-w-[80px] w-full rounded border border-white/10 outline-none placeholder:text-slate-600 bg-[#0B0F19] font-mono text-slate-300" />
                        <SubmitButton pendingText="..." className="text-[10px] bg-blue-600/20 text-blue-400 hover:bg-blue-600/30 px-3 py-1.5 rounded transition-all uppercase font-bold tracking-wide border border-blue-500/30 shrink-0">
                          LOG
                        </SubmitButton>
                      </form>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Room Chat Section */}
        {(isHost || isJoined) && (
          <div className="bg-[#111827]/80 backdrop-blur-xl rounded-[2rem] shadow-2xl border border-white/10 overflow-hidden flex flex-col mt-8 h-[500px]">
            <div className="p-6 border-b border-white/5 bg-white/5 flex justify-between items-center shrink-0">
              <h2 className="text-lg font-bold text-white flex items-center gap-3">
                <span className="text-blue-400">▤</span> Encrypted Channel
              </h2>
              <span className="text-[10px] font-mono text-emerald-400 border border-emerald-500/30 bg-emerald-500/10 px-2 py-1 rounded uppercase tracking-wider">End-to-End</span>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-black/20">
              {post.comments.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center opacity-30 space-y-3">
                  <span className="text-4xl text-slate-500">∿</span>
                  <p className="text-slate-400 font-mono text-sm max-w-[200px]">Channel open. Transmit first packet.</p>
                </div>
              ) : (
                post.comments.map((comment: typeof post.comments[0]) => {
                  const isMine = comment.userId === user?.id
                  return (
                    <div key={comment.id} className={`flex flex-col ${isMine ? 'items-end' : 'items-start'} gap-1 max-w-[85%] ${isMine ? 'ml-auto' : 'mr-auto'}`}>
                      <div className="flex items-center gap-2 px-1">
                        {!isMine && <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{comment.user?.name || 'Anon'}</span>}
                        {comment.userId === post.hostId && (
                           <span className="text-[8px] bg-indigo-500/30 text-indigo-300 px-1.5 py-0.5 rounded font-black tracking-wide border border-indigo-500/50">HOST</span>
                        )}
                        {isMine && <span className="text-[10px] font-bold text-blue-400 uppercase">Local</span>}
                        <span className="text-[9px] text-slate-600 font-mono">{comment.createdAt.toLocaleString('en-US', {hour: '2-digit', minute:'2-digit', hour12: false, timeZone: 'Asia/Bangkok'})}</span>
                      </div>
                      <div className={`px-4 py-3 rounded-2xl text-sm font-medium shadow-sm leading-relaxed ${isMine ? 'bg-blue-600 text-white rounded-tr-sm shadow-blue-500/20' : 'bg-white/10 border border-white/10 text-slate-200 rounded-tl-sm'}`}>
                        {comment.content}
                      </div>
                    </div>
                  )
                })
              )}
            </div>

            <div className="p-4 bg-white/5 border-t border-white/5 shrink-0">
              <form action={addComment.bind(null, post.id)} className="flex items-center gap-2">
                <input
                  type="text"
                  name="content"
                  required
                  placeholder="Enter transmission..."
                  autoComplete="off"
                  className="flex-1 bg-black/40 border border-white/10 rounded-xl px-5 py-3 text-sm font-medium outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all placeholder:text-slate-600 text-slate-200"
                />
                <SubmitButton pendingText="" className="w-12 h-12 shrink-0 bg-blue-600 hover:bg-blue-500 text-white rounded-xl flex items-center justify-center font-bold transition-transform active:scale-95 group shadow-lg shadow-blue-500/20">
                  <span className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform">↗</span>
                </SubmitButton>
              </form>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
