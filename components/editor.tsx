'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { ArrowLeft, Save, SplitSquareHorizontal, Bot, Sparkles, Send, CheckCircle2, AlertCircle } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import rehypeHighlight from 'rehype-highlight'
import rehypeRaw from 'rehype-raw'
import rehypeKatex from 'rehype-katex'
import 'github-markdown-css/github-markdown.css'
import 'highlight.js/styles/github.css'
import 'katex/dist/katex.min.css'
import { updateDocument, processWithAi } from '@/app/actions'
import { cn } from '@/utils/cn'
import Mermaid from '@/components/mermaid'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'

export default function Editor({ doc }: { doc: any }) {
    const [title, setTitle] = useState(doc.title || '')
    const [content, setContent] = useState(doc.content || '')
    const [isSaving, setIsSaving] = useState(false)
    const [isAiPanelOpen, setIsAiPanelOpen] = useState(false)
    const [aiConfigs, setAiConfigs] = useState<any[]>([])
    const [aiPrompts, setAiPrompts] = useState<any[]>([])
    const [selectedConfig, setSelectedConfig] = useState('')
    const [selectedPrompt, setSelectedPrompt] = useState('')
    const [isAiProcessing, setIsAiProcessing] = useState(false)
    const [aiStatus, setAiStatus] = useState<{ type: 'success' | 'error', text: string } | null>(null)

    const lastSavedData = useRef({ title: doc.title, content: doc.content })
    const router = useRouter()

    useEffect(() => {
        // 获取 AI 设置
        const fetchAiSettings = async () => {
            const supabase = createClient()
            const { data: { user } } = await supabase.auth.getUser()
            if (user) {
                setAiConfigs(user.user_metadata?.ai_configs || [])
                setAiPrompts(user.user_metadata?.ai_prompts || [])
                if (user.user_metadata?.ai_configs?.[0]) setSelectedConfig(user.user_metadata.ai_configs[0].id)
                if (user.user_metadata?.ai_prompts?.[0]) setSelectedPrompt(user.user_metadata.ai_prompts[0].id)
            }
        }
        fetchAiSettings()
    }, [])

    async function handleAiExecute() {
        if (!selectedConfig || !selectedPrompt) {
            setAiStatus({ type: 'error', text: '请先在系统设置中配置 AI 模型和提示词' })
            return
        }

        setIsAiProcessing(true)
        setAiStatus(null)

        const result = await processWithAi(doc.id, selectedConfig, selectedPrompt)

        setIsAiProcessing(false)
        if (result.error) {
            setAiStatus({ type: 'error', text: result.error })
        } else {
            setAiStatus({ type: 'success', text: '处理成功！已生成新文档。' })
            setTimeout(() => {
                setIsAiPanelOpen(false)
                setAiStatus(null)
                router.push(`/editor/${result.id}`)
            }, 1500)
        }
    }

    useEffect(() => {
        if (content === lastSavedData.current.content && title === lastSavedData.current.title) return

        setIsSaving(true)
        const timer = setTimeout(async () => {
            const updates: any = {}
            if (content !== lastSavedData.current.content) updates.content = content
            if (title !== lastSavedData.current.title) updates.title = title

            await updateDocument(doc.id, updates)
            lastSavedData.current = { title, content }
            setIsSaving(false)
        }, 1500)

        return () => clearTimeout(timer)
    }, [content, title, doc.id])

    const [mode, setMode] = useState<'edit' | 'preview'>('edit')

    return (
        <div className="h-screen flex flex-col bg-background">
            <header className="h-14 border-b border-border flex items-center justify-between px-2 md:px-4 bg-background/80 backdrop-blur z-10 shrink-0">
                <div className="flex items-center gap-2 md:gap-4 overflow-hidden flex-1">
                    <Link href={`/folder/${doc.folder_id}`} className="p-2 hover:bg-accent rounded-full text-muted-foreground transition-colors shrink-0">
                        <ArrowLeft size={18} />
                    </Link>
                    <input
                        value={title}
                        onChange={e => setTitle(e.target.value)}
                        className="font-semibold text-sm bg-transparent border-none outline-none focus:ring-1 focus:ring-indigo-500/50 rounded px-2 py-1 transition-all flex-1 min-w-0"
                        placeholder="无标题文档"
                    />
                    <div className="hidden sm:block h-4 w-[1px] bg-border shrink-0"></div>
                    <span className={cn("text-[10px] md:text-xs transition-opacity shrink-0", isSaving ? "opacity-100 text-indigo-500 font-medium" : "opacity-0 text-muted-foreground")}>
                        保存中...
                    </span>
                </div>

                <div className="flex items-center gap-1 md:gap-2">
                    <button
                        onClick={() => setIsAiPanelOpen(!isAiPanelOpen)}
                        className={cn(
                            "px-4 py-1.5 rounded-lg text-xs font-bold transition-all shadow-md active:scale-95",
                            isAiPanelOpen
                                ? "bg-indigo-600 text-white shadow-indigo-500/20"
                                : "bg-indigo-50 text-indigo-600 hover:bg-indigo-100 dark:bg-indigo-500/10 dark:text-indigo-400 dark:hover:bg-indigo-500/20"
                        )}
                    >
                        <span>AI 处理</span>
                    </button>

                    <div className="h-4 w-[1px] bg-border mx-1 hidden sm:block"></div>

                    {/* 手机端模式切换 */}
                    <div className="flex bg-muted rounded-lg p-1 md:hidden mr-2">
                        <button
                            onClick={() => setMode('edit')}
                            className={cn("px-3 py-1 text-xs rounded-md transition-all", mode === 'edit' ? "bg-background shadow-sm text-foreground" : "text-muted-foreground")}
                        >
                            编辑
                        </button>
                        <button
                            onClick={() => setMode('preview')}
                            className={cn("px-3 py-1 text-xs rounded-md transition-all", mode === 'preview' ? "bg-background shadow-sm text-foreground" : "text-muted-foreground")}
                        >
                            预览
                        </button>
                    </div>

                    <div className="hidden md:flex items-center gap-2 text-xs text-muted-foreground">
                        <SplitSquareHorizontal size={14} /> Markdown 编辑器
                    </div>
                </div>
            </header>

            {/* AI 选项面板 */}
            {isAiPanelOpen && (
                <div className="bg-card border-b border-border shadow-2xl animate-in slide-in-from-top duration-300 z-[5]">
                    <div className="max-w-4xl mx-auto p-4 md:p-6 grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-muted-foreground/70 tracking-wider">选择模型 API</label>
                            <select
                                value={selectedConfig}
                                onChange={(e) => setSelectedConfig(e.target.value)}
                                className="w-full bg-background border border-border/60 rounded-xl px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500/30 transition-all font-bold"
                            >
                                {aiConfigs.map(c => <option key={c.id} value={c.id}>{c.name} ({c.model})</option>)}
                                {aiConfigs.length === 0 && <option value="">未配置 API (去设置页添加)</option>}
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-muted-foreground/70 tracking-wider">选择任务模板</label>
                            <select
                                value={selectedPrompt}
                                onChange={(e) => setSelectedPrompt(e.target.value)}
                                className="w-full bg-background border border-border/60 rounded-xl px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500/30 transition-all font-bold"
                            >
                                {aiPrompts.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                {aiPrompts.length === 0 && <option value="">未配置提示词</option>}
                            </select>
                        </div>

                        <div className="flex flex-col">
                            <button
                                onClick={handleAiExecute}
                                disabled={isAiProcessing || aiConfigs.length === 0 || aiPrompts.length === 0}
                                className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-muted disabled:text-muted-foreground text-white font-black h-[42px] px-8 rounded-xl transition-all shadow-xl shadow-indigo-500/20 active:scale-95 flex items-center justify-center gap-2"
                            >
                                {isAiProcessing ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                        <span>处理中</span>
                                    </>
                                ) : (
                                    <span>开始任务</span>
                                )}
                            </button>
                        </div>

                        {aiStatus && (
                            <div className={cn(
                                "md:col-span-3 mt-2 p-2 rounded-lg text-xs flex items-center gap-2 animate-in fade-in zoom-in",
                                aiStatus.type === 'error' ? "bg-destructive/10 text-destructive" : "bg-green-500/10 text-green-600"
                            )}>
                                {aiStatus.type === 'error' ? <AlertCircle size={14} /> : <CheckCircle2 size={14} />}
                                {aiStatus.text}
                            </div>
                        )}
                    </div>
                </div>
            )}

            <div className="flex-1 flex overflow-hidden relative">
                {/* 编辑区 */}
                <div className={cn(
                    "w-full md:w-1/2 h-full flex flex-col border-r border-border bg-card/30 transition-all",
                    mode === 'edit' ? "flex" : "hidden md:flex"
                )}>
                    <textarea
                        className="w-full h-full bg-transparent resize-none p-4 md:p-6 outline-none font-mono text-sm leading-relaxed"
                        placeholder="# 开始写作..."
                        value={content}
                        onChange={e => setContent(e.target.value)}
                        autoFocus
                    />
                </div>

                {/* 预览区 */}
                <div className={cn(
                    "w-full md:w-1/2 h-full overflow-y-auto bg-background transition-all",
                    mode === 'preview' ? "block" : "hidden md:block"
                )}>
                    <article className="markdown-body p-4 md:p-8 min-h-full">
                        <ReactMarkdown
                            remarkPlugins={[remarkGfm, remarkMath]}
                            rehypePlugins={[rehypeRaw, rehypeHighlight, rehypeKatex]}
                            components={{
                                img: ({ node, ...props }) => {
                                    if (!props.src) return null
                                    return <img {...props} />
                                },
                                code({ node, inline, className, children, ...props }: any) {
                                    const match = /language-(\w+)/.exec(className || '')
                                    const lang = match ? match[1] : ''

                                    if (!inline && lang === 'mermaid') {
                                        return <Mermaid chart={String(children).replace(/\n$/, '')} />
                                    }

                                    return (
                                        <code className={className} {...props}>
                                            {children}
                                        </code>
                                    )
                                }
                            }}
                        >
                            {content}
                        </ReactMarkdown>
                    </article>
                </div>
            </div>
        </div>
    )
}
