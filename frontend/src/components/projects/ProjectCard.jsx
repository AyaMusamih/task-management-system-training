import { useEffect, useRef, useState } from "react"
import { toastSuccess, toastError } from "../../utils/toastHelpers";
import { Database, Cpu, Palette, Clock3, MoreVertical, Pencil, Trash2, Clock, AlertTriangle } from "lucide-react"
const ICONS = {
    database: {
        wrap: "bg-purple-500/15 text-purple-400",
        icon: Database,
    },
    api: {
        wrap: "bg-blue-500/15 text-blue-400",
        icon: Cpu,
    },
    design: {
        wrap: "bg-amber-500/15 text-amber-400",
        icon: Palette,
    },
    activity: {
        wrap: "bg-red-500/15 text-red-400",
        icon: Clock3,
    }
}

function normalizeStatus(status) {
    const s = String(status || "").toLowerCase().replace(/[\s_-]/g, "")
    if (s === "completed" || s === "finalized" || s === "done") return "COMPLETED"
    if (s === "onhold" || s === "hold" || s === "paused") return "ON_HOLD"
    return "ACTIVE"
}

const STATUS_BADGE = {
    COMPLETED: { label: "COMPLETED", cls: "bg-purple-500/15 text-purple-300" },
    ACTIVE: { label: "ACTIVE", cls: "bg-blue-500/15 text-blue-300" },
    ON_HOLD: { label: "ON HOLD", cls: "bg-amber-500/15 text-amber-300" },
    OVERDUE: { label: "OVERDUE", cls: "bg-red-500/15 text-red-300" },

}

const ICON_BY_STATUS = { COMPLETED: "database", ACTIVE: "api", ON_HOLD: "design", OVERDUE: "activity" }

export default function ProjectCard({ project, onEdit, onDelete, onOpen, isAdmin = false }) {
    const [menuOpen, setMenuOpen] = useState(false)
    const menuRef = useRef(null)

    const today = new Date()

    const status =
        project.totalTasks > 0 &&
            project.tasksDone === project.totalTasks
            ? "COMPLETED"
            : project.endDate &&
                today > new Date(project.endDate)
                ? "OVERDUE"
                : !project.isActive
                    ? "ON_HOLD"
                    : "ACTIVE"
    const iconKey = project.icon || ICON_BY_STATUS[status]
    const icon = ICONS[iconKey] ?? ICONS.database
    const badge = STATUS_BADGE[status]
    const title = project.name || project.title
    const progress = project.progress ?? 100

    useEffect(() => {
        const handler = (e) => {
            if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false)
        }
        if (menuOpen) document.addEventListener("mousedown", handler)
        return () => document.removeEventListener("mousedown", handler)
    }, [menuOpen])

    const handleCardKeyDown = (e) => {
        if (e.key === "Enter" || e.key === " ") {
            e.preventDefault()
            onOpen?.()
        }
    }

    const dueDays = (() => {
        if (!project.endDate) return null

        const today = new Date()
        const endDate = new Date(project.endDate)

        const diffTime = endDate - today
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

        return diffDays
    })()

    const IconComponent = icon.icon;
    return (
        <div
            role="button"
            tabIndex={0}
            onClick={() => onOpen?.()}
            onKeyDown={handleCardKeyDown}
            className="flex cursor-pointer flex-col rounded-2xl border border-white/5 bg-background p-5 text-left transition-colors hover:border-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-blue/60"
        >
            {/* Top row: icon + status + menu */}
            <div className="flex items-start justify-between">
                <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${icon.wrap}`}>
                    <IconComponent size={22} />
                </div>

                <div className="flex items-center gap-2">
                    <span className={`rounded-full px-3 py-1 text-[11px] font-semibold tracking-wide ${badge.cls}`}>
                        {badge.label}
                    </span>

                    {isAdmin && (
                        <div className="relative" ref={menuRef}>
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.stopPropagation()
                                    setMenuOpen((o) => !o)
                                }}
                                className="cursor-pointer flex h-8 w-8 items-center justify-center rounded-lg text-text-hint transition-colors hover:bg-white/5 hover:text-text-primary"
                                aria-label="Project options"
                            >
                                <MoreVertical size={18} />
                            </button>

                            {menuOpen && (
                                <div className="absolute right-0 top-10 z-20 w-36 overflow-hidden rounded-lg border border-white/10 bg-background py-1 shadow-xl">
                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            setMenuOpen(false)
                                            onEdit?.()
                                        }}
                                        className="cursor-pointer flex w-full items-center gap-2 px-3 py-2 text-sm text-text-primary transition-colors hover:bg-white/5"
                                    >
                                        <Pencil size={15} />
                                        Edit
                                    </button>
                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            setMenuOpen(false)
                                            onDelete?.()
                                        }}
                                        className="cursor-pointer flex w-full items-center gap-2 px-3 py-2 text-sm text-red-400 transition-colors hover:bg-red-500/10"
                                    >
                                        <Trash2 size={15} />
                                        Delete
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Title + description */}
            <h3 className="mt-4 text-lg font-bold text-text-primary">{title}</h3>
            <p className="mt-1 text-sm leading-relaxed text-text-hint">{project.description}</p>

            {/* Footer */}
            <div className="mt-6">
                {status === "COMPLETED" && (
                    <div>
                        <div className="flex items-center justify-between text-[11px] font-semibold tracking-wide text-text-hint">
                            <span>FINALIZED</span>
                            <span>{progress}%</span>
                        </div>
                        <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                            <div className="h-full rounded-full bg-purple-500" style={{ width: `${progress}%` }} />
                        </div>
                    </div>
                )}

                {(status === "ACTIVE" || status === "OVERDUE") && (
                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
                            <span className="h-7 w-7 rounded-full border-2 border-card-left bg-zinc-700" />
                            <span className="-ml-2 h-7 w-7 rounded-full border-2 border-card-left bg-zinc-600" />
                            <span className="-ml-2 flex h-7 w-7 items-center justify-center rounded-full border-2 border-card-left bg-zinc-800 text-[10px] font-semibold text-text-hint">
                                +{project.members ?? 2}
                            </span>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-text-hint">
                            <Clock size={14} />

                            {dueDays === null
                                ? "No due date"
                                : dueDays < 0
                                    ? `${Math.abs(dueDays)} days overdue`
                                    : dueDays === 0
                                        ? "Due today"
                                        : `${dueDays} days left`}
                        </div>
                    </div>
                )}

                {status === "ON_HOLD" && (
                    <div className="flex items-center justify-end gap-1.5 text-xs font-medium text-amber-400">
                        <AlertTriangle size={14} />
                        Feedback Required
                    </div>
                )}
            </div>
        </div>
    )
}