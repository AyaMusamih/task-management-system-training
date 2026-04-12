import { TrendingDown, TrendingUp } from "lucide-react";

const StatsCard = ({
    title,
    value,
    change = 0,
    color = "blue",
    isAdmin
}) => {
    const iconType = change > 0 ? "up" : change < 0 ? "down" : "neutral";

    const colorClasses = {
        blue: "text-accent-blue",
        green: "text-accent-green",
        red: "text-error-red",
    };

    const subtitleColors = {
        blue: "text-text-hint",
        green: "text-accent-green",
        red: "text-error-red",
    };

    const iconMap = {
        up: <TrendingUp className="w-4 h-4" />,
        down: <TrendingDown className="w-4 h-4" />,
    };

    return (
        <div className="bg-background p-2 rounded-lg border border-divider/40 text-center">
            <p className={"text-xs text-text-primary"}>{title}</p>


            <p className={`text-3xl font-bold ${colorClasses[color]} mt-1`}>
                {value}
            </p>
            {change === 0 || change === null ? (
                <div className="flex items-center justify-center gap-3 mb-1">
                    <p className={`text-xs ${subtitleColors[color]} mt-1`}>
                        {isAdmin ? "No change" : title === "My Tickets" ? "Total assigned to me" : "No change"}
                    </p>
                </div>
            ) : (
                <div className="flex items-center justify-center gap-1 mb-1">
                    <div className={subtitleColors[color]}>
                        {iconMap[iconType]}
                    </div>
                    <p className={`text-xs ${subtitleColors[color]} mt-1`}>
                        {change}% vs last period
                    </p>
                </div>
            )}

        </div>
    );
}
export default StatsCard;