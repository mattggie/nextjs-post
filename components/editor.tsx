'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { ArrowLeft, Save, SplitSquareHorizontal } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { updateDocument } from '@/app/actions'
import { cn } from '@/utils/cn'

export default function Editor({ doc }: { doc: any }) {
    const [content, setContent] = useState(doc.content || '')
    const [isSaving, setIsSaving] = useState(false)
    const lastSavedContent = useRef(doc.content || '')

    useEffect(() => {
        if (content === lastSavedContent.current) return

        setIsSaving(true)
        const timer = setTimeout(async () => {
            await updateDocument(doc.id, content)
            lastSavedContent.current = content
            setIsSaving(false)
        }, 1500)

        return () => clearTimeout(timer)
    }, [content, doc.id])

    return (
        <div className="h-screen flex flex-col bg-background">
            <header className="h-14 border-b border-border flex items-center justify-between px-4 bg-background/80 backdrop-blur z-10 shrink-0">
                <div className="flex items-center gap-4">
                    <Link href={`/folder/${doc.folder_id}`} className="p-2 hover:bg-accent rounded-full text-muted-foreground transition-colors">
                        <ArrowLeft size={18} />
                    </Link>
                    <h1 className="font-semibold text-sm truncate max-w-[200px]">{doc.title}</h1>
                    <div className="h-4 w-[1px] bg-border mx-2"></div>
                    <span className={cn("text-xs transition-opacity", isSaving ? "opacity-100 text-indigo-500 font-medium" : "opacity-0 text-muted-foreground")}>
                        Saving...
                    </span>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <SplitSquareHorizontal size={14} /> Markdown Editor
                </div>
            </header>

            <div className="flex-1 flex overflow-hidden">
                {/* Editor Pane */}
                <div className="w-1/2 h-full flex flex-col border-r border-border bg-card/30">
                    <textarea
                        className="w-full h-full bg-transparent resize-none p-6 outline-none font-mono text-sm leading-relaxed"
                        placeholder="# Start writing..."
                        value={content}
                        onChange={e => setContent(e.target.value)}
                        autoFocus
                    />
                </div>

                {/* Preview Pane */}
                <div className="w-1/2 h-full overflow-y-auto bg-background">
                    <article className="prose prose-zinc dark:prose-invert max-w-none p-8 prose-headings:font-bold prose-h1:text-3xl prose-p:leading-7 prose-a:text-indigo-500 prose-pre:bg-muted/50 prose-pre:border prose-pre:border-border">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {content}
                        </ReactMarkdown>
                    </article>
                </div>
            </div>
        </div>
    )
}
