import { percentOptions } from "../options/percentOptions";
import { useMemo } from "react";
import { Line } from "react-chartjs-2";

export const RamChart = ({ analyticsData }) => {
    const ramData = useMemo(() => {
        const points = analyticsData?.map(item => ({
            x: new Date(Number(item.timestamp ?? 0) * 1000),
            y: item.ram ?? 0
        })) ?? [];

        return {
            datasets: [
                {
                    label: "RAM Usage",
                    data: points,
                    fill: true,
                    backgroundColor: "rgba(255, 144, 99, 0.2)",
                    borderColor: "rgb(255, 144, 99)"
                }
            ]
        };
    }, [analyticsData]);

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
    }, [analyticsData]);

    return <Line data={ramData} options={options} />;
}