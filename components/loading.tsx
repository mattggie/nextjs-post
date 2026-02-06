'use client'

import { Loader2 } from 'lucide-react'
import { cn } from '@/utils/cn'

interface LoadingProps {
    message?: string
    className?: string
}

export default function Loading({ message = '正在处理中...', className }: LoadingProps) {
    return (
        <div className={cn(
            "fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background/60 backdrop-blur-sm animate-in fade-in duration-300",
            className
        )}>
            <div className="relative flex flex-col items-center p-12 rounded-3xl bg-card border border-border shadow-2xl animate-in zoom-in-95 duration-300">
                {/* 现代感加载动画 */}
                <div className="relative w-20 h-20 mb-6">
                    <div className="absolute inset-0 border-4 border-indigo-500/10 rounded-full"></div>
                    <div className="absolute inset-0 border-4 border-t-indigo-600 rounded-full animate-spin"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-10 h-10 bg-indigo-500/20 rounded-full animate-pulse"></div>
                    </div>
                </div>

                <h3 className="text-lg font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                    {message}
                </h3>
                <p className="text-xs text-muted-foreground mt-2">请稍候片刻</p>

                {/* 装饰性背景光晕 */}
                <div className="absolute -z-10 w-32 h-32 bg-indigo-500/20 rounded-full blur-3xl"></div>
            </div>
        </div>
    )
}
