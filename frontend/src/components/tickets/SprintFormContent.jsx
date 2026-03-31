import { useState, useEffect } from "react";
import { ChevronLeft, XCircle, CircleCheckBig } from "lucide-react";
import SprintsModalContent from "./SprintsModalContent";
import { showToast } from "../../utils/showToast";
import Button from "../shared/Button";
import Input from "../shared/Input";

const SprintFormContent = ({ sprint, openModal, closeModal }) => {
    const isEdit = !!sprint;

    const [name, setName] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    useEffect(() => {
        if (sprint) {
            setName(sprint.name || "");
        }
    }, [sprint]);

    const validate = ({ name, startDate, endDate }) => {
        const errors = {};

        if (!name.trim()) {
            errors.name = "Name is required";
        } else if (name.trim().length < 3) {
            errors.name = "Name must be at least 3 characters";
        }

        if (!startDate) {
            errors.startDate = "Start date is required";
        }

        if (!endDate) {
            errors.endDate = "End date is required";
        } else if (startDate && new Date(endDate) < new Date(startDate)) {
            errors.endDate = "End date must be after start date";
        }

        return errors;
    };

    const handleBack = () => {
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

    const handleSubmit = async () => {
        setSubmitted(true);

        const validationErrors = validate({ name, startDate, endDate });

        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            showToast({
                title: "Validation Error",
                description: "Please fix the errors",
                icon: <XCircle className="w-4 h-4" />,
                type: "error",
            });
            return;
        }

        setLoading(true);

        try {
            if (isEdit) {
                console.log("Edit sprint");
            } else {
                console.log("Create sprint");
            }

            showToast({
                title: isEdit ? "Sprint Updated" : "Sprint Created",
                description: isEdit ? "Sprint Updated successfully" : "Sprint Created successfully",
                icon: <CircleCheckBig className="w-4 h-4" />,
                type: "success",
            });

            closeModal?.();

        } catch (err) {
            showToast({
                title: "Something went wrong",
                description: err?.message || "Please try again",
                icon: <XCircle className="w-4 h-4" />,
                type: "error",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-4">

            <button
                onClick={handleBack}
                className="flex items-center gap-1 text-field-label text-text-hint hover:text-text-primary cursor-pointer mb-7"
            >
                <ChevronLeft className="w-4 h-4" />
                <p>Back</p>
            </button>

            <div>
                <Input
                    label="Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Sprint name"
                    className="!bg-info-bg"
                    error={errors.name}
                />
            </div>

            <div>
                <Input
                    label="Start Date"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    min={new Date().toISOString().split("T")[0]}
                    className={`!bg-info-bg ${startDate ? "text-text-filled" : "text-text-placeholder"}`}
                    error={errors.startDate}
                />
            </div>

            <div>
                <Input
                    label="End Date"
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    min={startDate || new Date().toISOString().split("T")[0]}
                    className={`!bg-info-bg ${endDate ? "text-text-filled" : "text-text-placeholder"}`}
                    error={errors.endDate}
                />
            </div>
            <Button
                type="button"
                size="lg"
                onClick={handleSubmit}
                loading={loading}
                className="w-full mt-2 !rounded-xl bg-accent-blue text-white font-poppins text-[15px] font-medium cursor-pointer"
            >
                {loading
                    ? isEdit ? "Updating…" : "Adding…"
                    : isEdit ? "Edit Sprint" : "Add Sprint"
                }
            </Button>
        </div>
    );
};

export default SprintFormContent;