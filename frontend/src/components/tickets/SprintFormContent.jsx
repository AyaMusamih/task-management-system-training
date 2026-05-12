import { useState, useEffect } from "react";
import { ChevronLeft } from "lucide-react";
import SprintsModalContent from "./SprintsModalContent";
import Button from "../shared/Button";
import Input from "../shared/Input";
import { createSprint, updateSprint } from "../../services/sprints.service";
import { toastSuccess, toastError } from "../../utils/toastHelpers";

const SprintFormContent = ({ sprint, openModal, closeModal, onSuccess }) => {
    const isEdit = !!sprint;

    const [name, setName] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (sprint) {
            setName(sprint.name || "");
            setStartDate(
                sprint.startDate
                    ? new Date(sprint.startDate).toISOString().split("T")[0]
                    : ""
            );
            setEndDate(
                sprint.endDate
                    ? new Date(sprint.endDate).toISOString().split("T")[0]
                    : ""
            );
        }
    }, [sprint]);

    const validate = ({ name, startDate, endDate }) => {
        const errors = {};
        if (!name.trim()) {
            errors.name = "Name is required";
        } else if (name.trim().length < 4) {
            errors.name = "Name must be at least 4 characters";
        } else if (name.trim().length > 100) {
            errors.name = "Name must be at most 100 characters";
        }
        if (!startDate) {
            errors.startDate = "Start date is required";
        }
        if (!endDate) {
            errors.endDate = "End date is required";
        } else if (startDate && new Date(endDate) <= new Date(startDate)) {
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
        const validationErrors = validate({ name, startDate, endDate });
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            toastError("Please fix the errors before submitting.", "Validation Error");
            return;
        }

        setLoading(true);
        try {
            const payload = {
                name: name.trim(),
                startDate: new Date(`${startDate}T00:00:00.000Z`).toISOString(),
                endDate: new Date(`${endDate}T23:59:59.000Z`).toISOString(),
            };

            if (isEdit) {
                await updateSprint(sprint.id, payload);
            } else {
                await createSprint(payload);
            }

            toastSuccess(
                isEdit ? "Sprint Updated" : "Sprint Created",
                isEdit ? "Sprint updated successfully." : "Sprint created successfully."
            );

            onSuccess?.();
            handleBack();
        } catch (err) {
            toastError(err, "Something Went Wrong");
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
                    onChange={(e) => {
                        setName(e.target.value);
                        setErrors((prev) => ({ ...prev, name: undefined }));
                    }}
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
                    min={new Date().toLocaleDateString("en-CA")}
                    onChange={(e) => {
                        setStartDate(e.target.value);
                        setErrors((prev) => ({ ...prev, startDate: undefined }));
                    }}
                    className={`!bg-info-bg ${startDate ? "text-text-filled" : "text-text-placeholder"}`}
                    error={errors.startDate}
                />
            </div>

            <div>
                <Input
                    label="End Date"
                    type="date"
                    value={endDate}
                    onChange={(e) => {
                        setEndDate(e.target.value);
                        setErrors((prev) => ({ ...prev, endDate: undefined }));
                    }}
                    min={startDate || new Date().toLocaleDateString("en-CA")}
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