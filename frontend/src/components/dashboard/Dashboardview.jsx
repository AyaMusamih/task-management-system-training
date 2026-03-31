import { useState, useEffect, useCallback, useRef } from "react";
import { useSearchParams, useNavigate, useParams, useOutletContext, useLocation } from "react-router-dom";
import { Search, ChevronDown, Plus, ChevronLeft, ChevronRight, Bell, CircleAlert, CircleCheckBig, ClockArrowDown } from "lucide-react";
import { getTickets } from "../../services/tickets.service";
import TicketsTable from "../tickets/TicketsTable";
import TicketDetailsModal from "../tickets/TicketDetailsModal";
import Button from "../shared/Button";
import { showToast } from "../../utils/showToast";
import SprintsModalContent from "../tickets/SprintsModalContent"

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

const STAGE_GROUPS = [
    { key: "needs_action", label: "Needs Action", statuses: ["TODO", "IN_PROGRESS"] },
    { key: "in_review", label: "In Review", statuses: ["TESTED", "STAGED"] },
    { key: "completed", label: "Completed", statuses: ["DONE", "DEPLOYED"] },
    { key: "backlog", label: "Backlog", statuses: ["SCOPED_BACKLOG", "SPRINT_BACKLOG"] },
];

const STAGE_CHIP_STYLES = {
    SCOPED_BACKLOG: "border border-[#6B7280]/60 text-[#6B7280] bg-transparent hover:bg-[#6B7280]/10",
    SPRINT_BACKLOG: "border border-[#A78BFA]/60 text-[#A78BFA] bg-transparent hover:bg-[#A78BFA]/10",
    TODO: "border border-[#60A5FA]/60 text-[#60A5FA] bg-transparent hover:bg-[#60A5FA]/10",
    IN_PROGRESS: "border border-[#F59E0B]/60 text-[#F59E0B] bg-transparent hover:bg-[#F59E0B]/10",
    DONE: "border border-[#22C55E]/60 text-[#22C55E] bg-transparent hover:bg-[#22C55E]/10",
    TESTED: "border border-[#06B6D4]/60 text-[#06B6D4] bg-transparent hover:bg-[#06B6D4]/10",
    STAGED: "border border-[#F97316]/60 text-[#F97316] bg-transparent hover:bg-[#F97316]/10",
    DEPLOYED: "border border-[#16A34A]/60 text-[#16A34A] bg-transparent hover:bg-[#16A34A]/10",
};

const STAGE_CHIP_ACTIVE = {
    SCOPED_BACKLOG: "bg-[#6B7280]/20 border-[#6B7280] text-[#6B7280]",
    SPRINT_BACKLOG: "bg-[#A78BFA]/20 border-[#A78BFA] text-[#A78BFA]",
    TODO: "bg-[#60A5FA26] border-[#60A5FA] text-[#60A5FA]",
    IN_PROGRESS: "bg-[#F59E0B26] border-[#F59E0B] text-[#F59E0B]",
    DONE: "bg-[#22C55E26] border-[#22C55E] text-[#22C55E]",
    TESTED: "bg-[#06B6D426] border-[#06B6D4] text-[#06B6D4]",
    STAGED: "bg-[#F9731626] border-[#F97316] text-[#F97316]",
    DEPLOYED: "bg-[#16A34A26] border-[#16A34A] text-[#16A34A]",
};

const PRIORITY_OPTIONS = ["CRITICAL", "HIGH", "MEDIUM", "LOW"];

const FilterDropdown = ({ label, options, value, onChange }) => {
    const [open, setOpen] = useState(false);
    const ref = useRef(null);

    useEffect(() => {
        const handler = (e) => {
            if (ref.current && !ref.current.contains(e.target)) setOpen(false);
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    return (
        <div className="relative" ref={ref}>
            <button
                onClick={() => setOpen((v) => !v)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-hint transition-colors duration-150 bg-[#6B7280]/10 cursor-pointer
                    ${value ? "text-accent-blue" : "text-[#9CA3AF]"}`}
            >
                <span>{label}</span>
                {value && <span className="text-hint opacity-70">: {value}</span>}
                <ChevronDown className="w-3.5 h-3.5 opacity-60" />
            </button>
            {open && (
                <div className="absolute top-full mt-1 left-0 z-50 bg-input-bg border border-divider/50 rounded-lg py-1 min-w-36 shadow-xl">
                    <button
                        onClick={() => { onChange(null); setOpen(false); }}
                        className="w-full text-left px-3 py-1.5 text-hint text-text-hint hover:bg-white/5 cursor-pointer"
                    >
                        All
                    </button>
                    {options.map((opt) => (
                        <button
                            key={opt.value ?? opt}
                            onClick={() => { onChange(opt.value ?? opt); setOpen(false); }}
                            className={`w-full text-left px-3 py-1.5 text-hint hover:bg-white/5 cursor-pointer
                                ${value === (opt.label ?? opt) ? "text-accent-blue" : "text-text-secondary"}`}
                        >
                            {opt.label ?? (opt.charAt(0) + opt.slice(1).toLowerCase())}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

const iconMap = {
        success: <CircleCheckBig className="w-4 h-4" />,
        error: <CircleAlert className="w-4 h-4" />,
    };


const DashboardView = ({ isAdmin, basePath, onCreateTicket, onRegisterRefresh, header }) => {
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();
    const location = useLocation();
    const { id } = useParams();
    const { openModal, closeModal } = useOutletContext();

    const TABS = isAdmin
        ? [{ key: "sprint", label: "Sprint" }, { key: "scoped", label: "Scoped" }, { key: "all", label: "All" }]
        : [{ key: "sprint", label: "Sprint" }, { key: "scoped", label: "Scoped" }];

    const activeTab = searchParams.get("view") || "sprint";
    const activeStageGroup = searchParams.get("stageGroup") || null;
    const activeStatus = searchParams.get("status") || null;
    const activePriority = searchParams.get("priority") || null;
    const activeAssignee = searchParams.get("assignee") || null;
    const searchQuery = searchParams.get("search") || "";
    const currentPage = parseInt(searchParams.get("page") || "1", 10);

    const [allTickets, setAllTickets] = useState([]);
    const [tickets, setTickets] = useState([]);
    const [pagination, setPagination] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const allAssigneesRef = useRef([]);
    
    useEffect(() => {
        if (location.state?.toast) {
            const toastData = location.state.toast;

            showToast({
                ...toastData,
                icon: iconMap[toastData.icon],
            });
            window.history.replaceState({}, document.title);
        }
    }, [location.state]);

    const fetchTickets = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const params = { view: activeTab, page: currentPage };
            if (activeStatus) params.status = activeStatus;
            if (activePriority) params.priority = activePriority;
            if (activeAssignee && isAdmin) params.assignee = activeAssignee;
            if (searchQuery) params.search = searchQuery;

            const res = await getTickets(params);
            console.log("Backend response:", res);
            setAllTickets(res.items || res);
            setPagination(res.paginationMeta || null);
        } catch (err) {
            console.error("Full error:", err);
            setError(err.response?.data?.error || err.message || "Failed to load tickets");
        } finally {
            setLoading(false);
        }
    }, [activeTab, activeStatus, activePriority, activeAssignee, searchQuery, currentPage, isAdmin]);

    // Register refresh function with parent (AdminDashboard)
    useEffect(() => {
        if (onRegisterRefresh) {
            onRegisterRefresh(fetchTickets);
        }
    }, [onRegisterRefresh, fetchTickets]);

    useEffect(() => { fetchTickets(); }, [fetchTickets]);

    useEffect(() => {
        if (!activeStageGroup) { setTickets(allTickets); return; }
        const group = STAGE_GROUPS.find((g) => g.key === activeStageGroup);
        setTickets(group ? allTickets.filter((t) => group.statuses.includes(t.status)) : allTickets);
    }, [allTickets, activeStageGroup]);

    useEffect(() => {
        if (activeAssignee) return;
        const incoming = allTickets.filter((t) => t.assignee).map((t) => t.assignee);
        if (incoming.length === 0) return;
        const map = new Map();
        allAssigneesRef.current.forEach((a) => map.set(String(a.id), a));
        incoming.forEach((a) => map.set(String(a.id), a));
        allAssigneesRef.current = Array.from(map.values());
    }, [allTickets, activeAssignee]);

    const hasOpenedModal = useRef(false);
    useEffect(() => {
        if (!id) { hasOpenedModal.current = false; return; }
        if (!allTickets.length || hasOpenedModal.current) return;
        const ticket = allTickets.find((t) => String(t.id) === String(id));
        if (!ticket) return;
        hasOpenedModal.current = true;

        openModal({
            title: "Ticket Details",
            content: (
                <TicketDetailsModal
                    ticket={ticket}
                    assignees={allAssigneesRef.current}
                    onRefresh={fetchTickets}
                    openModal={openModal}
                    closeModal={closeModal}
                />
            ),
        });
    }, [id, allTickets, openModal, closeModal, fetchTickets]);

    const handleOpenSprints = () => {
        openModal({
            title: "Sprints",
            content: (
                <SprintsModalContent
                    openModal={openModal}
                    closeModal={closeModal}
                />
            ),
        });
    };

    const assignees = allAssigneesRef.current;
    const currentSprint = allTickets.find((t) => t.sprint)?.sprint;

    const setParam = (key, value) => {
        const next = new URLSearchParams(searchParams);
        if (value) next.set(key, value);
        else next.delete(key);
        next.delete("page");
        setSearchParams(next);
    };

    const handleTabChange = (tab) => {
        const next = new URLSearchParams();
        next.set("view", tab);
        setSearchParams(next);
    };

    const handleStageGroupChange = (groupKey) => {
        const next = new URLSearchParams(searchParams);
        if (groupKey) next.set("stageGroup", groupKey);
        else next.delete("stageGroup");
        next.delete("status");
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

    const handleSearch = (e) => { setParam("search", e.target.value || null); };
    const handlePageChange = (page) => {
        const next = new URLSearchParams(searchParams);
        next.set("page", page);
        setSearchParams(next);
    };

    // Pass current assignees list to onCreateTicket so the modal can populate the dropdown
    const handleCreateClick = () => {
        onCreateTicket?.(allAssigneesRef.current, currentSprint ?? null);
    };

    const showAssignee = isAdmin;
    const showContext = activeTab === "all" && isAdmin;

    const viewLabel = activeTab === "sprint" ? "Sprint" : activeTab === "scoped" ? "Scoped" : "All Tickets";
    const total = pagination?.total ?? 0;
    const totalPages = pagination?.totalPages ?? 1;

    const activeStageGroupLabel = STAGE_GROUPS.find((g) => g.key === activeStageGroup)?.label ?? null;
    const stageGroupOptions = STAGE_GROUPS.map((g) => ({ value: g.key, label: g.label }));
    const activeAssigneeName = activeAssignee
        ? allAssigneesRef.current.find((a) => String(a.id) === String(activeAssignee))?.name ?? null
        : null;

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

            {/* Tabs + Create button */}
            <div className="flex items-center justify-between px-2 sm:px-4 lg:px-0 lg:pr-[32px] py-3 sm:py-[16px]">
                <div className="flex gap-1">
                    {TABS.map(({ key, label }) => (
                        <button
                            key={key}
                            onClick={() => handleTabChange(key)}
                            className={`ml-2 px-3 py-1 mb-[-1px] font-inter font-medium text-[14px] sm:text-[16px] transition-colors duration-150 relative cursor-pointer
                                ${activeTab === key
                                    ? "text-text-primary after:absolute after:bottom-[-17px] after:left-3 after:right-3 after:h-0.5 after:bg-accent-blue"
                                    : "text-text-hint hover:text-text-primary"
                                }`}
                        >
                            {label}
                        </button>
                    ))}
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-2 shrink-0">

                    {/* Sprints Button */}
                    {isAdmin && (
                        <button
                            onClick={handleOpenSprints}
                            className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-orange-400/40 text-orange-400 hover:bg-orange-400/10 transition-colors cursor-pointer"
                        >
                            <ClockArrowDown className="w-4 h-4" />
                            <span className="text-sm font-medium">Sprints</span>
                        </button>
                    )}

                    {isAdmin && (
                        <Button
                            onClick={handleCreateClick}
                            className="flex items-center justify-center gap-1.5 cursor-pointer bg-accent-blue hover:bg-accent-blue/80 transition-colors !rounded-lg"
                        >
                            <Plus className="w-4 h-4 text-text-primary" />
                            <span className="text-white-btn font-inter text-[12px] sm:text-[13.5px] font-medium">Create Task</span>
                        </Button>
                    )}
                </div>
            </div>

            <div className="border-b border-[#00000033] mx-3 sm:mx-[20px]" />

            {/* Filters */}
            <div className="mx-3 sm:mx-[16px] mt-[32px] mb-[25px] rounded-[10px] bg-background py-[7px]">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between px-4 py-[10px] gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                        <FilterDropdown
                            label="Stage"
                            options={stageGroupOptions}
                            value={activeStageGroupLabel}
                            onChange={handleStageGroupChange}
                        />
                        {isAdmin && (
                            <FilterDropdown
                                label="Assignee"
                                options={assignees.map((a) => ({ value: String(a.id), label: a.name }))}
                                value={activeAssigneeName}
                                onChange={(id) => setParam("assignee", id)}
                            />
                        )}
                        <FilterDropdown
                            label="Priority"
                            options={PRIORITY_OPTIONS}
                            value={activePriority}
                            onChange={(v) => setParam("priority", v)}
                        />
                        <FilterDropdown
                            label="Date"
                            options={[]}
                            value={null}
                            onChange={() => { }}
                        />
                        <FilterDropdown
                            label="Sprint"
                            options={[]}
                            value={null}
                            onChange={() => { }}
                        />
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-card-left border border-divider/50 rounded-lg w-full sm:w-[280px] lg:w-[442px]">
                        <Search className="w-3.5 h-3.5 text-[#6B7280] shrink-0" />
                        <input
                            type="text"
                            placeholder="Search tasks..."
                            value={searchQuery}
                            onChange={handleSearch}
                            className="bg-transparent outline-none text-hint text-[#6B7280] placeholder:text-[#6B7280] w-full"
                        />
                    </div>
                </div>
            </div>

            {/* Content area */}
            <div className="mx-3 sm:mx-[16px] my-[7px] bg-background rounded-[10px] flex flex-col flex-1 min-h-0">
                <div className="flex-1 pt-4 pb-0 min-h-0">

                    <div className="flex items-center px-4 sm:px-[16px] mb-6">
                        <h2 className="font-poppins font-semibold text-[18px] sm:text-[20px] text-text-primary">Tickets</h2>
                    </div>

                    {/* Status chips */}
                    {activeTab !== "scoped" && (
                        <div className="flex gap-2 px-3 sm:px-[16px] mb-3 overflow-x-auto scrollbar-none pb-3">
                            {STAGES.filter(({ key }) =>
                                activeTab === "sprint" ? key !== "SCOPED_BACKLOG" : true
                            ).map(({ key, label }) => (
                                <button
                                    key={key}
                                    onClick={() => handleStatusChip(key)}
                                    className={`px-3 py-1 rounded-full text-hint font-medium border transition-colors duration-150 cursor-pointer whitespace-nowrap shrink-0
                    ${activeStatus === key ? STAGE_CHIP_ACTIVE[key] : STAGE_CHIP_STYLES[key]}`}
                                >
                                    {label}
                                </button>
                            ))}
                        </div>
                    )}

                    <TicketsTable
                        tickets={tickets}
                        basePath={basePath}
                        showAssignee={showAssignee}
                        showContext={showContext}
                        onRowClick={(ticket) =>
                            navigate(`${basePath}/tickets/${ticket.id}${location.search}`)
                        }
                        isLoading={loading}
                        error={error}
                        onRetry={fetchTickets}
                        viewLabel={viewLabel}
                    />
                </div>

                {/* Footer: count + pagination */}
                <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 mt-auto">
                    <span className="text-hint text-text-hint hidden sm:inline">
                        {loading ? "Loading..." : error ? "—" : `Showing ${tickets.length} of ${total} tasks`}
                    </span>
                    <span className="text-hint text-text-hint sm:hidden">
                        {!loading && !error && `${tickets.length} / ${total}`}
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
            </div>
        </div>
    );
};

export default DashboardView;