export const ChartCard = ({ title, children }) => {
    return (
        <div className="p-2 rounded bg-gray-50/80 m-2 border-gray-200/60 border dark:bg-gray-900/50 dark:border-gray-800/60">
            {title && (
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">
                    {title}
                </h3> 
            )}
            <div className="relative h-64">
                {children}
            </div>
        </div>
    );
}