import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import {
  fetchProjects,
  createProject,
  updateProject,
  deleteProject,
} from "../services/projects.service"
import { getCurrentUser } from "../services/auth.service"
import ProjectCard from "../components/projects/ProjectCard"
import ProjectFormModal from "../components/projects/ProjectFormModal"
import { toastSuccess, toastError } from "../utils/toastHelpers";
import ConfirmDialog from "../components/shared/ConfirmDialog"
import { TriangleAlert, Bell, Plus, Search } from "lucide-react"

const ProjectCardSkeleton = () => {
  return (
    <div className="rounded-2xl border border-white/5 bg-background p-5">
      {/* shimmer wrapper */}
      <div className="animate-pulse space-y-4">

        {/* top */}
        <div className="flex items-start justify-between">
          <div className="h-11 w-11 rounded-xl bg-white/5" />
          <div className="h-6 w-20 rounded-full bg-white/5" />
        </div>

        {/* title */}
        <div className="h-5 w-2/3 rounded bg-white/5" />

        {/* description */}
        <div className="space-y-2">
          <div className="h-3 w-full rounded bg-white/5" />
          <div className="h-3 w-5/6 rounded bg-white/5" />
        </div>

        {/* footer */}
        <div className="flex items-center justify-between pt-2">
          <div className="flex gap-2">
            <div className="h-7 w-7 rounded-full bg-white/5" />
            <div className="h-7 w-7 rounded-full bg-white/5" />
            <div className="h-7 w-7 rounded-full bg-white/5" />
          </div>

          <div className="h-4 w-20 rounded bg-white/5" />
        </div>

      </div>
    </div>
  )
}
export default function ProjectsPage() {
  const navigate = useNavigate()

  const currentUser = getCurrentUser()
  const isAdmin = String(currentUser?.role || "").toLowerCase() === "admin"

  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState("")

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingProject, setEditingProject] = useState(null) // null = create, object = edit
  const [saving, setSaving] = useState(false)

  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState(null)

  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  const loadProjects = async () => {
    try {
      setLoading(true)

      const data = await fetchProjects(page, 10)
      setProjects(data.items || [])
      setPagination(data.paginationMeta)
    } catch (err) {
      toastError(err, "Failed to load projects")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadProjects()
  }, [page])

  const openCreate = () => {
    setEditingProject(null)
    setIsModalOpen(true)
  }

  const openEdit = (project) => {
    setEditingProject(project)
    setIsModalOpen(true)
  }

  const openDashboard = (project) => {
    const base = isAdmin ? "/admin/projects" : "/projects"
    navigate(`${base}/${project.id}/dashboard`)
  }

  const handleSave = async (form) => {
    try {
      setSaving(true)

      if (editingProject) {
        const updated = await updateProject(editingProject.id, form)

        setProjects((prev) =>
          prev.map((p) =>
            p.id === editingProject.id
              ? { ...p, ...(updated || form) }
              : p
          )
        )

        toastSuccess(
          "Project Updated",
          "Project updated successfully."
        )
      } else {
        const created = await createProject(form)

        if (created) {
          setProjects((prev) => [created, ...prev])

          toastSuccess(
            "Project Created",
            "Project created successfully."
          )
        } else {
          await loadProjects()
        }
      }

      setIsModalOpen(false)
      setEditingProject(null)
    } catch (err) {
      toastError(err, "Failed to save project")
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = (project) => {
    setDeleteTarget(project)
  }

  const handlePermanentDelete = async () => {
    if (!deleteTarget) return

    try {
      setDeleteLoading(true)

      await deleteProject(deleteTarget.id)

      setProjects((prev) =>
        prev.filter((p) => p.id !== deleteTarget.id)
      )

      toastSuccess(
        "Project Deleted",
        `"${deleteTarget.name}" deleted successfully.`
      )

      setDeleteTarget(null)
    } catch (err) {
      toastError(err, "Failed to delete project")
    } finally {
      setDeleteLoading(false)
    }
  }

  const filtered = projects.filter((p) =>
    (p.name || p.title || "").toLowerCase().includes(query.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-card-left text-text-primary">
      <div className="px-8 py-8">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-text-primary">Projects</h1>
            <p className="mt-1 text-md text-text-hint">
              {isAdmin
                ? "Manage and organize your projects across the workspace."
                : "Select a project to view its tickets and sprints."}
            </p>
          </div>

          <button className="relative w-9 h-9 flex items-center justify-center rounded-md bg-admin-btn/40 hover:bg-admin-btn/60 transition-colors cursor-pointer">
            <Bell className="w-4 h-4 text-text-primary" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
          </button>
        </div>

        {/* Toolbar */}
        <div className="mt-6 flex items-center gap-4 rounded-xl bg-background p-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-hint" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search projects..."
              className="w-full rounded-lg bg-card-left border border-card-left/10 py-2.5 pl-10 pr-4 text-sm text-text-primary placeholder:text-text-hint focus:outline-none focus:ring-1 focus:ring-accent-blue"
            />
          </div>

          {isAdmin && (
            <button
              type="button"
              onClick={openCreate}
              className="flex items-center gap-2 cursor-pointer rounded-lg bg-accent-blue hover:bg-accent-blue/80 px-5 py-2.5 text-sm font-semibold text-white transition-colors"
            >
              <Plus className="w-4 h-4 text-text-primary" />
              Create Project
            </button>
          )}
        </div>


        {loading ? (
          <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <ProjectCardSkeleton key={i} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="mt-16 text-center text-text-hint">No projects found.</div>
        ) : (
          <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filtered.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                isAdmin={isAdmin}
                onOpen={() => openDashboard(project)}
                onEdit={() => openEdit(project)}
                onDelete={() => handleDelete(project)}
              />
            ))}
          </div>
        )}
      </div>

      {isAdmin && (
        <ProjectFormModal
          isOpen={isModalOpen}
          project={editingProject}
          saving={saving}
          onClose={() => {
            setIsModalOpen(false)
            setEditingProject(null)
          }}
          onSave={handleSave}
        />
      )}

      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <ConfirmDialog
            icon={<TriangleAlert className="w-5 h-5" />}
            ticket={{
              id: deleteTarget.id,
              title: deleteTarget.name,
            }}
            title="Delete project permanently?"
            description="This action cannot be undone."
            confirmText="Delete permanently"
            variant="permDanger"
            loading={deleteLoading}
            onConfirm={handlePermanentDelete}
            onCancel={() => setDeleteTarget(null)}
          />
        </div>
      )}
    </div>
  )
}