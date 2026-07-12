import { percentOptions } from "../options/percentOptions";
import { useMemo } from "react";
import { Line } from "react-chartjs-2";

export const RamChart = ({ chartData }) => {
    const ramData = useMemo(() => {
        const points = chartData?.map(item => ({
            x: new Date(Number(item.timestamp ?? 0) * 1000),
            y: item.ram
        })) ?? [];

        return {
            datasets: [
                {
                    label: "RAM Usage",
                    data: points,
                    fill: true,
                    backgroundColor: "rgba(255, 144, 99, 0.2)",
                    borderColor: "rgb(255, 144, 99)",
                    spanGaps: false
                }
            ]
        };
    }, [chartData]);

    const options = useMemo(() => {
        const now = Date.now();
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
    }, [chartData]);

    return <Line data={ramData} options={options} />;
}