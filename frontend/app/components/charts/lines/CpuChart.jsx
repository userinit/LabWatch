import { percentOptions } from "../options/percentOptions";
import { useMemo } from "react";
import { Line } from "react-chartjs-2";

export const CpuChart = ({ chartData, now }) => {
    const cpuData = useMemo(() => {
        const points = chartData?.map(item => ({
            x: new Date(Number(item.timestamp ?? 0) * 1000),
            y: item.cpu
        })) ?? [];
        
        return {
            datasets: [
                {
                    label: "CPU Usage",
                    data: points,
                    fill: true,
                    backgroundColor: "rgba(255, 99, 132, 0.2)",
                    borderColor: "rgb(255, 99, 132)",
                    spanGaps: false
                }
            ]
        };
    }, [chartData]);
    
    const options = useMemo(() => {
        return {
            ...percentOptions,
            scales: {
                ...percentOptions.scales,
                x: {
                    ...percentOptions.scales?.x,
                    min: now - 120000, // 2 mins ago
                    max: now
                }
            }
        }
    }, [chartData, now]);

    return <Line data={cpuData} options={options} />;
};