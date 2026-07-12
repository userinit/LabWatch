import { useSystemDarkMode } from "../../../hooks/useSystemDarkMode";
import { throughputOptions } from "../options/throughputOptions";
import { createLegend } from "../options/createLegend";
import { useMemo } from "react";
import { Line } from "react-chartjs-2";

export const NetworkChart = ({ chartData, now }) => {
    const isDark = useSystemDarkMode();
    const networkData = useMemo(() => {
        const networkSend = chartData?.map(item => ({
            x: new Date(Number(item.timestamp ?? 0) * 1000),
            y: item.net_send
        })) ?? [];
        const networkReceive = chartData?.map(item => ({
            x: new Date(Number(item.timestamp ?? 0) * 1000),
            y: item.net_recv
        })) ?? [];

        return {
            datasets: [
                {
                    label: "Send",
                    data: networkSend,
                    backgroundColor: "rgb(255, 99, 210)",
                    borderColor: "rgb(255, 99, 210)",
                    borderDash: [5, 5],
                    spanGaps: false
                },
                {
                    label: "Receive",
                    data: networkReceive,
                    backgroundColor: "rgb(255, 99, 210)",
                    borderColor: "rgb(255, 99, 210)",
                    spanGaps: false
                }
            ]
        };
    }, [chartData]);

    const options = useMemo(() => {
        // Find highest peak in dataset and scale y-axis accordingly
        const currentSpikes = chartData?.flatMap(item => [
            item.net_sent ?? 0,
            item.net_recv ?? 0
        ]) ?? [];
        const highestPeak = currentSpikes?.length > 0 ? Math.max(...currentSpikes) : 0;
        const dynamicCeiling = Math.max(highestPeak * 1.2, 5);

        return {
            ...throughputOptions,
            scales: {
                ...throughputOptions.scales,
                x: {
                    ...throughputOptions.scales?.x,
                    min: now - 120000, // 2 mins ago
                    max: now
                },
                y: {
                    ...throughputOptions.scales?.y,
                    max: dynamicCeiling,
                    ticks: {
                        callback: (value) => `${Number(value).toFixed(1)}Mbps`
                    }
                }
            },
            plugins: {
                ...throughputOptions.plugins,
                tooltip: {
                    ...throughputOptions.plugins.tooltip,
                    callbacks: {
                        ...throughputOptions.plugins.tooltip.callbacks,
                        label: (context) => {
                            const label = context?.dataset?.label;
                            const value = context?.raw?.y;
                            return `${label}: ${Number(value).toFixed(2)}Mbps`;
                        }
                    }
                },
                legend: createLegend({ dashedLabel: "Send", isDark: isDark })
            }
        };
    }, [chartData, now]);

    return <Line data={networkData} options={options} />;
};