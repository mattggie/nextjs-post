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
    revalidatePath('/', 'layout')
    return { id: data.id }
}

export async function deleteDocument(id: string) {
    const supabase = await createClient()
    await supabase.from('documents').delete().eq('id', id)
    revalidatePath('/', 'layout')
}

export async function updateDocument(id: string, updates: { title?: string, content?: string }) {
    const supabase = await createClient()
    await supabase.from('documents').update(updates).eq('id', id)
    revalidatePath(`/editor/${id}`)
    revalidatePath('/', 'layout')
}

export async function searchDocuments(query: string, folderId?: string) {
    const supabase = await createClient()
    let q = supabase.from('documents').select('*')

    if (folderId) {
        q = q.eq('folder_id', folderId)
    }

    const { data, error } = await q.ilike('title', `%${query}%`).order('updated_at', { ascending: false })

    if (error) {
        console.error(error)
        return []
    }

    return data
}

export async function signOut() {
    const supabase = await createClient()
    await supabase.auth.signOut()
    revalidatePath('/', 'layout')
}

export async function processWithAi(
    documentId: string,
    configId: string,
    promptId: string
) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: '未登录' }

    // 获取文档详情
    const { data: doc, error: docError } = await supabase
        .from('documents')
        .select('*')
        .eq('id', documentId)
        .single()
    if (docError || !doc) return { error: '文档不存在' }

    // 获取 AI 设置 (从当前用户或管理员)
    // 优先从当前用户获取，如果当前用户不是管理员，尝试从系统管理员账号获取
    let aiConfigs = user.user_metadata?.ai_configs || []
    let aiPrompts = user.user_metadata?.ai_prompts || []

    if (aiConfigs.length === 0 && user.email !== process.env.DEFAULT_EMAIL) {
        const { data: { users: authUsers } } = await (await import('@/utils/supabase/server')).createAdminClient().then(c => c.auth.admin.listUsers())
        const admin = authUsers.find(u => u.email === process.env.DEFAULT_EMAIL || u.user_metadata?.role === 'admin')
        if (admin) {
            aiConfigs = admin.user_metadata?.ai_configs || []
            aiPrompts = admin.user_metadata?.ai_prompts || []
        }
    }

    const config = aiConfigs.find((c: any) => c.id === configId)
    const prompt = aiPrompts.find((p: any) => p.id === promptId)

    if (!config || !prompt) return { error: '配置或提示词未找到' }

    try {
        const response = await fetch(`${config.baseUrl}/chat/completions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${config.apiKey}`
            },
            body: JSON.stringify({
                model: config.model,
                messages: [
                    { role: 'system', content: prompt.content },
                    { role: 'user', content: doc.content }
                ]
            })
        })

        if (!response.ok) {
            const err = await response.json()
            throw new Error(err.error?.message || 'AI 调用失败')
        }

        const data = await response.json()
        const aiResult = data.choices[0].message.content

        // 创建新文档
        const timestamp = new Date().toLocaleString('zh-CN', { hour12: false })
        const newTitle = `${doc.title} (AI处理_${config.name}_${timestamp})`

        const { data: newDoc, error: createError } = await supabase.from('documents').insert({
            title: newTitle,
            content: aiResult,
            folder_id: doc.folder_id,
            user_id: user.id
        }).select('id').single()

        if (createError) throw createError

        revalidatePath(`/folder/${doc.folder_id}`)
        return { success: true, id: newDoc.id }

    } catch (e: any) {
        console.error('AI Processing Error:', e)
        return { error: e.message }
    }
}
