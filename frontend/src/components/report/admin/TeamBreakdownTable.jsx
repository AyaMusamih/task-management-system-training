import Loading from "../../common-ui/Loading";

const CompletionRateBar = ({ rate, color }) => {
    return (
        <div className="flex items-center gap-2">
            <div className="flex-1 h-2 bg-input-bg rounded-full overflow-hidden w-[150px]">
                <div
                    className="h-full rounded-full transition-all"
                    style={{ width: `${rate}%`, backgroundColor: color }}
                />
            </div>
            <span className="text-xs text-text-hint w-10">{rate}%</span>
        </div>
    )
}

const AVATAR_COLORS = [
    "bg-[#A78BFA]",
    "bg-[#60A5FA]",
    "bg-[#22C55E]",
    "bg-[#F59E0B]",
    "bg-[#F97316]",
    "bg-[#06B6D4]",
    "bg-[#DC2626]",
    "bg-[#16A34A]",
];

const getInitials = (name) => {
    if (!name) return "?";
    return name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
};
const getAvatarColor = (name = "") => {
    let hash = 0;
    for (let i = 0; i < name.length; i++) hash += name.charCodeAt(i);
    return AVATAR_COLORS[hash % AVATAR_COLORS.length];
};

export default function TeamBreakdownTable({
    members,
    title = "Per-user breakdown",
    isLoading = false
}) {
    return (
        <div className="bg-background rounded-lg p-4">
            <h2 className="font-poppins font-semibold text-[18px] sm:text-[20px] text-text-primary mb-4">{title}</h2>

            <div className="overflow-x-auto">
                <table className="w-full rounded-[8px] overflow-hidden min-w-[540px]">
                    <thead className="bg-input-bg">
                        <tr>
                            <th className="text-left py-3 px-4 text-hint text-text-hint font-medium w-[20%]">MEMBER</th>
                            <th className="text-left py-3 px-4 text-hint text-text-hint font-medium w-[12%]">ASSIGNED</th>
                            <th className="text-left py-3 px-4 text-hint text-text-hint font-medium w-[12%]">COMPLETED</th>
                            <th className="text-left py-3 px-4 text-hint text-text-hint font-medium w-[12%]">IN PROGRESS</th>
                            <th className="text-left py-3 px-4 text-hint text-text-hint font-medium w-[12%]">OVERDUE</th>
                            <th className="text-left py-3 px-4 text-hint text-text-hint font-medium w-[12%]">COMPLETION RATE</th>
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading ? (
                            <tr>
                                <td colSpan={6}>
                                    <Loading variant="skeleton" rows={6} />
                                </td>
                            </tr>
                        ) : (
                            members.map((member) => (
                                <tr key={member.id} className="border-b border-divider/50">
                                    <td className="py-3 px-4">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-hint font-semibold text-white-btn ${getAvatarColor(member.name)}`}>
                                                {getInitials(member.name)}
                                            </div>
                                            <span className="text-field-label text-text-primary">{member.name}</span>
                                        </div>
                                    </td>
                                    <td className="py-3 px-10 text-field-label text-text-secondary">{member.assigned}</td>
                                    <td className="py-3 px-10">
                                        <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-accent-green/20 text-accent-green text-xs font-medium">
                                            {member.completed}
                                        </span>
                                    </td>
                                    <td className="py-3 px-10">
                                        <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-accent-blue/20 text-accent-blue text-xs font-medium">
                                            {member.inProgress}
                                        </span>
                                    </td>
                                    <td className="py-3 px-8">
                                        <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-error-red/20 text-error-red text-xs font-medium">
                                            {member.overdue}
                                        </span>
                                    </td>
                                    <td className="py-3 px-4 w-48">
                                        <CompletionRateBar
                                            rate={member.completionRate}
                                            color={
                                                member.completionRate >= 80
                                                    ? "#22C55E"
                                                    : member.completionRate >= 60
                                                        ? "#F59E0B"
                                                        : "#EF4444"
                                            }
                                        />
                                    </td>
                                </tr>
                            )))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}