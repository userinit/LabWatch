export const baseOptions = {
    scales: {
        x: {
            ticks: {
                display: false
            },
            grid: {
                display: false
            },
            type: "time",
            time: {
                unit: "second",
                displayFormats: {
                    second: "HH:mm:ss"
                }
            },
        }
    },
    interaction: {
        mode: "index",
        intersect: false,
    },
    responsive: true,
    animation: false,
    maintainAspectRatio: false,
    elements: {
        point: {
            radius: 0,
            hoverRadius: 4
        },
        line: {
            borderWidth: 1
        }
    },
    plugins: {
        tooltip: {
            displayColors: false,
            callbacks: {
                title: (context) => {
                    const value = context[0]?.raw?.x; // raw date object
                    return new Intl.DateTimeFormat("en-US", {
                        hour: "2-digit",
                        minute: "2-digit",
                        second: "2-digit",
                        hour12: false
                    }).format(new Date(value));
                }
            }
        }
    }
}