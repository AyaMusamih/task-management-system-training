import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
} from "recharts"

const WeeklyChart = ({ data, title = "Tickets by status — last 6 weeks" }) => {
    return (
        <div className="bg-background border border-divider/40 rounded-lg p-4">
            <h2 className="text-sm font-medium text-text-primary mb-4">{title}</h2>
            <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-accent-green" />
                    <span className="text-xs text-text-hint">Completed</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-accent-blue" />
                    <span className="text-xs text-text-hint">In Progress</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-error-red" />
                    <span className="text-xs text-text-hint">Overdue</span>
                </div>
            </div>
            <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data} barGap={4}>
                        <XAxis
                            dataKey="week"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: "rgba(237, 241, 250, 0.35)", fontSize: 12 }}
                            tickFormatter={(value, index) => `Week ${index + 1}`}
                        />
                        <YAxis hide />
                        <Tooltip
                            cursor={{ fill: "rgba(255, 255, 255, 0.02)" }}
                            contentStyle={{
                                backgroundColor: "#080b12",
                                border: "1px solid #49475a",
                                borderRadius: "8px",
                            }}
                            labelStyle={{ color: "#ffffff" }}
                        />
                        <Bar dataKey="completed" fill="#22C55E" />
                        <Bar dataKey="inProgress" fill="#3B82F6" />
                        <Bar dataKey="overdue" fill="#EF4444" />
                    </BarChart>

                </ResponsiveContainer>
            </div>
        </div>
    )
}
export default WeeklyChart;