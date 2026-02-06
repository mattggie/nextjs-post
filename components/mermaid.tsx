'use client'

import React, { useEffect, useRef, useState } from 'react'
import mermaid from 'mermaid'
import { useTheme } from 'next-themes'

export default function Mermaid({ chart }: { chart: string }) {
    const { theme } = useTheme()
    const ref = useRef<HTMLDivElement>(null)
    const [svg, setSvg] = useState<string>('')
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const isDark = theme === 'dark'
        mermaid.initialize({
            startOnLoad: false, // 改为 false，手动渲染
            theme: isDark ? 'dark' : 'neutral',
            securityLevel: 'loose',
            fontFamily: 'inherit',
        })

        const renderChart = async () => {
            if (chart) {
                try {
                    setError(null)
                    // 为每一图表生成唯一的 ID
                    const id = `mermaid-${Math.random().toString(36).substr(2, 9)}`
                    const { svg } = await mermaid.render(id, chart)
                    setSvg(svg)
                } catch (err) {
                    console.error('Mermaid render error:', err)
                    setError('Mermaid 图表渲染失败，请检查语法。')
                }
            }
        }

        renderChart()
    }, [chart, theme])

    if (error) {
        return (
            <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm my-4">
                {error}
                <pre className="mt-2 text-xs opacity-70 overflow-auto">{chart}</pre>
            </div>
        )
    }

    return (
        <div
            ref={ref}
            className="mermaid-container flex justify-center transition-all animate-in fade-in duration-500 overflow-x-auto my-6"
            dangerouslySetInnerHTML={{ __html: svg }}
        />
    )
}
