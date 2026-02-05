'use client'

import { useState } from 'react'
import { User, Loader2 } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'

// 预设头像列表
const AVATARS = [
    '😀', '😎', '🤓', '🧑‍💻', '👨‍💼', '👩‍💼',
    '🐱', '🐶', '🦊', '🐼', '🐨', '🦁',
    '🚀', '⭐', '🌙', '🌈', '🔥', '💎',
    '🎨', '📚', '✏️', '💡', '🎯', '🏆'
]

export default function AvatarSelector({ currentAvatar }: { currentAvatar?: string }) {
    const [isLoading, setIsLoading] = useState(false)
    const [selectedAvatar, setSelectedAvatar] = useState(currentAvatar || '')
    const [message, setMessage] = useState<{ type: 'error' | 'success', text: string } | null>(null)
    const router = useRouter()

    async function handleSelectAvatar(avatar: string) {
        setIsLoading(true)
        setMessage(null)
        setSelectedAvatar(avatar)

        const supabase = createClient()

        const { error } = await supabase.auth.updateUser({
            data: { avatar }
        })

        if (error) {
            setMessage({ type: 'error', text: `保存失败: ${error.message}` })
            setIsLoading(false)
            return
        }

        setMessage({ type: 'success', text: '头像已更新！' })
        setIsLoading(false)
        router.refresh()
    }

    return (
        <div className="bg-card border rounded-xl p-6">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-indigo-500/10 text-indigo-500 rounded-lg">
                    <User size={20} />
                </div>
                <h2 className="text-lg font-semibold">选择头像</h2>
                {isLoading && <Loader2 size={16} className="animate-spin text-muted-foreground" />}
            </div>

            {message && (
                <div className={`mb-4 p-3 rounded-lg text-sm ${message.type === 'error'
                        ? 'bg-destructive/10 text-destructive border border-destructive/20'
                        : 'bg-green-500/10 text-green-600 border border-green-500/20'
                    }`}>
                    {message.text}
                </div>
            )}

            <div className="grid grid-cols-6 gap-3">
                {AVATARS.map((avatar) => (
                    <button
                        key={avatar}
                        onClick={() => handleSelectAvatar(avatar)}
                        disabled={isLoading}
                        className={`w-12 h-12 text-2xl rounded-xl flex items-center justify-center transition-all hover:scale-110 active:scale-95 ${selectedAvatar === avatar
                                ? 'bg-indigo-500/20 ring-2 ring-indigo-500 ring-offset-2 ring-offset-background'
                                : 'bg-secondary/50 hover:bg-secondary'
                            }`}
                    >
                        {avatar}
                    </button>
                ))}
            </div>

            <p className="text-xs text-muted-foreground mt-4">
                点击即可更换头像，选择后自动保存。
            </p>
        </div>
    )
}
