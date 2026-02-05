import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

// API 端点：上传/创建文档
// 
// 使用方式:
// POST /api/upload
// Headers: 
//   x-api-key: 你的API密钥 (在.env中设置API_SECRET)
// Body (JSON):
//   {
//     "title": "文档标题",
//     "content": "Markdown内容",
//     "folder_id": "目标文件夹ID"
//   }
//
// 响应:
//   成功: { "success": true, "id": "新文档ID" }
//   失败: { "error": "错误信息" }

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
        const { title, content, folder_id } = body

        if (!title) {
            return NextResponse.json({ error: '缺少必填字段: title' }, { status: 400 })
        }
        if (!folder_id) {
            return NextResponse.json({ error: '缺少必填字段: folder_id' }, { status: 400 })
        }

        // 使用 Service Role Key 创建管理员客户端 (绕过RLS)
        const supabaseAdmin = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL,
            process.env.SUPABASE_SERVICE_ROLE_KEY,
            { auth: { persistSession: false } }
        )

        // 验证文件夹是否存在
        const { data: folder, error: folderError } = await supabaseAdmin
            .from('folders')
            .select('id, user_id')
            .eq('id', folder_id)
            .single()

        if (folderError || !folder) {
            return NextResponse.json({ error: '指定的文件夹不存在' }, { status: 404 })
        }

        // 插入文档，继承文件夹的 user_id
        const { data, error } = await supabaseAdmin
            .from('documents')
            .insert({
                title,
                content: content || '',
                folder_id,
                user_id: folder.user_id
            })
            .select('id')
            .single()

        if (error) {
            console.error('插入文档失败:', error)
            return NextResponse.json({ error: '创建文档失败' }, { status: 500 })
        }

        return NextResponse.json({ success: true, id: data.id })

    } catch (e) {
        console.error('API错误:', e)
        return NextResponse.json({ error: '请求格式无效' }, { status: 400 })
    }
}

// GET 请求：获取所有文件夹 (用于查询 folder_id)
export async function GET(request: NextRequest) {
    const apiKey = request.headers.get('x-api-key')

    if (!process.env.API_SECRET || apiKey !== process.env.API_SECRET) {
        return NextResponse.json({ error: '未授权访问' }, { status: 401 })
    }

    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
        return NextResponse.json({ error: '服务器配置错误' }, { status: 500 })
    }

    const supabaseAdmin = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY,
        { auth: { persistSession: false } }
    )

    const { data: folders, error } = await supabaseAdmin
        .from('folders')
        .select('id, name, parent_id')
        .order('name')

    if (error) {
        return NextResponse.json({ error: '获取文件夹失败' }, { status: 500 })
    }

    return NextResponse.json({ folders })
}
