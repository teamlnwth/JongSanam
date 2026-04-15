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
  const promptpayQR = formData.get('promptpayQR') as string

  await prisma.profile.update({
    where: { id: user.id },
    data: {
      name: name || null,
      promptpayQR: promptpayQR || null,
    },
  })

  revalidatePath('/profile')
}
