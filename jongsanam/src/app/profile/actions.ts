'use server'

import { createClient } from '@/lib/supabase/server'
import prisma from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function updateProfile(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Not authenticated')
  }

  const name = formData.get('name') as string

  const updateData: { name: string | null; promptpayQR?: string } = {
    name: name || null,
  }

  const file = formData.get('promptpayQRFile') as File | null
  if (file && file.size > 0 && file.size < 5 * 1024 * 1024) {
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    const base64 = buffer.toString('base64')
    const mimeType = file.type
    updateData.promptpayQR = `data:${mimeType};base64,${base64}`
  }

  await prisma.profile.update({
    where: { id: user.id },
    data: updateData,
  })

  revalidatePath('/profile')
}
