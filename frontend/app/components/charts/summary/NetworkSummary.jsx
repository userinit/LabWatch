export const NetworkSummary = ({ summary }) => {
    return (
        <>
            <div>
                <h3 className="chart-label">
                    Download
                </h3>
                <h3 className="chart-value">
                {summary?.network?.receive_mbps?.toFixed(2)}Mbps 
                </h3>
            </div>
            <div>
                <h3 className="chart-label">
                    Upload
                </h3>
                <h3 className="chart-value">
                    {summary?.network?.send_mbps?.toFixed(2)}Mbps
                </h3>
            </div>
        </>
    );
}