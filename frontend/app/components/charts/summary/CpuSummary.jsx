export const CpuSummary = ({ summary }) => {
    return (
        <>
            <div>
                <h3 className="chart-label">
                    Usage
                </h3>
                <h3 className="chart-value">
                    {summary?.cpu?.usage_percent?.toFixed(1)}%
                </h3>
            </div>
            <div>
                <h3 className="chart-label">
                    Frequency
                </h3>
                <h3 className="chart-value">
                    {summary?.cpu?.frequency_ghz?.toFixed(2)}GHz
                </h3>
            </div>
            <div>
                <h3 className="chart-label">
                    Cores
                </h3>
                <h3 className="chart-value">
                    {summary?.cpu?.physical_cores}C / {summary?.cpu?.logical_cores}T
                </h3>
            </div>
        </>
    );
}