export default function DashboardPage() {
    return (
        <div className="flex flex-col items-center justify-center h-full text-muted-foreground p-4 text-center animate-in fade-in duration-500">
            <div className="w-16 h-16 bg-muted/50 rounded-2xl flex items-center justify-center mb-4">
                <svg
                    className="w-8 h-8 opacity-50"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
                    />
                </svg>
            </div>
            <h3 className="text-lg font-medium text-foreground">No folder selected</h3>
            <p className="max-w-xs mt-2">Select a folder from the sidebar to view documents or create a new one.</p>
        </div>
    )
}
