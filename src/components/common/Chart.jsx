import {
    ResponsiveContainer,
    LineChart,
    Line,
    AreaChart,
    Area,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
} from 'recharts';

export default function Chart({ type = 'line', data = [], dataKeys = [], height = 300, colors = [] }) {
    const defaultColors = ['#CF9D7B', '#724B39', '#3A3534', '#162127', '#0C1519'];
    const chartColors = colors.length > 0 ? colors : defaultColors;

    const renderChart = () => {
        switch (type) {
            case 'area':
                return (
                    <AreaChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border-light)" />
                        <XAxis dataKey="name" stroke="var(--color-text-muted)" fontSize={12} />
                        <YAxis stroke="var(--color-text-muted)" fontSize={12} />
                        <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid var(--color-border-light)' }} />
                        <Legend />
                        {dataKeys.map((key, i) => (
                            <Area
                                key={key}
                                type="monotone"
                                dataKey={key}
                                stroke={chartColors[i % chartColors.length]}
                                fill={chartColors[i % chartColors.length]}
                                fillOpacity={0.1}
                            />
                        ))}
                    </AreaChart>
                );
            case 'bar':
                return (
                    <BarChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border-light)" />
                        <XAxis dataKey="name" stroke="var(--color-text-muted)" fontSize={12} />
                        <YAxis stroke="var(--color-text-muted)" fontSize={12} />
                        <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid var(--color-border-light)' }} />
                        <Legend />
                        {dataKeys.map((key, i) => (
                            <Bar key={key} dataKey={key} fill={chartColors[i % chartColors.length]} radius={[4, 4, 0, 0]} />
                        ))}
                    </BarChart>
                );
            default:
                return (
                    <LineChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border-light)" />
                        <XAxis dataKey="name" stroke="var(--color-text-muted)" fontSize={12} />
                        <YAxis stroke="var(--color-text-muted)" fontSize={12} />
                        <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid var(--color-border-light)' }} />
                        <Legend />
                        {dataKeys.map((key, i) => (
                            <Line
                                key={key}
                                type="monotone"
                                dataKey={key}
                                stroke={chartColors[i % chartColors.length]}
                                strokeWidth={2}
                                dot={{ r: 4 }}
                                activeDot={{ r: 6 }}
                            />
                        ))}
                    </LineChart>
                );
        }
    };

    return (
        <ResponsiveContainer width="100%" height={height}>
            {renderChart()}
        </ResponsiveContainer>
    );
}
