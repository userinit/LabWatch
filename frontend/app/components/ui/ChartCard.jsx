export const ChartCard = ({ title, chart, summary }) => {
    return (
        <div className="card">
            {title && (
                <h3 className="text-sm font-medium text-slate-600 dark:text-gray-400 mb-3">
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