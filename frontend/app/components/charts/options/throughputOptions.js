import { baseOptions } from "./baseOptions";

export const throughputOptions = {
    ...baseOptions,
    scales: {
        ...baseOptions.scales,
        y: {
            ...baseOptions.scales?.y,
            type: "linear",
            min: 0
        }
    }
}