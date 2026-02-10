import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
    const apiKey = request.headers.get('x-api-key')

    // API 密钥验证
    if (!process.env.API_SECRET || apiKey !== process.env.API_SECRET) {
        return NextResponse.json({ error: '未授权访问' }, { status: 401 })
    }

    // 检查必要的环境变量
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
        return NextResponse.json({ error: '服务器配置错误：缺少Supabase凭据' }, { status: 500 })
    }

    try {
        const body = await request.json()
        const { action, title, content, folder_id, name } = body

        // 使用 Service Role Key 创建管理员客户端 (绕过RLS)
        const supabaseAdmin = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL,
            process.env.SUPABASE_SERVICE_ROLE_KEY,
            { auth: { persistSession: false } }
        )

        // 获取第一个用户（作为API上传的归属者，通常是您自己）
        const { data: { users }, error: userError } = await supabaseAdmin.auth.admin.listUsers()
        if (userError || !users || users.length === 0) {
            return NextResponse.json({ error: '未找到系统用户' }, { status: 500 })
        }
        const targetUser = users[0]

        // --- 动作 1: 创建文件夹 ---
        if (action === 'create_folder') {
            if (!name) return NextResponse.json({ error: '缺少文件夹名称' }, { status: 400 })

            // 检查是否已存在同名文件夹
            const { data: existingFolder } = await supabaseAdmin
                .from('folders')
                .select('id')
                .eq('name', name)
                .eq('user_id', targetUser.id)
                .maybeSingle()

            if (existingFolder) {
                return NextResponse.json({ success: true, id: existingFolder.id, message: '文件夹已存在' })
            }

            const { data, error } = await supabaseAdmin
                .from('folders')
                .insert({ name, user_id: targetUser.id })
                .select('id')
                .single()

            if (error) throw error
            return NextResponse.json({ success: true, id: data.id })
        }

        // --- 动作 2: 上传文档 ---
        if (action === 'upload_document' || !action) {
            const { title, content, folder_id, folder_name } = body
            let targetFolderId = folder_id

            // 如果提供了文件夹名称但没提供ID，则查找或创建文件夹
            if (!targetFolderId && folder_name) {
                const { data: existingFolder } = await supabaseAdmin
                    .from('folders')
                    .select('id')
                    .eq('name', folder_name)
                    .eq('user_id', targetUser.id)
                    .maybeSingle()

                if (existingFolder) {
                    targetFolderId = existingFolder.id
                } else {
                    const { data: newFolder, error: folderError } = await supabaseAdmin
                        .from('folders')
                        .insert({ name: folder_name, user_id: targetUser.id })
                        .select('id')
                        .single()

                    if (folderError) throw folderError
                    targetFolderId = newFolder.id
                }
            }

            if (!title || !targetFolderId) {
                return NextResponse.json({ error: '缺少必填字段: title 或 folder_id/folder_name' }, { status: 400 })
            }

            // 插入文档
            const { data, error } = await supabaseAdmin
                .from('documents')
                .insert({
                    title,
                    content: content || '',
                    folder_id: targetFolderId,
                    user_id: targetUser.id
                })
                .select('id')
                .single()

            if (error) throw error
            return NextResponse.json({ success: true, id: data.id })
        }

        return NextResponse.json({ error: '无效的操作类型' }, { status: 400 })

    } catch (e: any) {
        console.error('API 错误:', e)
        return NextResponse.json({ error: e.message || '内部服务器错误' }, { status: 500 })
    }
}

// GET 请求：获取所有文件夹
export async function GET(request: NextRequest) {
    const apiKey = request.headers.get('x-api-key')

    if (!process.env.API_SECRET || apiKey !== process.env.API_SECRET) {
        return NextResponse.json({ error: '未授权访问' }, { status: 401 })
    }

    const supabaseAdmin = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        { auth: { persistSession: false } }
    )

    const { data: folders, error } = await supabaseAdmin
        .from('folders')
        .select('id, name')
        .order('name')

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ folders })
}
