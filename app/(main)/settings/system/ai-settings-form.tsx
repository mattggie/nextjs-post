'use client'

import { useState } from 'react'
import { Bot, Plus, Trash2, Save, Sparkles, MessageSquare } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import Loading from '@/components/loading'
import { cn } from '@/utils/cn'

type AiConfig = {
    id: string
    name: string
    apiKey: string
    baseUrl: string
    model: string
}

type AiPrompt = {
    id: string
    name: string
    content: string
}

export default function AiSettingsForm({
    initialConfigs,
    initialPrompts
}: {
    initialConfigs: AiConfig[],
    initialPrompts: AiPrompt[]
}) {
    const [isLoading, setIsLoading] = useState(false)
    const [configs, setConfigs] = useState<AiConfig[]>(initialConfigs || [])
    const [prompts, setPrompts] = useState<AiPrompt[]>(initialPrompts || [])
    const [message, setMessage] = useState<{ type: 'error' | 'success', text: string } | null>(null)
    const router = useRouter()

    const addConfig = () => {
        const id = Math.random().toString(36).substring(7)
        setConfigs([...configs, { id, name: '新模型', apiKey: '', baseUrl: 'https://api.openai.com/v1', model: 'gpt-4o' }])
    }

    const removeConfig = (id: string) => {
        setConfigs(configs.filter(c => c.id !== id))
    }

    const updateConfig = (id: string, updates: Partial<AiConfig>) => {
        setConfigs(configs.map(c => c.id === id ? { ...c, ...updates } : c))
    }

    const addPrompt = () => {
        const id = Math.random().toString(36).substring(7)
        setPrompts([...prompts, { id, name: '新提示词', content: '总结这篇文章的内容。' }])
    }

    const removePrompt = (id: string) => {
        setPrompts(prompts.filter(p => p.id !== id))
    }

    const updatePrompt = (id: string, updates: Partial<AiPrompt>) => {
        setPrompts(prompts.map(p => p.id === id ? { ...p, ...updates } : p))
    }

    async function handleSave() {
        setIsLoading(true)
        setMessage(null)

        const supabase = createClient()

        const { error } = await supabase.auth.updateUser({
            data: {
                ai_configs: configs,
                ai_prompts: prompts
            }
        })

        if (error) {
            setMessage({ type: 'error', text: `保存失败: ${error.message}` })
            setIsLoading(false)
            return
        }

        setMessage({ type: 'success', text: 'AI 设置已更新！' })
        setIsLoading(false)
        router.refresh()
    }

    return (
        <div className="space-y-8">
            {isLoading && <Loading message="正在保存 AI 设置..." />}

            {message && (
                <div className={cn(
                    "p-3 rounded-lg text-sm border",
                    message.type === 'error' ? "bg-destructive/10 text-destructive border-destructive/20" : "bg-green-500/10 text-green-600 border-green-500/20"
                )}>
                    {message.text}
                </div>
            )}

            {/* 1. API 设置 */}
            <div className="bg-card border rounded-xl overflow-hidden shadow-sm">
                <div className="p-4 bg-muted/30 border-b flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Sparkles className="text-indigo-500" size={18} />
                        <h3 className="font-bold">大模型 API 配置</h3>
                    </div>
                    <button
                        onClick={addConfig}
                        className="text-xs flex items-center gap-1 px-2 py-1 bg-indigo-500 text-white rounded hover:bg-indigo-600 transition-colors"
                    >
                        <Plus size={14} /> 添加配置
                    </button>
                </div>
                <div className="p-4 space-y-4">
                    {configs.length === 0 && (
                        <p className="text-sm text-muted-foreground text-center py-4 italic">暂无 API 配置，请点击右上角添加。</p>
                    )}
                    {configs.map((config) => (
                        <div key={config.id} className="p-4 border rounded-lg bg-secondary/20 relative group space-y-3">
                            <button
                                onClick={() => removeConfig(config.id)}
                                className="absolute top-4 right-4 text-muted-foreground hover:text-destructive p-1 transition-colors"
                            >
                                <Trash2 size={16} />
                            </button>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold uppercase text-muted-foreground">配置名称</label>
                                    <input
                                        value={config.name}
                                        onChange={e => updateConfig(config.id, { name: e.target.value })}
                                        className="w-full bg-background border rounded px-2 py-1.5 text-sm outline-none focus:ring-1 ring-indigo-500"
                                        placeholder="如: OpenAI, DeepSeek"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold uppercase text-muted-foreground">模型名称 (Model ID)</label>
                                    <input
                                        value={config.model}
                                        onChange={e => updateConfig(config.id, { model: e.target.value })}
                                        className="w-full bg-background border rounded px-2 py-1.5 text-sm outline-none focus:ring-1 ring-indigo-500"
                                        placeholder="如: gpt-4o, deepseek-chat"
                                    />
                                </div>
                                <div className="md:col-span-2 space-y-1">
                                    <label className="text-[10px] font-bold uppercase text-muted-foreground">Base URL</label>
                                    <input
                                        value={config.baseUrl}
                                        onChange={e => updateConfig(config.id, { baseUrl: e.target.value })}
                                        className="w-full bg-background border rounded px-2 py-1.5 text-sm outline-none focus:ring-1 ring-indigo-500"
                                        placeholder="API 基础地址"
                                    />
                                </div>
                                <div className="md:col-span-2 space-y-1">
                                    <label className="text-[10px] font-bold uppercase text-muted-foreground">API Key</label>
                                    <input
                                        type="password"
                                        value={config.apiKey}
                                        onChange={e => updateConfig(config.id, { apiKey: e.target.value })}
                                        className="w-full bg-background border rounded px-2 py-1.5 text-sm outline-none focus:ring-1 ring-indigo-500"
                                        placeholder="sk-..."
                                    />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* 2. 提示词设置 */}
            <div className="bg-card border rounded-xl overflow-hidden shadow-sm">
                <div className="p-4 bg-muted/30 border-b flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <MessageSquare className="text-indigo-500" size={18} />
                        <h3 className="font-bold">自定义提示词 (Prompts)</h3>
                    </div>
                    <button
                        onClick={addPrompt}
                        className="text-xs flex items-center gap-1 px-2 py-1 bg-indigo-500 text-white rounded hover:bg-indigo-600 transition-colors"
                    >
                        <Plus size={14} /> 添加提示词
                    </button>
                </div>
                <div className="p-4 space-y-4">
                    {prompts.length === 0 && (
                        <p className="text-sm text-muted-foreground text-center py-4 italic">暂无自定义提示词。</p>
                    )}
                    {prompts.map((prompt) => (
                        <div key={prompt.id} className="p-4 border rounded-lg bg-secondary/20 relative group space-y-3">
                            <button
                                onClick={() => removePrompt(prompt.id)}
                                className="absolute top-4 right-4 text-muted-foreground hover:text-destructive p-1 transition-colors"
                            >
                                <Trash2 size={16} />
                            </button>
                            <div className="space-y-3">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold uppercase text-muted-foreground">提示词标题</label>
                                    <input
                                        value={prompt.name}
                                        onChange={e => updatePrompt(prompt.id, { name: e.target.value })}
                                        className="w-full bg-background border rounded px-2 py-1.5 text-sm outline-none focus:ring-1 ring-indigo-500 font-medium"
                                        placeholder="如: 文章润色, 自动总结"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold uppercase text-muted-foreground">提示词内容</label>
                                    <textarea
                                        value={prompt.content}
                                        onChange={e => updatePrompt(prompt.id, { content: e.target.value })}
                                        className="w-full bg-background border rounded px-2 py-1.5 text-sm outline-none focus:ring-1 ring-indigo-500 h-24 resize-none leading-relaxed"
                                        placeholder="输入 AI 需要执行的指令..."
                                    />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <button
                onClick={handleSave}
                disabled={isLoading}
                className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-400 text-white font-bold p-3 rounded-xl transition-all active:scale-[0.98] shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-2"
            >
                <Save size={18} /> 保存 AI 全局设置
            </button>
        </div>
    )
}
