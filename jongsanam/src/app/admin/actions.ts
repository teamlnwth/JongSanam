'use server'

import prisma from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

async function ensureAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) throw new Error("Not logged in")
  const profile = await prisma.profile.findUnique({ where: { id: user.id } })
  if (!profile || profile.role !== 'ADMIN') {
    throw new Error('Unauthorized')
  }
}

export async function toggleBanStatus(userId: string, currentStatus: boolean) {
  await ensureAdmin()
  
  await prisma.profile.update({
    where: { id: userId },
    data: { isBanned: !currentStatus },
  })
  
  revalidatePath('/admin')
}
