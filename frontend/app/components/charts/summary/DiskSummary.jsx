export const DiskSummary = ({ summary }) => {
    return (
        <>
            <div>
                <h3 className="chart-label">
                    Usage
                </h3>
                <h3 className="chart-value">
                    {
                        (summary?.disk?.used_bytes != null && summary?.disk?.total_bytes != null && summary?.disk?.usage_percent != null) ?
                        `${(summary.disk.used_bytes / (1024 ** 3)).toFixed(1)} / ` +
                        `${(summary.disk.total_bytes / (1024 ** 3)).toFixed(1)}GB ` +
                        `(${summary.disk.usage_percent.toFixed(1)}%)`
                        : "--"
                    }
                </h3>
            </div>
            <div>
                <h3 className="chart-label">
                    Read
                </h3>
                <h3 className="chart-value">
                    {
                        summary?.disk?.read_mbs != null ?
                        `${summary.disk.read_mbs.toFixed(2)}MB/s` : "--"
                    }
                </h3>
            </div>
            <div>
                <div className="chart-label">
                    Write
                </div>
                <div className="chart-value">
                    {
                        summary?.disk?.write_mbs != null ?
                        `${summary.disk.write_mbs.toFixed(2)}MB/s` : "--"
                    }
                </div>
            </div>
        </>
    );
}