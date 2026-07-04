import { useState, useEffect, useRef, useMemo } from "react";
import "chartjs-adapter-date-fns";
import { 
    Chart as ChartJS,
    TimeScale,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler,
    plugins,
} from 'chart.js';
import { Line } from "react-chartjs-2";

ChartJS.register(
    TimeScale,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

export function App() {
    const [analyticsData, setAnalyticsData] = useState([]);

    // Find highest peak in dataset
    const currentNetSpikes = analyticsData?.flatMap(item => [
        item.net_sent ?? 0, item.net_recv ?? 0
    ]) ?? [];
    const highestNetPeak = currentNetSpikes?.length > 0 ? Math.max(...currentNetSpikes) : 0;
    const dynamicNetCeiling = Math.max(highestNetPeak * 1.2, 5); // 20% padding buffer and 5Mbps min ceiling

    const currentDiskSpikes = analyticsData?.flatMap(item => [
        item.disk_read ?? 0, item.disk_write ?? 0
    ]) ?? [];
    const highestDiskPeak = currentDiskSpikes?.length > 0 ? Math.max(...currentDiskSpikes) : 0;
    const dynamicDiskCeiling = Math.max(highestDiskPeak * 1.2, 5);

    // Ensures that when the metrics count reaches max, last item is added and first is deleted
    const updateMetrics = (item) => {
        setAnalyticsData((prev) => {
            if (prev?.at(-1)?.timestamp !== item.timestamp) {
                const updated = [...prev, item];
                if (updated?.length > 60) {
                    updated.shift();
                }
                return updated;
            }
            return (prev ?? []);
        });
    }

    // Fetches the last metric from the API (dynamic update)
    async function retrieveLatestMetric() {
        try {
            const res = await fetch("http://localhost:8000/metrics/latest", {
                method: "GET"
            });
            if (res.ok) {
                const data = await res.json();
                updateMetrics(data);
            }
            else {
                console.error(res);
            }
        }
        catch (err) {
            console.error(err);
        }
    }

    // Fetches all metrics from the API (initial load)
    async function fetchAnalytics() {
        try {
            const res = await fetch("http://localhost:8000/metrics", {
                method: "GET"
            });
            if (res.ok) {
                const data = await res.json();
                setAnalyticsData(data);
            }
            else {
                console.error(res);
            }
        }
        catch (err) {
            console.error(err);
        }
    }

    const effectRan = useRef(false);
    useEffect(() => {
        if (effectRan.current) return;
        fetchAnalytics();
        effectRan.current = true;

        let timerId

        function loop() {
            retrieveLatestMetric()
            .catch(err => console.error(err))
            .finally(() => {
                timerId = setTimeout(loop, 1800); // polls every 1.8s instead of 2s to prevent desync
            });
        }

        loop();

        return () => clearTimeout(timerId);

    }, []);

    // Line chart config for CPU and RAM
    const lineOptions = {
        scales: {
            x: {
                display: false,
                type: "time",
                time: {
                    unit: "second",
                    displayFormats: {
                        second: "HH:mm:ss",
                    }
                },
                min: Date.now() - 120000, // 120s or 2 mins ago
                max: Date.now()
            },
            y: {
                min: 0,
                max: 100,
                ticks: {
                    callback: (value) => `${Number(value)}%`
                }
            }
        },
        responsive: true,
        animation: false,
        maintainAspectRatio: false,
        datasets: {
            line: {
                radius: 0,
                // hitRadius: 20,
                // pointHoverRadius: 4,
                borderWidth: 1
            }
        },
        interaction: {
            mode: "index",
            intersect: false
        },
        plugins: {
            tooltip: {
                displayColors: false,
                callbacks: {
                    title: (context) => {
                        const value = context[0]?.raw?.x; // raw date object
                        return new Intl.DateTimeFormat('en-US', {
                            hour: "2-digit",
                            minute: "2-digit",
                            second: "2-digit",
                            hour12: false
                        }).format(new Date(value));
                    },
                    label: (context) => {
                        const label = context?.dataset?.label // i.e. "CPU Usage"
                        const value = context?.raw?.y; // raw percentage
                        return `${label}: ${value}%`;
                    }
                }
            }
        }
    };
    
    // Line chart options for network
    const networkOptions = {
        scales: {
            x: {
                display: false,
                type: "time",
                time: {
                    unit: "second",
                    displayFormats: {
                        second: "HH:mm:ss"
                    }
                },
                min: Date.now() - 120000, // 2 mins ago
                max: Date.now()
            },
            y: {
                type: "linear",
                min: 0,
                max: dynamicNetCeiling,
                ticks: {
                    callback: (value) => `${Number(value).toFixed(1)} Mbps`
                }

            }
        },
        interaction: {
            mode: "index",
            intersect: false
        },
        responsive: true,
        animation: false,
        maintainAspectRatio: false,
        datasets: {
            line: {
                pointRadius: 0,
                pointHoverRadius: 4,
                borderWidth: 1
            }
        },
        plugins: {
            tooltip: {
                displayColors: false,
                callbacks: {
                    title: (context) => {
                        const value = context[0]?.raw?.x;
                        return Intl.DateTimeFormat('en-US', {
                            hour: "2-digit",
                            minute: "2-digit",
                            second: "2-digit",
                            hour12: false
                        }).format(new Date(value));
                    },
                    label: (context) => {
                        const label = context?.dataset?.label
                        const value = context?.raw?.y;
                        return `${label}: ${Number(value).toFixed(2)}Mbps`;
                    }
                }
            },
            legend: {
                labels: {
                    generateLabels: (chart) => {
                        return chart.data.datasets.map((dataset, index) => {
                            const isSend = dataset.label === "Send";
                            return {
                                text: dataset.label,
                                datasetIndex: index,
                                hidden: !chart.isDatasetVisible(index),
                                fillStyle: isSend ? "transparent" : dataset.borderColor,
                                strokeStyle: dataset.borderColor,
                                lineWidth: 2,
                                lineDash: isSend ? [3.2, 3.2] : [],
                                fontColor: "#636464"
                            }
                        })
                    }
                }
            }
        }
    };

    const diskOptions = {
        scales: {
            x: {
                display: false,
                type: "time",
                time: {
                    unit: "second",
                    displayFormats: {
                        second: "HH:mm:ss"
                    }
                },
                min: Date.now() - 120000, // 2 mins ago
                max: Date.now()
            },
            y: {
                beginAtZero: true,
                type: "linear",
                min: 0,
                max: dynamicDiskCeiling,
                ticks: {
                    callback: (value) => `${Number(value).toFixed(1)} MB/s`
                }

            }
        },
        interaction: {
            mode: "index",
            intersect: false
        },
        responsive: true,
        animation: false,
        maintainAspectRatio: false,
        datasets: {
            line: {
                pointRadius: 0,
                pointHoverRadius: 4,
                borderWidth: 1
            }
        },
        plugins: {
            tooltip: {
                displayColors: false,
                callbacks: {
                    title: (context) => {
                        const value = context[0]?.raw?.x;
                        return Intl.DateTimeFormat('en-US', {
                            hour: "2-digit",
                            minute: "2-digit",
                            second: "2-digit",
                            hour12: false
                        }).format(new Date(value));
                    },
                    label: (context) => {
                        const label = context?.dataset?.label
                        const value = context?.raw?.y;
                        return `${label}: ${Number(value).toFixed(2)}MB/s`;
                    }
                }
            },
            legend: {
                labels: {
                    generateLabels: (chart) => {
                        return chart.data.datasets.map((dataset, index) => {
                            const isRead = dataset.label === "Read";
                            return {
                                text: dataset.label,
                                datasetIndex: index,
                                hidden: !chart.isDatasetVisible(index),
                                fillStyle: isRead ? "transparent" : dataset.borderColor,
                                strokeStyle: dataset.borderColor,
                                lineWidth: 2,
                                lineDash: isRead ? [3.2, 3.2] : [],
                                fontColor: "#636464"
                            }
                        })
                    }
                }
            }
        }
    };

    // CPU line chart
    const cpuLine = useMemo(() => {
        const points = analyticsData?.map(item => ({
            x: new Date(Number(item.timestamp ?? 0) * 1000),
            y: item.cpu ?? 0
        })) ?? [];

        return {
            datasets: [
                {
                    label: "CPU Usage",
                    data: points,
                    fill: true,
                    backgroundColor: "rgba(255, 99, 132, 0.2)",
                    borderColor: "#FF6384"
                }
            ]
        }
    });

    // RAM line chart
    const ramLine = useMemo(() => {
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
                    borderColor: "#FF9063",
                }
            ]
        }
    });

    // Network send/recv chart
    const netLine = useMemo(() => {
        const netSend = analyticsData?.map(item => ({
            x: new Date(Number(item.timestamp ?? 0) * 1000),
            y: item.net_send ?? 0
        })) ?? [];
        const netRecv = analyticsData?.map(item => ({
            x: new Date(Number(item.timestamp ?? 0) * 1000),
            y: item.net_recv ?? 0
        })) ?? [];

        return {
            datasets: [
                {
                    label: "Send",
                    data: netSend,
                    backgroundColor: "#FF63D2",
                    borderColor: "#FF63D2",
                    borderDash: [5, 5]
                },
                {
                    label: "Receive",
                    data: netRecv,
                    backgroundColor: "#FF63D2",
                    borderColor: "#FF63D2"
                }
            ]
        }
    });

    const diskLine = useMemo(() => {
        const diskRead = analyticsData?.map(item => ({
            x: new Date(Number(item.timestamp ?? 0) * 1000),
            y: item.disk_read ?? 0
        })) ?? [];
        const diskWrite = analyticsData?.map(item => ({
            x: new Date(Number(item.timestamp ?? 0) * 1000),
            y: item.disk_write ?? 0
        })) ?? [];

        return {
            datasets: [
                {
                    label: "Read",
                    data: diskRead,
                    backgroundColor: "#FFC463",
                    borderColor: "#FFC463",
                    borderDash: [5, 5]
                },
                {
                    label: "Write",
                    data: diskWrite,
                    backgroundColor: "#FFC463",
                    borderColor: "#FFC463"
                }
            ]
        }
    });

    return (
        <div className="max-w-7xl mx-auto w-full">
            {analyticsData?.length === 0 ? (
                <p>Loading metrics...</p>
            ) : (
                <div className="relative flex-1 h-100">
                    <Line data={cpuLine} options={lineOptions} />
                    <Line data={ramLine} options={lineOptions} />
                    <Line data={netLine} options={networkOptions} />
                    <Line data={diskLine} options={diskOptions} />
                </div>
            )}
        </div>
    );
}