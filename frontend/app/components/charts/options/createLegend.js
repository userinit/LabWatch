export const createLegend = ({ dashedLabel, isDark }) => ({
    labels: {
        generateLabels: (chart) => {
            return chart.data.datasets.map((dataset, index) => {
                const isDashed = dataset.label === dashedLabel;

                return {
                    text: dataset.label,
                    datasetIndex: index,
                    hidden: !chart.isDatasetVisible(index),
                    fillStyle: isDashed ? "transparent" : dataset.borderColor,
                    strokeStyle: dataset.borderColor,
                    lineWidth: 2,
                    lineDash: isDashed ? [3.2, 3.2] : [],
                    fontColor: isDark ? "rgb(153, 161, 175)" : "rgb(75, 85, 99)",
                };
            });
        }
    }
});