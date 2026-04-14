import { useState, useEffect, useCallback, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { Download, Bell, XCircle, CircleCheckBig } from "lucide-react";
import StatsCard from "./StatsCard"
import FilterDropdown from "../report/FilterDropdown"
import WeeklyChart from "./admin/WeeklyChart"
import Button from "../shared/Button";
import { showToast } from "../../utils/showToast";
import TeamBreakdownTable from "./admin/TeamBreakdownTable";
import UserTicketsTable from "./user/UserTicketsTable";
import Error from "../common-ui/Error";
import Empty from "../common-ui/Empty";
import ErrorIcon from "../../assets/images/ErrorIcon_reports.png";
import EmptyIcon from "../../assets/images/EmptyIcon_reports.png";
import { getMyReports, getAdminReports, getAdminReportExport } from "../../services/report.service";
import { getSprints } from "../../services/sprints.service";
import { getUsers } from "../../services/user.service";

const ReportView = ({ isAdmin, header }) => {
    const [searchParams, setSearchParams] = useSearchParams();
    // const navigate = useNavigate();
    // const location = useLocation();
    // const { id } = useParams();
    // const { openModal, closeModal } = useOutletContext();
    const user = JSON.parse(localStorage.getItem("user")) || null;
    const activeStatus = searchParams.get("status") || null;
    const activeAssignee = searchParams.get("assignee_id") || null;
    const activeSprint = searchParams.get("sprint") || null;
    const activeFrom = searchParams.get("date_from") || "";
    const activeTo = searchParams.get("date_to") || "";
    const activeSprintFilter = searchParams.get("sprint") || null;

    const STAGES = [
        { key: "SCOPED_BACKLOG", label: "Scoped Backlog" },
        { key: "SPRINT_BACKLOG", label: "Sprint Backlog" },
        { key: "TODO", label: "To Do" },
        { key: "IN_PROGRESS", label: "In Progress" },
        { key: "DONE", label: "Done" },
        { key: "TESTED", label: "Tested" },
        { key: "STAGED", label: "Staged" },
        { key: "DEPLOYED", label: "Deployed" },
    ];

    const [recentTickets, setRecentTickets] = useState([]);
    const [summary, setSummary] = useState(null);
    const [delta, setDelta] = useState(null);
    const [members, setMembers] = useState([]);     
    const [chart, setChart] = useState([]);          
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [allSprints, setAllSprints] = useState([]);
    const [allAssignees, setAllAssignees] = useState([]);
    const activeStatusLabel = STAGES.find((g) => g.key === activeStatus)?.label ?? null;
    const statusGroupOptions = STAGES.map((g) => ({ value: g.key, label: g.label }));
    const activeAssigneeName = activeAssignee
        ? allAssignees.find((a) => String(a.id) === String(activeAssignee))?.name ?? null
        : null;

    const setParam = (key, value) => {
        const next = new URLSearchParams(searchParams);
        if (value) next.set(key, value);
        else next.delete(key);
        next.delete("page");
        setSearchParams(next);
    };

    const handleDateChange = (key, value) => {
        const next = new URLSearchParams(searchParams);

        const newFrom = key === "date_from" ? value : activeFrom;
        const newTo = key === "date_to" ? value : activeTo;

        if (newFrom && newTo && new Date(newFrom) > new Date(newTo)) {
            showToast({
                title: "Invalid Date Range",
                description: "From date must be before To date",
                icon: <XCircle className="w-4 h-4" />,
                type: "error",
            });
            return;
        }

        if (value) next.set(key, value);
        else next.delete(key);

        next.delete("page");
        setSearchParams(next);
    };

    const handleStatusChip = (statusKey) => {
        const next = new URLSearchParams(searchParams);
        const isSame = activeStatus === statusKey;
        if (isSame) next.delete("status");
        else next.set("status", statusKey);
        next.delete("stageGroup");
        next.delete("page");
        setSearchParams(next);
    };


    const [exporting, setExporting] = useState(false);

    const handleCreateClick = async () => {
        try {
            setExporting(true);
            await getAdminReportExport({
                status: activeStatus || undefined,
                sprint_id: activeSprint || undefined,
                date_from: activeFrom || undefined,
                date_to: activeTo || undefined,
                assignee_id: activeAssignee || undefined,
            });

            showToast({
                title: "Export Complete",
                description: "Report exported successfully",
                icon: <CircleCheckBig className="w-4 h-4" />,
                type: "success",
            });

        } catch (err) {
            if (err?.type === "forbidden") {
                showToast({
                    title: "Forbidden",
                    description: err.message,
                    type: "error",
                    icon: <XCircle className="w-4 h-4" />,
                });
                return;
            }
            showToast({
                title: "Export Failed",
                description: "Could not export the report. Please try again.",
                type: "error",
                icon: <XCircle className="w-4 h-4" />,
            });
        } finally {
            setExporting(false);
        }
    };

    const refreshSprints = useCallback(() => {
        getSprints(1, 100)
            .then((res) => setAllSprints(res.data?.items || []))
            .catch(() => { });
    }, []);

    useEffect(() => {
        refreshSprints();
    }, [refreshSprints]);

    useEffect(() => {
        if (!isAdmin) return;
        getUsers(1, 100)
            .then((res) => setAllAssignees(res.data?.users || []))
            .catch(() => { });
    }, [isAdmin]);

    const formattedTickets = useMemo(() => {
        return recentTickets.map(t => ({
            id: t.id,
            title: t.title,
            status: t.status,
            priority: t.priority,
            sprint: t.sprint,
            assignee: {
                id: user?.id,
                name: user?.name || "Me",
            },
            deadline: t.deadline
                ? new Date(t.deadline).toLocaleDateString("en-CA", {
                    timeZone: "UTC",
                    month: "short",
                    day: "numeric",
                })
                : null,
            isOverdue: t.is_overdue,
        }));
    }, [recentTickets, user]);


    const getTrendColor = (value) => {
        if (value > 0) return "green";
        if (value === 0 || value === null) return "blue";
        return "red";
    };

const formatDelta = (raw) => (raw != null ? Math.round(raw * 100) : null);

    const stats = useMemo(() => {
        if (!summary) return [];

        if (isAdmin) {
            return [
                {
                    title: "Total Tickets",
                    value: summary.total,
                    change: formatDelta(delta?.total),
                    color: getTrendColor(delta?.total),
                },
                {
                    title: "In Progress",
                    value: summary.in_progress || 0,
                    change: formatDelta(delta?.in_progress),
                    color: getTrendColor(delta?.in_progress),
                },
                {
                    title: "Completed",
                    value: summary.completed,
                    change: formatDelta(delta?.completed),
                    color: getTrendColor(delta?.completed),
                },
                {
                    title: "Overdue",
                    value: summary.overdue,
                    change: formatDelta(delta?.overdue),
                    color:
                        delta?.overdue > 0
                            ? "red"
                            : delta?.overdue === 0 || delta?.overdue === null
                                ? "blue"
                                : "green",
                },
            ];
        }

        return [
            {
                title: "My Tickets",
                value: summary.my_tickets,
                change: formatDelta(delta?.total),
                color: getTrendColor(delta?.total),
            },
            {
                title: "Completed",
                value: summary.completed,
                change: formatDelta(delta?.completed),
                color: getTrendColor(delta?.completed),
            },
            {
                title: "Overdue",
                value: summary.overdue,
                change: formatDelta(delta?.overdue),
                color:
                    delta?.overdue > 0
                        ? "red"
                        : delta?.overdue === 0 || delta?.overdue === null
                            ? "blue"
                            : "green",
            },
        ];
    }, [summary, delta, isAdmin]);

    const DateRangeFilter = ({ from, to, onChange }) => {
        return (
            <div className="flex items-center gap-3 bg-background border border-divider/40 rounded-lg px-3 py-2">
                <div className="flex flex-col">
                    <span className="text-[12px] text-text-hint">From</span>
                    <input
                        type="date"
                        value={from}
                        onChange={(e) => onChange("date_from", e.target.value)}
                        className="bg-transparent text-sm text-text-primary outline-none"
                    />
                </div>
                <div className="w-px h-8 bg-divider/40" />
                <div className="flex flex-col">
                    <span className="text-[12px] text-text-hint">To</span>
                    <input
                        type="date"
                        value={to}
                        onChange={(e) => onChange("date_to", e.target.value)}
                        className="bg-transparent text-sm text-text-primary outline-none"
                    />
                </div>
            </div>
        );
    };

    const fetchReports = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const params = {
                status: activeStatus || undefined,
                sprint_id: activeSprint || undefined,
                date_from: activeFrom || undefined,
                date_to: activeTo || undefined,
            };

            if (isAdmin) {
                if (activeAssignee) params.assignee_id = activeAssignee;

                const res = await getAdminReports(params);

                setSummary(res.summary);
                setDelta(res.summary.period_delta);

                setMembers((res.members || []).map((m) => ({
                    id: m.user_id,
                    name: m.name,
                    assigned: m.assigned,
                    completed: m.completed,
                    inProgress: m.in_progress,
                    overdue: m.overdue,
                    completionRate: Math.round(m.completion_rate * 100),
                })));

                setChart((res.chart || []).map((c) => ({
                    week: c.week,
                    completed: c.completed,
                    inProgress: c.in_progress,
                    overdue: c.overdue,
                })));

            } else {
                const res = await getMyReports(params);

                setSummary(res.summary);
                setDelta(res.delta);
                setRecentTickets(res.recent_tickets || []);
            }

        } catch (err) {
            let message = "Something went wrong";

            if (err?.type === "forbidden") {
                showToast({
                    title: "Forbidden",
                    description: err.message,
                    type: "error",
                    icon: <XCircle className="w-4 h-4" />,
                });
                return;
            }

            if (err?.type === "validation") {
                showToast({
                    title: "Validation Error",
                    description: err.message,
                    type: "error",
                    icon: <XCircle className="w-4 h-4" />,
                });
                setError(null);
                return;
            }
            message = "Failed to load reports";
            setError(message);

            showToast({
                title: "Error",
                description: message,
                type: "error",
                icon: <XCircle className="w-4 h-4" />,
            });

        } finally {
            setLoading(false);
        }
    }, [isAdmin, activeStatus, activeSprint, activeFrom, activeTo, activeAssignee]);

    useEffect(() => {
        fetchReports();
    }, [fetchReports]);

    const FiltersSkeleton = () => {
        return (
            <div>
                <div className="w-15 h-6 skeleton rounded-full" />
            </div>
        );
    };

    const ExportBtnSkeleton = () => {
        return (
            <div>
                <div className="w-30 h-8 skeleton rounded-md" />
            </div>
        );
    };

    const StatsCardSkeleton = () => {
        return (
            <div className="h-[100px]">
                <div className="w-full h-full skeleton rounded-md" />
            </div>
        );
    };

    const ChartsSkeleton = () => {
        return (
            <div className="h-[300px]">
                <div className="w-full h-full skeleton rounded-md" />
            </div>
        );
    };

    const handleClearFilters = () => {
        setSearchParams({});
    };

    const tableIsEmpty = isAdmin ? members.length === 0 : formattedTickets.length === 0;
    const isEmptyState = !loading && !error && tableIsEmpty;
    const isErrorState = !!error && !loading;
    const shouldHideContent = isEmptyState || isErrorState || (!isAdmin && !!activeStatus);

    return (
        <div className="flex flex-col h-full bg-card-left">
            {/* Header */}
            <div className="flex items-start justify-between px-4 sm:px-6 lg:px-[16px] lg:pr-[32px] pt-4 sm:pt-[16px] pb-3">
                <div className="flex-1 min-w-0">
                    {header}
                </div>
                <div className="flex items-center gap-2 ml-3 shrink-0">
                    <button className="relative w-9 h-9 flex items-center justify-center rounded-md bg-admin-btn/40 hover:bg-admin-btn/60 transition-colors cursor-pointer">
                        <Bell className="w-4 h-4 text-text-primary" />
                        <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="mx-3 sm:mx-[16px] mt-[18px] mb-8 rounded-[10px] bg-background border border-divider/40">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between px-4 py-[12px] gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                        {loading
                            ? Array.from({ length: isAdmin ? 4 : 3 }).map((_, i) => (
                                <FiltersSkeleton key={i} />
                            ))
                            :
                            <>
                                <DateRangeFilter
                                    from={activeFrom}
                                    to={activeTo}
                                    onChange={handleDateChange}
                                />
                                <FilterDropdown
                                    label="Status"
                                    options={statusGroupOptions}
                                    value={activeStatusLabel}
                                    onChange={handleStatusChip}
                                />
                                {isAdmin && (
                                    <FilterDropdown
                                        label="Assignee"
                                        options={allAssignees.map((a) => ({ value: String(a.id), label: a.name }))}
                                        value={activeAssigneeName}
                                        onChange={(id) => setParam("assignee_id", id)}
                                    />
                                )}
                                <FilterDropdown
                                    label="Sprint"
                                    options={allSprints.map((s) => ({ value: String(s.id), label: s.name }))}
                                    value={activeSprintFilter
                                        ? allSprints.find((s) => String(s.id) === activeSprintFilter)?.name ?? null
                                        : null}
                                    onChange={(s) => setParam("sprint", s)}
                                />
                            </>
                        }
                    </div>
                    <div>
                        {loading
                            ? Array.from({ length: isAdmin ? 1 : 0 }).map((_, i) => (
                                <ExportBtnSkeleton key={i} />
                            ))
                            :
                            isAdmin && (
                                <Button
                                    onClick={handleCreateClick}
                                    disabled={exporting}
                                    className="flex items-center justify-center gap-1.5 cursor-pointer bg-accent-blue hover:bg-accent-blue/80 transition-colors !rounded-lg disabled:opacity-60 disabled:cursor-not-allowed"
                                >
                                    <Download className="w-4 h-4 text-text-primary" />
                                    <span className="text-white-btn font-inter text-[12px] sm:text-[13.5px] font-medium">
                                        {exporting ? "Exporting..." : "Export CSV"}
                                    </span>
                                </Button>
                            )
                        }
                    </div>
                </div>
            </div>

            {!shouldHideContent && (
                <div className={`grid gap-2 mb-8 px-4 ${isAdmin ? "grid-cols-2 md:grid-cols-4" : "grid-cols-2 md:grid-cols-3"}`}>
                    {loading
                        ? Array.from({ length: isAdmin ? 4 : 3 }).map((_, i) => (
                            <StatsCardSkeleton key={i} />
                        ))
                        : stats.map((s, i) => (
                            <StatsCard
                                key={i}
                                isAdmin={isAdmin}
                                title={s.title}
                                value={s.value}
                                change={s.change}
                                color={s.color}
                            />
                        ))
                    }
                </div>
            )}

            {isAdmin && !shouldHideContent && (
                <div className="px-4 mb-7">
                    {loading
                        ? Array.from({ length: isAdmin ? 1 : 0 }).map((_, i) => (
                            <ChartsSkeleton key={i} />
                        ))
                        :
                        <WeeklyChart data={chart} />
                    }
                </div>
            )}

            {/* Content area */}
            <div className="mx-3 sm:mx-[16px] my-[7px] bg-background rounded-[10px] flex flex-col flex-1 min-h-0 border border-divider/40">
                {isErrorState ? (
                    <div className="flex flex-1 items-center justify-center">
                        {isAdmin ? (
                            <Error
                                title={error}
                                description="Something went wrong. Please check your connection and try again."
                                icon={ErrorIcon}
                                onRetry={fetchReports}
                            />
                        ) : (
                            <Error
                                title={error}
                                description="We couldn't load your reports. Please try again."
                                icon={ErrorIcon}
                                onRetry={fetchReports}
                            />
                        )}
                    </div>

                ) : isEmptyState ? (
                    isAdmin ? (
                        <div className="flex flex-1 items-center justify-center">
                            <Empty
                                title="No data for selected range"
                                description="Try adjusting the date range or status filter."
                                icon={EmptyIcon}
                                onRetry={handleClearFilters}
                            />
                        </div>
                    ) : (
                        <div className="flex flex-1 items-center justify-center">
                            <Empty
                                title="No tickets yet"
                                description="You haven't been assigned any tickets yet."
                                icon={EmptyIcon}
                            />
                        </div>
                    )
                ) : (
                    <>
                        {isAdmin ? (
                            <TeamBreakdownTable
                                members={members}
                                isLoading={loading}
                            />
                        ) : (
                            <UserTicketsTable
                                tickets={formattedTickets}
                                isLoading={loading}
                            />
                        )}

                        {!isAdmin && (
                            <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 mt-auto">
                                <span className="text-hint text-text-hint">
                                    {loading ? "Loading..." : error ? "—" : `Showing ${formattedTickets.length} recent tasks`}
                                </span>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default ReportView;