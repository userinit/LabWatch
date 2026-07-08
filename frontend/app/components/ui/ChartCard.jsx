export const ChartCard = ({ title, chart, summary }) => {
    return (
        <div className="p-2 rounded bg-gray-50/80 m-2 dark:bg-gray-900/50 border border-gray-200/60 dark:border-gray-800/60">
            {title && (
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">
                    {title}
                </h3> 
            )}
            <div className="relative h-64">
                {chart}
            </div>
            {summary && (
                <div className="mt-2 border-t-2 border-t-gray-200/60 dark:border-t-gray-800/60">
                    <div className="mt-2 flex justify-evenly">
                        {summary}
                    </div>
                </div>
            )}
        </div>
    );
}