import { useEffect, useState } from "react"
import { X, ChevronsUpDown } from "lucide-react"

const EMPTY = {
  name: "",
  description: "",
  status: "Active",
  startDate: "",
  endDate: "",
}

const toInputDate = (d) => (d ? String(d).slice(0, 10) : "")

export default function ProjectFormModal({ isOpen, project, saving, onClose, onSave }) {
  const isEdit = Boolean(project)
  const [form, setForm] = useState(EMPTY)

  useEffect(() => {
    if (!isOpen) return
    if (project) {
      setForm({
        name: project.name || project.title || "",
        description: project.description || "",
        status: project.status || "Active",
        startDate: toInputDate(project.startDate),
        endDate: toInputDate(project.endDate),
      })
    } else {
      setForm(EMPTY)
    }
  }, [isOpen, project])

  if (!isOpen) return null

  const update = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))

  const handleSubmit = (e) => {
    e.preventDefault()

    onSave?.({
      name: form.name,
      description: form.description,
      startDate: form.startDate
        ? `${form.startDate}T00:00:00.000Z`
        : null,
      endDate: form.endDate
        ? `${form.endDate}T23:59:59.000Z`
        : null,
      isActive: form.status === "Active",
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={onClose}>
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-xl rounded-2xl bg-card-left p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-xl font-bold text-text-primary">
              {isEdit ? "Edit Project" : "Create New Project"}
            </h2>
            <p className="mt-1 text-sm text-text-hint">
              Define your next milestone in the Obsidian ecosystem.
            </p>
          </div>
          <button type="button" onClick={onClose} className="cursor-pointer text-text-hint transition-colors hover:text-text-primary" aria-label="Close">
            <X size={20} />
          </button>
        </div>

        {/* Project Name */}
        <div className="mt-6">
          <label className="text-sm font-semibold text-text-primary">
            Project Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            required
            value={form.name}
            onChange={update("name")}
            placeholder="e.g. Quantum Interface Redesign"
            className="mt-2 w-full rounded-lg bg-background px-4 py-3 text-sm text-text-primary placeholder:text-text-hint focus:outline-none focus:ring-1 focus:ring-accent-blue"
          />
        </div>

        {/* Description */}
        <div className="mt-4">
          <label className="text-sm font-semibold text-text-primary">Description</label>
          <textarea
            value={form.description}
            onChange={update("description")}
            rows={4}
            placeholder="Briefly describe the project goals and scope..."
            className="mt-2 w-full resize-none rounded-lg bg-background px-4 py-3 text-sm text-text-primary placeholder:text-text-hint focus:outline-none focus:ring-1 focus:ring-accent-blue"
          />
        </div>

        {/* Status + Dates */}
        <div className="mt-4 grid grid-cols-2 gap-4">

          <div>
            <label className="text-sm font-semibold text-text-primary">Start Date</label>
            <input type="date" value={form.startDate} onChange={update("startDate")} className="mt-2 w-full rounded-lg bg-background px-4 py-3 text-sm text-text-primary focus:outline-none focus:ring-1 focus:ring-accent-blue" />
          </div>

          <div>
            <label className="text-sm font-semibold text-text-primary">End Date</label>
            <input type="date" value={form.endDate} onChange={update("endDate")} className="mt-2 w-full rounded-lg bg-background px-4 py-3 text-sm text-text-primary focus:outline-none focus:ring-1 focus:ring-accent-blue" />
          </div>

          <div className="col-span-2 sm:col-span-1">
            <label className="text-sm font-semibold text-text-primary">Status</label>
            <div className="relative mt-2">
              <select
                value={form.status}
                onChange={update("status")}
                className="w-full cursor-pointer appearance-none rounded-lg bg-background px-4 py-3 text-sm text-text-primary focus:outline-none focus:ring-1 focus:ring-accent-blue"
              >
                <option>Active</option>
                <option>On Hold</option>
              </select>
              <ChevronsUpDown
                size={16}
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-text-hint"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 flex items-center justify-end gap-3">
          <button type="button" onClick={onClose} className="cursor-pointer rounded-lg px-5 py-2.5 text-sm font-semibold text-text-primary transition-colors hover:bg-white/5">
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="cursor-pointer rounded-lg bg-accent-blue hover:bg-accent-blue/80  px-5 py-2.5 text-sm font-semibold text-white transition-colors disabled:opacity-60"
          >
            {saving ? "Saving..." : isEdit ? "Update Project" : "Save Project"}
          </button>
        </div>
      </form>
    </div>
  )
}