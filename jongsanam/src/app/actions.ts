'use server'

import prisma from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function getUser() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const isAdmin = user.email === 'pakawatpromhom@gmail.com'

  let profile = await prisma.profile.findUnique({ where: { id: user.id } })
  
  if (!profile) {
    profile = await prisma.profile.create({
      data: {
        id: user.id,
        email: user.email!,
        role: isAdmin ? 'ADMIN' : 'USER',
      }
    })
  } else if (isAdmin && profile.role !== 'ADMIN') {
    profile = await prisma.profile.update({
      where: { id: user.id },
      data: { role: 'ADMIN' }
    })
  }

  if (profile.isBanned) {
    redirect('/login?error=' + encodeURIComponent('บัญชีของคุณถูกแบนจากระบบ'))
  }

  return profile
}

export async function createBookingPost(formData: FormData) {
  const user = await getUser()

  const startOfDay = new Date()
  startOfDay.setHours(0, 0, 0, 0)

  // ห้ามโพสต์เกิน 2 ครั้งต่อวัน (ยกเว้นแอดมิน)
  if (user.role !== 'ADMIN') {
    const todayPostsCount = await prisma.post.count({
      where: {
        hostId: user.id,
        createdAt: {
          gte: startOfDay,
        },
      },
    })

    if (todayPostsCount >= 2) {
      redirect(`/?error=${encodeURIComponent('คุณไม่สามารถโพสต์ได้เกิน 2 สนามต่อวัน')}`)
    }
  }

  const durationHours = Number(formData.get('duration'))

  await prisma.post.create({
    data: {
      fieldName: formData.get('fieldName') as string,
      sportType: formData.get('sportType') as 'FOOTBALL' | 'FUTSAL',
      totalPrice: Number(formData.get('totalPrice')),
      maxPlayers: Number(formData.get('maxPlayers')),
      startTime: new Date(formData.get('startTime') as string),
      duration: Math.round(durationHours * 60), // แปลงชั่วโมง → นาที
      hostId: user.id,
      passcode: (formData.get('passcode') as string) || null,
    },
  })

  revalidatePath('/')
}

export async function joinMatch(postId: string, formData?: FormData) {
  const user = await getUser()

  const post = await prisma.post.findUnique({
    where: { id: postId },
  })

  if (!post) {
    throw new Error('ไม่พบโพสต์')
  }

  // ถ้าระบุรหัสผ่าน ให้ตรวจสอบ
  if (post.passcode) {
    if (!formData) {
      redirect(`/posts/${postId}?error=${encodeURIComponent('ห้องนี้ต้องการรหัสผ่าน')}`)
    }
    const inputPasscode = formData.get('passcode') as string
    if (inputPasscode !== post.passcode) {
      redirect(`/posts/${postId}?error=${encodeURIComponent('รหัสผ่านไม่ถูกต้อง')}`)
    }
  }

  const startOfDay = new Date()
  startOfDay.setHours(0, 0, 0, 0)

  // ห้ามจองเกิน 2 ครั้งต่อวัน (ยกเว้นแอดมิน)
  if (user.role !== 'ADMIN') {
    const todayBookingsCount = await prisma.booking.count({
      where: {
        userId: user.id,
        joinedAt: {
          gte: startOfDay,
        },
      },
    })

    if (todayBookingsCount >= 2) {
      redirect(`/posts/${postId}?error=${encodeURIComponent('คุณไม่สามารถจองได้เกิน 2 สนามต่อวัน')}`)
    }
  }

  try {
    await prisma.booking.create({
      data: {
        postId: postId,
        userId: user.id,
      },
    })
    revalidatePath('/')
  } catch (error) {
    console.error('คุณอาจจะกดเข้าร่วมไปแล้ว หรือเกิดข้อผิดพลาด:', error)
    // ถ้า error ไม่ใช่ RedirectError ค่อย redirect กลับไปพร้อม error message
    if (error instanceof Error && error.message.includes('NEXT_REDIRECT')) {
      throw error;
    }
    redirect(`/posts/${postId}?error=${encodeURIComponent('คุณกดเข้าร่วมไปแล้ว หรือเกิดข้อผิดพลาด')}`)
  }
}

export async function cancelPost(postId: string) {
  const user = await getUser()

  const post = await prisma.post.findUnique({ where: { id: postId } })
  if (!post || (post.hostId !== user.id && user.role !== 'ADMIN')) {
    redirect(`/posts/${postId}?error=${encodeURIComponent('คุณไม่มีสิทธิ์ยกเลิกโพสต์นี้')}`)
  }

  await prisma.post.update({
    where: { id: postId },
    data: { status: 'CANCELLED' },
  })

  revalidatePath('/')
  revalidatePath(`/posts/${postId}`)
  revalidatePath('/profile')
  redirect('/profile')
}