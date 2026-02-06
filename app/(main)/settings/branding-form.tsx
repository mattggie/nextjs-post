'use client'

import { useState } from 'react'
import { Palette, Check } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import Loading from '@/components/loading'

const GRADIENTS = [
    { name: '经典紫蓝', value: 'from-indigo-500 to-purple-500' },
    { name: '极光绿', value: 'from-emerald-500 to-teal-500' },
    { name: '活力橙', value: 'from-orange-500 to-red-500' },
    { name: '深海蓝', value: 'from-blue-600 to-cyan-500' },
    { name: '樱花粉', value: 'from-pink-500 to-rose-500' },
    { name: '午夜金', value: 'from-amber-500 to-yellow-500' },
]

export default function BrandingForm({
    initialName,
    initialGradient
}: {
    initialName: string,
    initialGradient: string
}) {
    const [isLoading, setIsLoading] = useState(false)
    const [name, setName] = useState(initialName)
    const [selectedGradient, setSelectedGradient] = useState(initialGradient || GRADIENTS[0].value)
    const [message, setMessage] = useState<{ type: 'error' | 'success', text: string } | null>(null)
    const router = useRouter()

    async function handleSave() {
        setIsLoading(true)
        setMessage(null)

        const supabase = createClient()

        const { error } = await supabase.auth.updateUser({
            data: {
                site_name: name,
                site_gradient: selectedGradient
            }
        })

        if (error) {
            setMessage({ type: 'error', text: `保存失败: ${error.message}` })
            setIsLoading(false)
            return
        }

        setMessage({ type: 'success', text: '品牌设置已更新！' })
        setIsLoading(false)
        router.refresh()
    }

    return (
        <div className="bg-card border rounded-xl p-6">
            {isLoading && <Loading message="正在保存品牌设置..." />}
            <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-indigo-500/10 text-indigo-500 rounded-lg">
                    <Palette size={20} />
                </div>
                <h2 className="text-lg font-semibold">站点品牌</h2>
            </div>

            {message && (
                <div className={`mb-4 p-3 rounded-lg text-sm ${message.type === 'error'
                    ? 'bg-destructive/10 text-destructive border border-destructive/20'
                    : 'bg-green-500/10 text-green-600 border border-green-500/20'
                    }`}>
                    {message.text}
                </div>
            )}

            <div className="space-y-6">
                <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">站点名称</label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full bg-secondary/50 border border-border rounded-lg p-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                        placeholder="例如: 我的文档库"
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">主题渐变色</label>
                    <div className="grid grid-cols-3 gap-3">
                        {GRADIENTS.map((g) => (
                            <button
                                key={g.value}
                                onClick={() => setSelectedGradient(g.value)}
                                className={`h-12 rounded-lg bg-gradient-to-r ${g.value} relative flex items-center justify-center transition-transform hover:scale-105 active:scale-95 shadow-sm`}
                                title={g.name}
                            >
                                {selectedGradient === g.value && (
                                    <div className="absolute inset-0 flex items-center justify-center bg-black/10 rounded-lg">
                                        <Check size={20} className="text-white" />
                                    </div>
                                )}
                            </button>
                        ))}
                    </div>
                </div>

                <button
                    onClick={handleSave}
                    disabled={isLoading}
                    className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-400 text-white font-medium p-3 rounded-lg transition-all active:scale-[0.98] shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-2"
                >
                    保存品牌设置
                </button>
            </div>
        </div>
    )
}
