import { useState, useEffect, useRef } from "react";
import { 
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler,
} from 'chart.js';
import { Line } from "react-chartjs-2";

ChartJS.register(
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
    const effectRan = useRef(false);
    useEffect(() => {
        if (effectRan.current) return;
            fetchAnalytics();
            effectRan.current = true;
    }, []);

    // Line chart config
    const lineOptions = {
        scales: {
            x: {
                display: false
            }
        },
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            tooltip: {
                displayColors: false,
                callbacks: {
                    title: (context) => {
                        const timestamp = context[0].label;
                        const time = new Date(timestamp * 1000).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                            second: '2-digit',
                            hour12: false
                        });
                        return time;
                    }
                }
            }
        }
    }

    // CPU line chart
    const cpuLine = {
        labels: analyticsData?.map(item => item.timestamp) ?? [],
        datasets: [
            {
                label: "CPU Usage",
                data: analyticsData?.map(item => item.cpu) ?? [],
                backgroundColor: "#FF6384", // pink-red
                borderColor: "#FF6384"
            }
        ]
    }

    // const cpuMetrics = analyticsData.map(({cpu}) => cpu);
    // const ramMetrics = analyticsData.map(({ram}) => ram);
    // const networkSend = analyticsData.map(({net_send_mbps}) => net_send_mbps);
    // const networkRecv = analyticsData.map(({net_recv_mbps}) => net_recv_mbps);

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

    return (
        <div className="max-w-7xl mx-auto w-full">
            {console.log(analyticsData)}
            <Line data={cpuLine} options={lineOptions} />
            {/* <table className="mx-auto">
                <thead>
                    <tr>
                        <th>CPU%</th>
                        <th>RAM%</th>
                        <th>Send (Mbps)</th>
                        <th>Receive (Mbps)</th>
                    </tr>
                </thead>
                {analyticsData.length !== 0 && analyticsData.map((item) => (
                    <tbody key={item.timestamp}>
                        <tr>
                            <td>{item.cpu}</td>
                            <td>{item.ram}</td>
                            <td>{item.net_send_mbps}</td>
                            <td>{item.net_recv_mbps}</td>
                        </tr>
                    </tbody>
                ))}
            </table> */}
        </div>
    );
}