import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

/**
 * 这是一个用于防止 Supabase 免费版休眠的 Cron 任务接口
 * Vercel Cron 每 48 小时执行一次即可保持数据库活跃
 */
export async function GET(request: Request) {
    const authHeader = request.headers.get('authorization')

    // 使用环境变量中的 API_SECRET 进行简单的安全校验
    // 如果是 Vercel Cron 触发，由于我们在 vercel.json 配置了 CRON_SECRET，
    // 我们也可以通过系统自带的验证方式，这里暂用项目的 API_SECRET
    if (authHeader !== `Bearer ${process.env.API_SECRET}`) {
        return new Response('Unauthorized', { status: 401 })
    }

    try {
        const supabase = await createClient()

        // 执行一个简单的查询逻辑来“激活”数据库
        const { data, error } = await supabase.from('folders').select('id').limit(1)

        if (error) throw error

        return NextResponse.json({
            success: true,
            timestamp: new Date().toISOString(),
            message: 'Supabase is awake!'
        })
    } catch (error: any) {
        console.error('Keep-alive cron error:', error)
        return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }
}
