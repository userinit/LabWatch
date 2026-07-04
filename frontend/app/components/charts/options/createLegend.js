export const createLegend = ({ dashedLabel }) => ({
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
                    fontColor: "rgb(99, 100, 100)"
                };
            });
        }
    }
});