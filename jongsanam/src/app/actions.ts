'use server'

import prisma from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

const MOCK_USER_ID = "user-test-001"

async function ensureMockUser() {
  await prisma.profile.upsert({
    where: { email: 'test@example.com' },
    update: {},
    create: {
      id: MOCK_USER_ID,
      email: 'test@example.com',
      name: 'Kantaphong',
      promptpayQR: 'https://promptpay.io/0812345678'
    }
  })
}

export async function createBookingPost(formData: FormData) {
  await ensureMockUser()
  
  await prisma.post.create({
    data: {
      fieldName: formData.get('fieldName') as string,
      sportType: formData.get('sportType') as 'FOOTBALL' | 'FUTSAL',
      totalPrice: Number(formData.get('totalPrice')),
      maxPlayers: Number(formData.get('maxPlayers')),
      duration: 120,
      startTime: new Date(), 
      hostId: MOCK_USER_ID,
    }
  })
  
  revalidatePath('/') 
}

export async function joinMatch(postId: string) {
  await ensureMockUser()
  
  try {
    await prisma.booking.create({
      data: {
        postId: postId,
        userId: MOCK_USER_ID,
      }
    })
    revalidatePath('/')
  } catch (error) {
    console.log("คุณอาจจะกดเข้าร่วมไปแล้ว หรือเกิดข้อผิดพลาด")
  }
}