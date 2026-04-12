import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { useSearchParams, useNavigate, useParams, useOutletContext, useLocation } from "react-router-dom";
import { Download, ChevronLeft, ChevronRight, Bell, XCircle } from "lucide-react";
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
import { getMyReports } from "../../services/report.service";
import { getSprints } from "../../services/sprints.service";

const ReportView = ({ isAdmin, onRetry, header }) => {
    const [searchParams, setSearchParams] = useSearchParams();
    // const navigate = useNavigate();
    // const location = useLocation();
    // const { id } = useParams();
    // const { openModal, closeModal } = useOutletContext();
    const user = JSON.parse(localStorage.getItem("user")) || null;
    const activeStatus = searchParams.get("status") || null;
    const activeAssignee = searchParams.get("assignee_id") || null;
    const activeSprint = searchParams.get("sprint") || null;
    const currentPage = parseInt(searchParams.get("page") || "1", 10);
    const activeFrom = searchParams.get("date_from") || "";
    const activeTo = searchParams.get("date_to") || "";
    const activeSprintFilter = searchParams.get("sprint") || null;

    // -------------------- Mock Data --------------------
    const mockAssignees = [
        { id: 1, name: "Alice" },
        { id: 2, name: "Bob" },
        { id: 3, name: "Charlie" },
        { id: 14, name: "Rand Haymouni" },
    ];

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

    const [allTickets, setAllTickets] = useState([]);
    const [summary, setSummary] = useState(null);
    const [delta, setDelta] = useState(null);
    const [pagination, setPagination] = useState({ total: allTickets.length, totalPages: 3 });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [allSprints, setAllSprints] = useState([]);
    const allAssigneesRef = useRef(mockAssignees);
    const assignees = allAssigneesRef.current;
    const activeStatusLabel = STAGES.find((g) => g.key === activeStatus)?.label ?? null;
    const statusGroupOptions = STAGES.map((g) => ({ value: g.key, label: g.label }));
    const activeAssigneeName = activeAssignee
        ? allAssigneesRef.current.find((a) => String(a.id) === String(activeAssignee))?.name ?? null
        : null;

    const buildParams = () => {
        return {
            status: activeStatus || undefined,
            sprint_id: activeSprint || undefined,
            date_from: activeFrom || null,
            date_to: activeTo || null,
        };
    };

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
        const fromDate = new Date(newFrom);
        const toDate = new Date(newTo);

        if (fromDate > toDate) {
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

    const handlePageChange = (page) => {
        const next = new URLSearchParams(searchParams);
        next.set("page", page);
        setSearchParams(next);
    };

    const handleCreateClick = () => {
        console.log("Export CSV Button Clicked");
    };

    const refreshSprints = useCallback(() => {
        getSprints(1, 100)
            .then((res) => setAllSprints(res.data?.items || []))
            .catch(() => { });
    }, []);

    useEffect(() => {
        refreshSprints();
    }, [refreshSprints]);

    const formattedTickets = useMemo(() => {
        return allTickets.map(t => ({
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
    }, [allTickets, user]);
    
    const total = formattedTickets.length;
    console.log(formattedTickets);

    const teamStats = useMemo(() => {
        const grouped = {};

        formattedTickets.forEach(t => {
            const userId = t.assignee?.id;
            const userName = t.assignee?.name;

            if (!userId) return;

            if (!grouped[userId]) {
                grouped[userId] = {
                    id: userId,
                    name: userName,
                    avatar: userName?.charAt(0) || "?",
                    assigned: 0,
                    completed: 0,
                    inProgress: 0,
                    overdue: 0,
                    completionRate: 0,
                };
            }

            grouped[userId].assigned++;

            if (["DONE", "DEPLOYED"].includes(t.status)) {
                grouped[userId].completed++;
            }

            if (t.status === "IN_PROGRESS") {
                grouped[userId].inProgress++;
            }

            if (t.deadline) {
                const now = new Date();
                if (new Date(t.deadline) < now && t.status !== "DONE") {
                    grouped[userId].overdue++;
                }
            }
        });

        return Object.values(grouped).map(user => ({
            ...user,
            completionRate: user.assigned
                ? Math.round((user.completed / user.assigned) * 100)
                : 0,
        }));

    }, [formattedTickets]);

    const getTrendColor = (value) => {
        if (value > 0) return "green";
        if (value === 0 || value === null) return "blue";
        return "red";
    };

    const stats = useMemo(() => {
        if (!summary) return [];

        const baseStats = [
            {
                title: isAdmin ? "Total Tickets" : "My Tickets",
                value: summary.my_tickets,
                change: delta?.total,
                color: getTrendColor(delta?.total),
            },
            {
                title: "Completed",
                value: summary.completed,
                change: delta?.completed,
                color: getTrendColor(delta?.completed),
            },
            {
                title: "Overdue",
                value: summary.overdue,
                change: delta?.overdue,
                color:
                    delta?.overdue > 0
                        ? "red"
                        : delta?.overdue === 0 || delta?.overdue === null
                            ? "blue"
                            : "green",
            },
        ];

        if (isAdmin) {
            baseStats.splice(1, 0, {
                title: "In Progress",
                value: summary.in_progress || 0,
                change: delta?.in_progress,
                color: getTrendColor(delta?.in_progress),
            });
        }

        return baseStats;
    }, [summary, delta, isAdmin]);

    const chartData = useMemo(() => {
        const grouped = {};

        formattedTickets.forEach(t => {
            const date = new Date(t.createdAt);
            const week = `${date.getFullYear()}-W${Math.ceil(date.getDate() / 7)}`;

            if (!grouped[week]) {
                grouped[week] = {
                    week,
                    completed: 0,
                    inProgress: 0,
                    overdue: 0,
                };
            }

            if (["DONE", "DEPLOYED"].includes(t.status)) {
                grouped[week].completed++;
            } else if (t.status === "IN_PROGRESS") {
                grouped[week].inProgress++;
            }

            if (t.deadline) {
                const now = new Date();
                if (new Date(t.deadline) < now && t.status !== "DONE") {
                    grouped[week].overdue++;
                }
            }
        });

        return Object.values(grouped).slice(-6);
    }, [formattedTickets]);

    const MocdataWeeks = [
        { week: "Week1", completed: 10, inProgress: 5, overdue: 3 },
        { week: "Week2", completed: 5, inProgress: 2, overdue: 1 },
        { week: "Week3", completed: 2, inProgress: 6, overdue: 7 },
        { week: "Week4", completed: 10, inProgress: 10, overdue: 10 },
    ];

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

            const res = await getMyReports(buildParams());

            setSummary(res.summary);
            setDelta(res.delta);
            setAllTickets(res.recent_tickets || []);

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
    }, [activeStatus, activeSprint, activeFrom, activeTo]);

    useEffect(() => {
        fetchReports();
    }, [fetchReports]);

    const ITEMS_PER_PAGE = 10;
    const totalPages = Math.ceil(formattedTickets.length / ITEMS_PER_PAGE);

    const paginatedTickets = useMemo(() => {
        const start = (currentPage - 1) * ITEMS_PER_PAGE;
        return formattedTickets.slice(start, start + ITEMS_PER_PAGE);
    }, [formattedTickets, currentPage]);

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

    const isEmptyState = !loading && !error && formattedTickets.length === 0;
    const isErrorState = !!error && !loading;
    const shouldHideContent = isEmptyState || isErrorState;

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
                                        options={assignees.map((a) => ({ value: String(a.id), label: a.name }))}
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
                                    className="flex items-center justify-center gap-1.5 cursor-pointer bg-accent-blue hover:bg-accent-blue/80 transition-colors !rounded-lg"
                                >
                                    <Download className="w-4 h-4 text-text-primary" />
                                    <span className="text-white-btn font-inter text-[12px] sm:text-[13.5px] font-medium">Export CSV</span>
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
                        <WeeklyChart data={MocdataWeeks} />
                    }
                </div>
            )}

            {/* Content area */}
            <div className="mx-3 sm:mx-[16px] my-[7px] bg-background rounded-[10px] flex flex-col flex-1 min-h-0 border border-divider/40">
                {isErrorState ? (
                    <div className="flex flex-1 items-center justify-center">
                        <Error
                            title={error}
                            description="We couldn't load your reports. Please try again."
                            icon={ErrorIcon}
                            onRetry={fetchReports}
                        />
                    </div>
                ) : isEmptyState ? (
                    isAdmin ? (
                        <div className="flex flex-1 items-center justify-center">
                            <Empty
                                title="No tickets yet"
                                description="You haven't been assigned any tickets yet."
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
                                members={teamStats}
                                isLoading={loading}
                            />
                        ) : (
                            <UserTicketsTable
                                tickets={formattedTickets}
                                isLoading={loading}
                            />
                        )}

                        {/* Footer: count + pagination */}
                        <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 mt-auto">
                            <span className="text-hint text-text-hint hidden sm:inline">
                                {loading ? "Loading..." : error ? "—" : `Showing ${paginatedTickets.length} of ${formattedTickets.length} tasks`}
                            </span>
                            <span className="text-hint text-text-hint sm:hidden">
                                {!loading && !error && `${formattedTickets.length} / ${total}`}
                            </span>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => handlePageChange(currentPage - 1)}
                                    disabled={currentPage <= 1 || loading || !!error || currentPage >= totalPages}
                                    className="w-8 h-8 flex items-center justify-center rounded-full bg-[#49475a]/50 text-text-primary hover:bg-[#49475a]/70 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => handlePageChange(currentPage + 1)}
                                    disabled={currentPage >= totalPages || loading || !!error}
                                    className="w-8 h-8 flex items-center justify-center rounded-full bg-[#49475a]/50 text-text-primary hover:bg-[#49475a]/70 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                                >
                                    <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default ReportView;