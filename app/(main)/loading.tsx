'use client'

export default function Loading() {
    return (
        <div className="fixed top-0 left-0 right-0 h-1 z-[100] overflow-hidden bg-indigo-500/10">
            <div className="h-full bg-indigo-500 animate-[loading_2s_infinite_ease-in-out]"></div>
            <style jsx>{`
                @keyframes loading {
                    0% { width: 0; transform: translateX(-100%); }
                    50% { width: 100%; transform: translateX(0); }
                    100% { width: 0; transform: translateX(100%); }
                }
            `}</style>
        </div>
    )
}
