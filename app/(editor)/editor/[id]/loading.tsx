'use client'

export default function Loading() {
    return (
        <div className="h-screen flex flex-col bg-background animate-pulse">
            <header className="h-14 border-b border-border flex items-center px-4 gap-4">
                <div className="w-8 h-8 bg-muted rounded-full"></div>
                <div className="w-32 h-4 bg-muted rounded"></div>
            </header>
            <div className="flex-1 flex overflow-hidden">
                <div className="w-1/2 h-full border-r border-border p-6 space-y-4">
                    <div className="w-3/4 h-4 bg-muted rounded"></div>
                    <div className="w-full h-4 bg-muted rounded"></div>
                    <div className="w-5/6 h-4 bg-muted rounded"></div>
                </div>
                <div className="w-1/2 h-full p-8 hidden md:block space-y-6">
                    <div className="w-1/2 h-8 bg-muted rounded"></div>
                    <div className="w-full h-32 bg-muted rounded-xl"></div>
                </div>
            </div>
        </div>
    )
}
