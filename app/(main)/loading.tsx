'use client'

import { Loader2 } from 'lucide-react'

export default function Loading() {
    return (
        <div className="flex-1 flex items-center justify-center p-8">
            <div className="relative flex flex-col items-center">
                <div className="w-12 h-12 border-4 border-indigo-500/10 rounded-full"></div>
                <div className="absolute inset-0 w-12 h-12 border-4 border-t-indigo-600 rounded-full animate-spin"></div>
                <p className="mt-4 text-sm font-medium text-muted-foreground animate-pulse">正在加载内容...</p>
            </div>
        </div>
    )
}
