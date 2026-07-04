import { baseOptions } from "./baseOptions";

export const percentOptions = {
    ...baseOptions,
    scales: {
        ...baseOptions.scales,
        y: {
            min: 0,
            max: 100,
            ticks: {
                callback: (value) => `${Number(value)}%`
            }
        }
    },
    plugins: {
        ...baseOptions.plugins,
        tooltip: {
            ...baseOptions.plugins.tooltip,
            callbacks: {
                ...baseOptions.plugins.tooltip.callbacks,
                label: (context) => {
                    const label = context?.dataset?.label; // i.e "CPU Usage" / "RAM Usage"
                    const value = context?.raw?.y; // raw percentage
                    return `${label}: ${value}%`;
                }
            }
        }
    }
}
