'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createFolder(formData: FormData) {
    const supabase = await createClient()
    const name = formData.get('name') as string
    const parentId = formData.get('parentId') as string || null

    const { error } = await supabase.from('folders').insert({
        name,
        parent_id: parentId === 'null' ? null : parentId
    })

    if (error) console.error(error)

    revalidatePath('/', 'layout')
}

export async function deleteFolder(id: string) {
    const supabase = await createClient()
    await supabase.from('folders').delete().eq('id', id)
    revalidatePath('/', 'layout')
}

export async function createDocument(formData: FormData) {
    const supabase = await createClient()
    const title = formData.get('title') as string
    const folderId = formData.get('folderId') as string

    const { data, error } = await supabase.from('documents').insert({
        title,
        folder_id: folderId,
        content: ''
    }).select('id').single()

    if (error) {
        console.error(error)
        return { error: error.message }
    }

    revalidatePath(`/folder/${folderId}`)
    revalidatePath('/', 'layout') // Update count maybe?
    return { id: data.id }
}

export async function deleteDocument(id: string) {
    const supabase = await createClient()
    await supabase.from('documents').delete().eq('id', id)
    revalidatePath('/', 'layout')
}

export async function updateDocument(id: string, content: string) {
    const supabase = await createClient()
    await supabase.from('documents').update({ content }).eq('id', id)
    revalidatePath(`/editor/${id}`)
}

export async function signOut() {
    const supabase = await createClient()
    await supabase.auth.signOut()
    revalidatePath('/', 'layout')
}
