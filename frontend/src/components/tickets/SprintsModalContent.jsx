import { Plus, SquarePen } from "lucide-react";
import SprintFormContent from "./SprintFormContent";

const dummySprints = [
    { id: 1, name: "Sprint 1" },
    { id: 2, name: "Sprint 2" },
    { id: 3, name: "Sprint 3" },
    { id: 4, name: "Sprint 4" },
    { id: 5, name: "Sprint 5" },
    { id: 6, name: "Sprint 6" },
    { id: 7, name: "Sprint 7" },
    { id: 8, name: "Sprint 8" },
    { id: 9, name: "Sprint 9" },
    { id: 10, name: "Sprint 10" },
    { id: 11, name: "Sprint 11" },
    { id: 12, name: "Sprint 12" },
    { id: 13, name: "Sprint 13" },
    { id: 14, name: "Sprint 14" },
    { id: 15, name: "Sprint 15" },
];

const SprintsModalContent = ({ openModal, closeModal }) => {

    const handleAdd = () => {
        openModal({
            title: "Add Sprint",
            content: (
                <SprintFormContent
                    openModal={openModal}
                    closeModal={closeModal}
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
                />
            ),
        });
    };

    return (
        <div className="space-y-3">

            <button
                onClick={handleAdd}
                className="w-10 h-10 flex items-center justify-center rounded-full bg-accent-blue hover:bg-accent-blue/80 cursor-pointer"
            >
                <Plus className="w-5 h-5 text-white" />
            </button>

            {dummySprints.map((sprint) => (
                <div
                    key={sprint.id}
                    className="flex items-center justify-between bg-[#080B12] px-4 py-2 rounded-xl text-white"
                >
                    <span>{sprint.name}</span>

                    <button
                        onClick={() => handleEdit(sprint)}
                        className="p-2 rounded-lg hover:bg-white/10 cursor-pointer"
                    >
                        <SquarePen className="w-4 h-4" />
                    </button>
                </div>
            ))}
        </div>
    );
};

export default SprintsModalContent;