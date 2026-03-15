import { useState, useEffect, useCallback, useRef } from "react";
import { useSearchParams, useNavigate, useParams, useOutletContext, useLocation } from "react-router-dom";
import { Search, ChevronDown, Plus, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "react-toastify";
import { getTickets } from "../../services/tickets.service";
import TicketsTable from "../tickets/TicketsTable";
import TicketDetailsModal from "../tickets/TicketDetailsModal";
import Loading from "../common-ui/Loading";
import Empty from "../common-ui/Empty";
import Error from "../common-ui/Error";
import Button from "../shared/Button";
import ErrorIcon from "../../assets/images/ErrorIcon.png";
import EmptyIcon from "../../assets/images/EmptyIcon.png";

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

const FilterDropdown = ({ label, options, value, onChange, raw }) => {
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
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-hint transition-colors duration-150 bg-[#6B7280]/10
    ${value
                        ? "text-accent-blue"
                        : "text-[#9CA3AF]"
                    }`}
            >
                {label}
                {value && <span className="text-hint opacity-70">: {value}</span>}
                <ChevronDown className="w-3.5 h-3.5 opacity-60" />
            </button>
            {open && (
                <div className="absolute top-full mt-1 left-0 z-50 bg-input-bg border border-divider/50 rounded-lg py-1 min-w-32 shadow-xl">
                    <button
                        onClick={() => { onChange(null); setOpen(false); }}
                        className="w-full text-left px-3 py-1.5 text-hint text-text-hint hover:bg-white/5"
                    >
                        All
                    </button>
                    {options.map((opt) => (
                        <button
                            key={opt}
                            onClick={() => { onChange(opt); setOpen(false); }}
                            className={`w-full text-left px-3 py-1.5 text-hint hover:bg-white/5
                                ${value === opt ? "text-accent-blue" : "text-text-secondary"}`}
                        >
                            {opt.charAt(0) + opt.slice(1).toLowerCase()}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

const DashboardView = ({ isAdmin, basePath, onCreateTicket, userHeader }) => {
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();
    const location = useLocation();
    const { id } = useParams();
    const { openModal, closeModal } = useOutletContext();

    // tabs: sprint | scoped | all (admin only gets all)
    const TABS = isAdmin
        ? [{ key: "sprint", label: "Sprint" }, { key: "scoped", label: "Scoped" }, { key: "all", label: "All" }]
        : [{ key: "sprint", label: "Sprint" }, { key: "scoped", label: "Scoped" }];

    const activeTab = searchParams.get("view") || "sprint";
    const activeStage = searchParams.get("stage") || null;
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

    // show success toast on redirect from login
    useEffect(() => {
        if (location.state?.success) {
            toast.success(location.state.success);
            window.history.replaceState({}, document.title);
        }
    }, [location.state]);

    const fetchTickets = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const params = { view: activeTab, page: currentPage };
            if (activePriority) params.priority = activePriority;
            if (activeAssignee && isAdmin) params.assignee = activeAssignee;
            if (searchQuery) params.search = searchQuery;

            const res = await getTickets(params);
            console.log("Data from Backend:", res);
            setAllTickets(res.items || res);
            setPagination(res.paginationMeta || null);
        } catch (err) {
            console.error("Full error:", err);
            setError(err.response?.data?.error || err.message || "Failed to load tickets");
        } finally {
            setLoading(false);
        }
    }, [activeTab, activePriority, activeAssignee, searchQuery, currentPage]);

    useEffect(() => {
        fetchTickets();
    }, [fetchTickets]);

    useEffect(() => {
        if (!activeStage) {
            setTickets(allTickets);
        } else {
            setTickets(allTickets.filter((t) => t.status === activeStage));
        }
    }, [allTickets, activeStage]);

    useEffect(() => {
        if (id && allTickets.length) {
            const ticket = allTickets.find((t) => String(t.id) === String(id));
            if (ticket) openModal(<TicketDetailsModal ticket={ticket} />);
        }
    }, [id, allTickets]);

    const currentViewAssignees = allTickets
        .filter(t => t.assignee)
        .map(t => t.assignee);

    useEffect(() => {
        if (currentViewAssignees.length > 0) {
            const map = new Map();
            allAssigneesRef.current.forEach(a => map.set(a.id, a));
            currentViewAssignees.forEach(a => map.set(a.id, a));
            allAssigneesRef.current = Array.from(map.values());
        }
    }, [allTickets]);

    const assignees = allAssigneesRef.current.filter(a => {
        const existsInCurrentView = currentViewAssignees.some(curr => curr.id === a.id);
        const isCurrentlySelected = String(a.id) === String(activeAssignee);

        return existsInCurrentView || isCurrentlySelected;
    });
    const currentSprint = allTickets.find(t => t.sprint)?.sprint;

    const handleRowClick = (ticket) => {
    navigate(`${basePath}/tickets/${ticket.id}${location.search}`);
};

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

    const handleStageChip = (stageKey) => {
        setParam("stage", activeStage === stageKey ? null : stageKey);
    };

    const handleSearch = (e) => {
        setParam("search", e.target.value || null);
    };

    const handlePageChange = (page) => {
        const next = new URLSearchParams(searchParams);
        next.set("page", page);
        setSearchParams(next);
    };

    const showContext = activeTab === "all" && isAdmin;
    const showAssignee = isAdmin;

    const viewLabel = activeTab === "sprint"
        ? "Sprint Backlog"
        : activeTab === "scoped"
            ? "Scoped Backlog"
            : "All Tickets";

    const total = pagination?.total ?? 0;
    const limit = pagination?.limit ?? 20;
    const totalPages = pagination?.totalPages ?? 1;

    return (
        <div className="flex flex-col h-full bg-card-left">

            {/* User header (user dashboard only) */}
            {userHeader && (
                <div className="pl-[16px] pt-[16px] pb-[4px]">
                    {userHeader}
                </div>
            )}

            {/* Tabs row + Create button */}
            <div className="flex items-center justify-between pl-[32px] pr-[32px] py-[16px]">
                <div className="flex gap-1">
                    {TABS.map(({ key, label }) => (
                        <button
                            key={key}
                            onClick={() => handleTabChange(key)}
                            className={`px-3 py-1 mb-[-1px] font-inter font-medium text-[16px] transition-colors duration-150 relative
                                ${activeTab === key
                                    ? "text-text-primary after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-accent-blue"
                                    : "text-text-hint hover:text-text-primary"
                                }`}
                        >
                            {label}
                        </button>
                    ))}
                </div>

                <div className="flex items-center gap-3">
                    {/* User dashboard: sprint badge */}
                    {!isAdmin && userHeader && (
                        <div className="flex items-center gap-2">
                            <span className="px-3 py-1 rounded-full text-hint border border-[#60A5FA]/60 text-[#60A5FA] bg-[#60A5FA]/10 mt-[-110px] mr-[10px]">
                                {currentSprint ? currentSprint.name : "No Sprint"}
                            </span>
                        </div>
                    )}

                    {isAdmin && (
                        <Button
                            onClick={onCreateTicket}
                            className="flex items-center justify-center gap-1.5 bg-accent-blue hover:bg-accent-blue/90 transition-colors !rounded-lg"
                        >
                            <Plus className="w-4 h-4 text-text-primary" />
                            <span className="text-white-btn font-inter text-[13.5px] font-medium">Create Ticket</span>
                        </Button>
                    )}
                </div>
            </div>
            <div className="border-b border-divider/40 mx-[33px]" />
            {/* Filters row */}
            <div className="mx-[16px] mt-[16px] mb-[7px] rounded-[10px] bg-background border border-[#49475a]/50">
                <div className="flex items-center justify-between pl-[16px] pr-[132px] py-[10px] gap-3">
                    <div className="flex items-center gap-2 ">
                        <FilterDropdown
                            label="Stage"
                            options={STAGES.map((s) => s.key)}
                            value={activeStage}
                            onChange={(v) => setParam("stage", v)}
                        />
                        {isAdmin && (
                            <FilterDropdown
                                label="Assignee"
                                options={assignees.map(a => a.name)}
                                value={activeAssignee ? assignees.find(a => String(a.id) === String(activeAssignee))?.name : null}
                                onChange={(name) => {
                                    const selected = assignees.find(a => a.name === name);
                                    setParam("assignee", selected ? selected.id : null);
                                }}
                                raw
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
                    </div>

                    {/* Search */}
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-card-left border border-divider/50 rounded-lg w-[260px] shrink-0">
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
            <div className="mx-[16px] my-[7px] bg-background rounded-[10px] flex flex-col flex-1 border border-[#49475a]/50">

                <div className="flex-1 pt-4 pb-0">

                    {/* Section heading + stage chips */}
                    <h2 className="font-poppins font-semibold text-[20px] text-text-primary pl-[16px] mb-[2px]">Tickets</h2>

                    {/* Stage chips */}
                    <div className="flex flex-wrap gap-2 pl-[16px] mb-[12px]">
                        {STAGES.map(({ key, label }) => (
                            <button
                                key={key}
                                onClick={() => handleStageChip(key)}
                                className={`px-3 py-1 rounded-full text-hint font-medium border transition-colors duration-150
                                ${activeStage === key
                                        ? STAGE_CHIP_ACTIVE[key]
                                        : STAGE_CHIP_STYLES[key]
                                    }`}
                            >
                                {label}
                            </button>
                        ))}
                    </div>

                    {/* States */}
                    {loading ? (
                        <Loading variant="skeleton" rows={8} />
                    ) : error ? (
                        <Error
                            title={error}
                            description="Something went wrong. Please try again."
                            icon={ErrorIcon}
                            onRetry={fetchTickets}
                        />
                    ) : tickets.length === 0 ? (
                        <Empty
                            title={`No tickets in ${viewLabel}`}
                            description="No tasks have been added to this sprint yet"
                            icon={EmptyIcon}
                        />
                    ) : (
                        <TicketsTable
                            tickets={tickets}
                            basePath={basePath}
                            showAssignee={showAssignee}
                            showContext={showContext}
                            onRowClick={handleRowClick}
                        />
                    )}
                </div>

                {/* Footer: count + pagination */}
                <div className="flex items-center justify-between px-6 py-4 mt-auto">
                    <span className="text-hint text-text-hint">
                        {loading
                            ? "Loading..."
                            : `Showing ${tickets.length} of ${total} tasks`}
                    </span>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage <= 1 || loading}
                            className="w-7 h-7 flex items-center justify-center rounded-full bg-[#49475a]/50 text-text-primary hover:bg-[#49475a]/70 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage >= totalPages || loading}
                            className="w-7 h-7 flex items-center justify-center rounded-full bg-[#49475a]/50 text-text-primary hover:bg-[#49475a]/70 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
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