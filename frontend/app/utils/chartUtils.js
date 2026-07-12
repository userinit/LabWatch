export function insertMissingDataPoints(data, threshold = 5) {
    const chartData = [];
    for (let i = 0; i < data.length; i++) {
        const current = data[i];
        const previous = data[i - 1];
        if (previous && current.timestamp - previous.timestamp > threshold) {
            chartData.push({
                timestamp: current.timestamp,
                cpu: null,
                ram: null,
                network: null,
                disk: null
            });
        }
        chartData.push(current);
    }
    return chartData;
}