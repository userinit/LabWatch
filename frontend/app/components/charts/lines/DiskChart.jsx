import { throughputOptions } from "../options/throughputOptions";
import { createLegend } from "../options/createLegend";
import { useMemo } from "react";
import { Line } from "react-chartjs-2";

export const DiskChart = ({ analyticsData }) => {
    const diskData = useMemo(() => {
        const diskRead = analyticsData?.map(item => ({
            x: new Date(Number(item.timestamp ?? 0) * 1000),
            y: item.disk_read ?? 0
        })) ?? [];
        const diskWrite = analyticsData?.map(item => ({
            x: new Date(Number(item.timestamp ?? 0) * 1000),
            y: item.disk_write
        })) ?? [];

        return {
            datasets: [
                {
                    label: "Read",
                    data: diskRead,
                    backgroundColor: "rgb(255, 196, 99)",
                    borderColor: "rgb(255, 196, 99)",
                    borderDash: [5, 5]
                },
                {
                    label: "Write",
                    data: diskWrite,
                    backgroundColor: "rgb(255, 196, 99)",
                    borderColor: "rgb(255, 196, 99)"
                }
            ]
        }
    }, [analyticsData]);

    const options = useMemo(() => {
        // Find highest peak in dataset and scale y-axis accordingly
        const currentSpikes = analyticsData?.flatMap(item => [
            item.disk_read ?? 0,
            item.disk_write ?? 0
        ]) ?? [];
        const highestPeak = currentSpikes?.length > 0 ? Math.max(...currentSpikes) : 0;
        const dynamicCeiling = Math.max(highestPeak * 1.2, 5);
        
        const now = Date.now();
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
                        callback: (value) => `${Number(value).toFixed(1)}MB/s`
                    },
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
                            return `${label}: ${Number(value).toFixed(2)}MB/s`
                        }
                    }
                },
                legend: createLegend({ dashedLabel: "Read" })
            }
        }
    }, [analyticsData]);

    return <Line data={diskData} options={options} />;
};