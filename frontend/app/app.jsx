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

// Chart helper function
import { insertMissingDataPoints } from "./utils/chartUtils";

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
    const [backendOnline, setBackendOnline] = useState(null);
    const [now, setNow] = useState(Date.now());

    const chartData = useMemo(() => insertMissingDataPoints(analyticsData), [analyticsData]);

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
                setBackendOnline(true);
            }
            else {
                setBackendOnline(true);
                console.error(res);
            }
        }
        catch (err) {
            setBackendOnline(false);
            console.error(err);
        }
    }

    const processTimeDifference = (timestamp) => {
        if (!timestamp) {
            return null
        };
        const nowSeconds = Math.floor(now / 1000);
        const agentSeconds = Number(timestamp);
        const timeDifference = Math.floor(nowSeconds - agentSeconds);

        // clock can be negative due to clock sync issues
        return Math.max(0, timeDifference);
    };

    const formatLastUpdated = (timestamp) => {
        const seconds = processTimeDifference(timestamp);

        if (seconds === null) {
            return "Never";
        }

        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);

        if (seconds < 5) {
            return "Just now";
        } else if (seconds < 60) {
            return `${seconds} second${seconds === 1 ? "" : "s"} ago`;
        } else if (minutes < 60) {
            return `${minutes} minute${minutes === 1 ? "" : "s"} ago`;
        } else if (seconds < 86400) {
            return `${hours} hour${hours === 1 ? "" : "s"} ago`;
        } else {
            return `${days} day${days === 1 ? "" : "s"} ago`;
        }
    };

    const determineAgentStatus = (agentOnline, backendOnline) => {
        if (backendOnline === null) {
            return "Connecting";
        }
        if (backendOnline === false) {
            return "Unknown";
        }
        return agentOnline ? "Online" : "Offline";
    }

    const determineBackendStatus = (backendOnline) => {
        if (backendOnline === null) {
            return "Connecting";
        }
        return backendOnline ? "Connected" : "Disconnected";
    }

    const effectRan = useRef(false);
    useEffect(() => {
        if (effectRan.current) return;
        effectRan.current = true;

        let backendPollingTimerId;
        let relativeTimeIntervalId;

        relativeTimeIntervalId = setInterval(() => {
            setNow(Date.now());
        }, 1000);

        async function init() {
            try {
                await fetchAnalytics();
                loop();
            }
            catch (err) {
                console.error(err);
                clearTimeout(backendPollingTimerId);
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
                backendPollingTimerId = setTimeout(loop, 1800);
            }
        }

        const handleVisibilityChange = async () => {
            if (document.visibilityState === "visible") {
                clearTimeout(backendPollingTimerId); // prevent race condition
                try {
                    await Promise.all([
                        fetchAnalytics(),
                        fetchSummary()
                    ]);
                    backendPollingTimerId = setTimeout(loop, 1800); // reschedule polling after resync
                }
                catch (err) {
                    console.error(err);
                }
            }
            else if (document.visibilityState === "hidden") {
                clearTimeout(backendPollingTimerId);
            }
        };

        document.addEventListener("visibilitychange", handleVisibilityChange);

        return () => {
            clearTimeout(backendPollingTimerId);
            clearInterval(relativeTimeIntervalId);
            document.removeEventListener("visibilitychange", handleVisibilityChange);
        };

    }, []);

    return (
        <div className="max-w-7xl mx-auto w-full">
                <>
                    <div>
                        <div className="card flex w-max">
                            <span className="relative flex h-2.5 w-2.5 mr-2 pt-1.5">
                                <span className={
                                    backendOnline ? "absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" : ""
                                } />
                                <span className={`relative inline-flex h-2.5 w-2.5 rounded-full ${
                                    backendOnline === true ? "bg-green-500" :
                                    backendOnline === false ? "bg-red-500" :
                                    "bg-amber-500"}`
                                } />
                            </span>
                            <div className="grid cols-1">
                                <h3>Backend: {determineBackendStatus(backendOnline)}</h3>
                            </div>
                        </div>
                        <div className="card flex w-max">
                            <span className="relative flex h-2.5 w-2.5 mr-2 pt-1.5">
                                <span className={
                                    (backendOnline && summaryData?.agent?.online)
                                    ? "absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" : ""
                                } />
                                <span className={
                                    `relative inline-flex h-2.5 w-2.5 rounded-full
                                    ${!backendOnline ? "bg-amber-500" : summaryData?.agent?.online ? "bg-green-500" : "bg-red-500"}`
                                } />
                            </span>
                            <div className="grid cols-1">
                                <h3>
                                    Agent: {determineAgentStatus(summaryData?.agent?.online ?? null, backendOnline)}
                                </h3>
                                <h3>
                                    Last updated: {formatLastUpdated(summaryData?.agent?.last_seen)}
                                </h3>
                            </div>
                        </div>
                    </div>
                    <div className="grid grid-cols-2">
                        <ChartCard 
                            title="CPU Usage"
                            chart={<CpuChart chartData={chartData} />}
                            summary={<CpuSummary summary={summaryData?.summary} />}
                        />
                        <ChartCard
                            title="RAM Usage"
                            chart={<RamChart chartData={chartData} />}
                            summary={<RamSummary summary={summaryData?.summary} />}
                        />
                        <ChartCard
                            title="Network Usage"
                            chart={<NetworkChart chartData={chartData} />}
                            summary={<NetworkSummary summary={summaryData?.summary} />}
                        />
                        <ChartCard
                            title="Disk Usage"
                            chart={<DiskChart chartData={chartData} />}
                            summary={<DiskSummary summary={summaryData?.summary} />}
                        />
                    </div>
                </>
        </div>
    );
}