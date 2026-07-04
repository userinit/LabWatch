import { CpuChart } from "./components/charts/lines/CpuChart";
import { RamChart } from "./components/charts/lines/RamChart";
import { NetworkChart } from "./components/charts/lines/NetworkChart";
import { DiskChart } from "./components/charts/lines/DiskChart";
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

    return (
        <div className="max-w-7xl mx-auto w-full">
            {analyticsData?.length === 0 ? (
                <p>Loading metrics...</p>
            ) : (
                <div className="relative flex-1 h-100">
                    <CpuChart analyticsData={analyticsData} />
                    <RamChart analyticsData={analyticsData} />
                    <NetworkChart analyticsData={analyticsData} />
                    <DiskChart analyticsData={analyticsData} />
                </div>
            )}
        </div>
    );
}