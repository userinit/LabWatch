export const RamSummary = ({ summary }) => {
    return (
        <>
            <div>
                <h3 className="chart-label">
                    Usage
                </h3>
                <h3 className="chart-value">
                    {
                        (summary?.ram?.used_bytes / (1024 ** 3))?.toFixed(1)
                    } / {
                        (summary?.ram?.total_bytes / (1024 ** 3))?.toFixed(1)
                    }GB
                </h3>
            </div>
            <div>
                <h3 className="chart-label">
                    Available
                </h3>
                <h3 className="chart-value">
                    {(summary?.ram?.available_bytes / (1024 ** 3))?.toFixed(1)}GB
                </h3>
            </div>
            <div>
                <h3 className="chart-label">
                    Total
                </h3>
                <h3 className="chart-value">
                    {(summary?.ram?.total_bytes / (1024 ** 3))?.toFixed(1)}GB
                </h3>
            </div>
        </>
    );
}