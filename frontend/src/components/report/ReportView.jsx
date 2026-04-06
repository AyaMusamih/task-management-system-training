import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { useSearchParams, useNavigate, useParams, useOutletContext, useLocation } from "react-router-dom";
import { Download, ChevronLeft, ChevronRight, Bell } from "lucide-react";
import StatsCard from "../report/StatsCard"
import FilterDropdown from "../report/FilterDropdown"
import WeeklyChart from "../report/WeeklyChart"
import Button from "../shared/Button";
import { showToast } from "../../utils/showToast";
import TeamBreakdownTable from "./TeamBreakdownTable";
import UserTicketsTable from "./UserTicketsTable";
import Error from "../common-ui/Error";
import Empty from "../common-ui/Empty";
import ErrorIcon from "../../assets/images/ErrorIcon_reports.png";
import EmptyIcon from "../../assets/images/EmptyIcon_reports.png";

const PRIORITY_OPTIONS = ["CRITICAL", "HIGH", "MEDIUM", "LOW"];

const ReportView = ({ isAdmin, basePath, onCreateTicket, onRetry, header }) => {
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();
    const location = useLocation();
    const { id } = useParams();
    const { openModal, closeModal } = useOutletContext();
    const user = JSON.parse(localStorage.getItem("user")) || null;

    const activeStatus = searchParams.get("status") || null;
    const activePriority = searchParams.get("priority") || null;
    const activeAssignee = searchParams.get("assignee") || null;
    const activeSprint = searchParams.get("sprint") || null;
    const currentPage = parseInt(searchParams.get("page") || "1", 10);

    // -------------------- Mock Data --------------------
    const mockAssignees = [
        { id: 1, name: "Alice" },
        { id: 2, name: "Bob" },
        { id: 3, name: "Charlie" },
        { id: 14, name: "Rand Haymouni" },
    ];

    const mockSprints = [
        { id: 101, name: "Sprint 1" },
        { id: 102, name: "Sprint 2" },
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

    const mockTickets = Array.from({ length: 25 }).map((_, i) => {
        const status = STAGES[i % STAGES.length].key;
        const priority = PRIORITY_OPTIONS[i % PRIORITY_OPTIONS.length];
        const assignee = mockAssignees[i % mockAssignees.length];

        const now = new Date();
        const randomDays = Math.floor(Math.random() * 30);
        const deadline = new Date(now.getTime() + randomDays * 24 * 60 * 60 * 1000);

        const isOverdue = status !== "DONE" && deadline < now;

        const createdAt = new Date(now.getTime() - Math.floor(Math.random() * 15) * 24 * 60 * 60 * 1000);

        return {
            id: i + 1,
            title: `Ticket ${i + 1}`,
            status,
            priority,
            assignee,
            sprint: mockSprints[i % mockSprints.length],
            deadline: deadline.toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
            }),
            isOverdue,
            createdAt,
        };
    });

    const [allTickets, setAllTickets] = useState(mockTickets);
    const [pagination, setPagination] = useState({ total: mockTickets.length, totalPages: 3 });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const allAssigneesRef = useRef(mockAssignees);


    const setParam = (key, value) => {
        const next = new URLSearchParams(searchParams);
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
        onCreateTicket?.(allAssigneesRef.current, mockSprints[0]);
    };

    const assignees = allAssigneesRef.current;
    const currentSprint = mockSprints[0];

    const total = pagination?.total ?? 0;
    const totalPages = pagination?.totalPages ?? 1;

    const activeStatusLabel = STAGES.find((g) => g.key === activeStatus)?.label ?? null;
    const statusGroupOptions = STAGES.map((g) => ({ value: g.key, label: g.label }));
    const activeSprintName = activeSprint
        ? mockSprints.find((s) => String(s.id) === String(activeSprint))?.name ?? null
        : null;
    const activeAssigneeName = activeAssignee
        ? allAssigneesRef.current.find((a) => String(a.id) === String(activeAssignee))?.name ?? null
        : null;

    const filteredTickets = useMemo(() => {
        let filtered = [...allTickets];

        if (!isAdmin && user) {
            filtered = filtered.filter(
                t => String(t.assignee?.id) === String(user.id)
            );
        }

        if (activeStatus) {
            filtered = filtered.filter(t => t.status === activeStatus);
        }

        if (activePriority) {
            filtered = filtered.filter(t => t.priority === activePriority);
        }

        if (activeAssignee) {
            filtered = filtered.filter(
                t => String(t.assignee?.id) === String(activeAssignee)
            );
        }
        if (activeSprint) {
            filtered = filtered.filter(
                t => String(t.sprint?.id) === String(activeSprint)
            );
        }

        return filtered;
    }, [allTickets, activeStatus, activePriority, activeAssignee, user, isAdmin]);

    const teamStats = useMemo(() => {
        const grouped = {};

        filteredTickets.forEach(t => {
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

    }, [filteredTickets]);

    const stats = useMemo(() => {
        const total = filteredTickets.length;

        const completed = filteredTickets.filter(t =>
            ["DONE", "DEPLOYED"].includes(t.status)
        ).length;

        const inProgress = filteredTickets.filter(t =>
            t.status === "IN_PROGRESS"
        ).length;

        const overdue = filteredTickets.filter(t => {
            if (!t.deadline) return false;
            const now = new Date();
            return new Date(t.deadline) < now && t.status !== "DONE";
        }).length;

        const isAdmin = user?.role === "ADMIN";

        const baseStats = [
            {
                title: isAdmin ? "Total Tickets" : "My Tickets",
                value: total,
                change: 0,
                color: "blue",
            },
            {
                title: "Completed",
                value: completed,
                change: 12,
                color: "green",
            },
            {
                title: "Overdue",
                value: overdue,
                change: -10,
                color: "red",
            },
        ];

        if (isAdmin) {
            baseStats.splice(2, 0, {
                title: "In Progress",
                value: inProgress,
                change: -5,
                color: "red",
            });
        }

        return baseStats;

    }, [filteredTickets, user]);

    const chartData = useMemo(() => {
        const grouped = {};

        filteredTickets.forEach(t => {
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
    }, [filteredTickets]);

    const MocdataWeeks = [
        { week: "Week1", completed: 10, inProgress: 5, overdue: 3 },
        { week: "Week2", completed: 5, inProgress: 2, overdue: 1 },
        { week: "Week3", completed: 2, inProgress: 6, overdue: 7 },
        { week: "Week4", completed: 10, inProgress: 10, overdue: 10 },
    ];

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

    const isEmptyState = !loading && !error && filteredTickets.length === 0;
    const isErrorState = !!error;
    const shouldHideContent = isEmptyState || isErrorState;

    return (
        <div className="flex flex-col h-full bg-card-left">
            {/* Header */}
            <div className="flex items-start justify-between px-4 sm:px-6 lg:px-[16px] lg:pr-[32px] pt-4 sm:pt-[16px] pb-3">
                <div className="flex-1 min-w-0">
                    {header}
                </div>
                <div className="flex items-center gap-2 ml-3 shrink-0">
                    {!isAdmin && currentSprint && (
                        <span className="hidden sm:inline-flex px-3 py-1 rounded-full text-hint border border-[#60A5FA]/60 text-[#60A5FA] bg-[#60A5FA]/10">
                            {currentSprint.name}
                        </span>
                    )}
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
                            ? Array.from({ length: 3 }).map((_, i) => (
                                <FiltersSkeleton key={i} />
                            ))
                            :
                            <>
                                <FilterDropdown
                                    label="Date range"
                                    options={[]}
                                    value={null}
                                    onChange={() => { }}
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
                                        onChange={(id) => setParam("assignee", id)}
                                    />
                                )}
                                {!isAdmin && (<FilterDropdown
                                    label="Sprint"
                                    options={mockSprints.map((s) => ({
                                        value: String(s.id),
                                        label: s.name
                                    }))}
                                    value={activeSprintName}
                                    onChange={(id) => setParam("sprint", id)}
                                />
                                )}
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
                            onRetry={() => console.log("retry clicked")}
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
                                error={error}
                                onRetry={onRetry}
                            />
                        ) : (
                            <UserTicketsTable
                                tickets={filteredTickets}
                                isLoading={loading}
                                error={error}
                                onRetry={onRetry}
                            />
                        )}

                        {/* Footer: count + pagination */}
                        <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 mt-auto">
                            <span className="text-hint text-text-hint hidden sm:inline">
                                {loading ? "Loading..." : error ? "—" : `Showing ${filteredTickets.length} of ${total} tasks`}
                            </span>
                            <span className="text-hint text-text-hint sm:hidden">
                                {!loading && !error && `${filteredTickets.length} / ${total}`}
                            </span>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => handlePageChange(currentPage - 1)}
                                    disabled={currentPage <= 1 || loading || !!error}
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