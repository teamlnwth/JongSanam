'use server'

import prisma from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

async function getUser() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  return user
}

export async function createBookingPost(formData: FormData) {
  const user = await getUser()

  // ตรวจสอบว่ามี Profile ใน Prisma แล้ว (กรณียังไม่มีให้สร้าง)
  await prisma.profile.upsert({
    where: { email: user.email! },
    update: {},
    create: {
      id: user.id,
      email: user.email!,
    },
  })

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
    },
  })

  revalidatePath('/')
}

export async function joinMatch(postId: string) {
  const user = await getUser()

  try {
    await prisma.booking.create({
      data: {
        postId: postId,
        userId: user.id,
      },
    })
    revalidatePath('/')
  } catch {
    console.log('คุณอาจจะกดเข้าร่วมไปแล้ว หรือเกิดข้อผิดพลาด')
  }
}