// Charts
import { CpuChart } from "./components/charts/lines/CpuChart";
import { RamChart } from "./components/charts/lines/RamChart";
import { NetworkChart } from "./components/charts/lines/NetworkChart";
import { DiskChart } from "./components/charts/lines/DiskChart";

// Summaries
import { CpuSummary } from "./components/charts/summary/CpuSummary";
import { RamSummary } from "./components/charts/summary/RamSummary";
import { NetworkSummary } from "./components/charts/summary/NetworkSummary";
import { DiskSummary } from  "./components/charts/summary/DiskSummary";

// Card component
import { ChartCard } from "./components/ui/ChartCard";

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
} from "chart.js";
import { Chart, Line } from "react-chartjs-2";

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

const apiUrl = "http://localhost:8000";

export function App() {
    const [analyticsData, setAnalyticsData] = useState([]);
    const [summaryData, setSummaryData] = useState([]);
    // const [activeChart, setActiveChart] = useState("");

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
            const res = await fetch(`${apiUrl}/metrics/latest`, {
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
            const res = await fetch(`${apiUrl}/metrics`, {
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

    async function fetchSummary() {
        try {
            const res = await fetch(`${apiUrl}/summary`, {
                method: "GET"
            });
            if (res.ok) {
                const data = await res.json();
                console.log(data);
                setSummaryData(data);
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
        effectRan.current = true;

        let timerId;

        async function init() {
            try {
                await fetchAnalytics();
                loop();
            }
            catch (err) {
                console.error(err);
            }
        }

        init();

        async function loop() {
            try {
                await Promise.all([
                    retrieveLatestMetric(),
                    fetchSummary()
                ]);
            }
            catch (err) {
                console.error(err);
            }
            finally {
                timerId = setTimeout(loop, 1800);
            }
        }

        const handleVisibilityChange = async () => {
            if (document.visibilityState === "visible") {
                clearTimeout(timerId); // prevent race condition
                try {
                    await Promise.all([
                        fetchAnalytics(),
                        fetchSummary()
                    ]);
                    loop(); // restart polling after resync
                }
                catch (err) {
                    console.error(err);
                }
            }
            else if (document.visibilityState === "hidden") {
                clearTimeout(timerId);
            }
        };

        document.addEventListener("visibilitychange", handleVisibilityChange);

        return () => {
            clearTimeout(timerId);
            document.removeEventListener("visibilitychange", handleVisibilityChange);
        };

    }, []);

    return (
        <div className="max-w-7xl mx-auto w-full">
            {console.log(summaryData)}
            {analyticsData?.length === 0 ? (
                <p>Loading metrics...</p>
            ) : (
                <>
                    <div className="grid grid-cols-2">
                        <ChartCard 
                            title="CPU Usage"
                            chart={<CpuChart analyticsData={analyticsData} />}
                            summary={<CpuSummary summary={summaryData.summary} />}
                        />
                        <ChartCard
                            title="RAM Usage"
                            chart={<RamChart analyticsData={analyticsData} />}
                            summary={<RamSummary summary={summaryData.summary} />}
                        />
                        <ChartCard
                            title="Network Usage"
                            chart={<NetworkChart analyticsData={analyticsData} />}
                            summary={<NetworkSummary summary={summaryData.summary} />}
                        />
                        <ChartCard
                            title="Disk Usage"
                            chart={<DiskChart analyticsData={analyticsData} />}
                            summary={<DiskSummary summary={summaryData.summary} />}
                        />
                    </div>
                </>
            )}
        </div>
    );
}