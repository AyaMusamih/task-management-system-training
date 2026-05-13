import ReportView from "../../components/report/ReportView";

const AdminReports = () => {
    const header = (
        <div>
            <h1
                className="font-inter font-medium text-[24px] text-text-primary"
                style={{ letterSpacing: "-0.45px" }}
            >
                Reports
            </h1>
            <p
                className="font-inter font-normal text-[15px] text-text-primary"
                style={{ letterSpacing: "0.5%" }}
            >
                Track team performance and ticket progress.
            </p>
        </div>
    );

    return (
        <ReportView
            isAdmin={true}
            basePath="/admin"
            header={header}
            onCreateTicket={() => {}}
        />
    );
};

export default AdminReports;