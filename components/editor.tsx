'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { ArrowLeft, Save, SplitSquareHorizontal } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import rehypeHighlight from 'rehype-highlight'
import rehypeRaw from 'rehype-raw'
import rehypeKatex from 'rehype-katex'
import 'github-markdown-css/github-markdown.css'
import 'highlight.js/styles/github.css'
import 'katex/dist/katex.min.css'
import { updateDocument } from '@/app/actions'
import { cn } from '@/utils/cn'
import Mermaid from '@/components/mermaid'

export default function Editor({ doc }: { doc: any }) {
    const [title, setTitle] = useState(doc.title || '')
    const [content, setContent] = useState(doc.content || '')
    const [isSaving, setIsSaving] = useState(false)
    const lastSavedData = useRef({ title: doc.title, content: doc.content })

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
