import ReportView from "../../components/report/ReportView";

const UserReports = () => {
  const header = (
    <div>
      <h1 className="font-inter font-medium text-[24px] text-text-primary" style={{ letterSpacing: "-0.45px" }}>Reports</h1>
      <p className="font-inter font-normal text-[16px] text-text-primary" style={{ letterSpacing: "0.5%" }}>
        Your personal ticket activity and progress.
      </p>
    </div>
  );

  return (
    <ReportView
      isAdmin={false}
      basePath="/user"
      header={header}
    />
  );
};

export default UserReports;