import { useState, useEffect } from "react";
import { Plus, SquarePen, Trash2 } from "lucide-react";
import SprintFormContent from "./SprintFormContent";
import ConfirmDialog from "../shared/ConfirmDialog";
import { getSprints, deleteSprint } from "../../services/sprints.service";
import Loading from "../common-ui/Loading";
import { toastSuccess, toastError } from "../../utils/toastHelpers";

const SprintsModalContent = ({ openModal, closeModal, onSprintsChange }) => {
    const [sprints, setSprints] = useState([]);
    const [loading, setLoading] = useState(true);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [deleteLoading, setDeleteLoading] = useState(false);

    const fetchSprints = async () => {
        setLoading(true);
        try {
            const res = await getSprints();
            setSprints(res.data?.items || []);
        } catch (err) {
            toastError(err, "Failed to Load Sprints");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSprints();
    }, []);

    const handleAdd = () => {
        openModal({
            title: "Add Sprint",
            content: (
                <SprintFormContent
                    openModal={openModal}
                    closeModal={closeModal}
                    onSuccess={() => {
                        fetchSprints();
                        onSprintsChange?.();
                    }}
                />
            ),
        });
    };

    const handleEdit = (sprint) => {
        openModal({
            title: "Edit Sprint",
            content: (
                <SprintFormContent
                    sprint={sprint}
                    openModal={openModal}
                    closeModal={closeModal}
                    onSuccess={() => {
                        fetchSprints();
                        onSprintsChange?.();
                    }}
                />
            ),
        });
    };

    const handleDeleteConfirm = async () => {
        if (!deleteTarget) return;
        setDeleteLoading(true);
        try {
            await deleteSprint(deleteTarget.id);
            toastSuccess("Sprint Deleted", `"${deleteTarget.name}" has been permanently deleted.`);
            setDeleteTarget(null);
            fetchSprints();
            onSprintsChange?.();
        } catch (err) {
            toastError(err, "Failed to Delete Sprint");
        } finally {
            setDeleteLoading(false);
        }
    };

    return (
        <div className="space-y-3">

            <button
                onClick={handleAdd}
                className="w-10 h-10 flex items-center justify-center rounded-full bg-accent-blue hover:bg-accent-blue/80 cursor-pointer"
            >
                <Plus className="w-5 h-5 text-white" />
            </button>

            {loading ? (
                <Loading variant="skeleton" rows={5} />
            ) : sprints.length === 0 ? (
                <p className="text-text-hint text-hint text-center py-6">No sprints yet. Create one!</p>
            ) : (
                sprints.map((sprint) => (
                    <div
                        key={sprint.id}
                        className="flex items-center justify-between bg-[#080B12] px-4 py-2 rounded-xl text-white"
                    >
                        <div className="flex flex-col min-w-0">
                            <span className="text-field-label text-text-primary">{sprint.name}</span>
                            {sprint.isActive && (
                                <span className="text-hint text-[#22C55E]">Active</span>
                            )}
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                            <button
                                onClick={() => handleEdit(sprint)}
                                className="p-2 rounded-lg hover:bg-white/10 cursor-pointer"
                                title="Edit sprint"
                            >
                                <SquarePen className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => setDeleteTarget(sprint)}
                                className="p-2 rounded-lg hover:bg-red-500/10 text-red-400 cursor-pointer"
                                title="Delete sprint"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                ))
            )}

            {deleteTarget && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    <div
                        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                        onClick={() => setDeleteTarget(null)}
                    />
                    <div className="relative z-10">
                        <ConfirmDialog
                            icon={<Trash2 className="w-5 h-5" />}
                            title="Delete Sprint?"
                            description={`This will permanently delete "${deleteTarget.name}". This action cannot be undone.`}
                            confirmText="Delete Sprint"
                            cancelText="Cancel"
                            variant="danger"
                            loading={deleteLoading}
                            onConfirm={handleDeleteConfirm}
                            onCancel={() => setDeleteTarget(null)}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default SprintsModalContent;