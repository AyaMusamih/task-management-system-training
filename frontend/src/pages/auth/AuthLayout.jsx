import AuthIllustration from "../../assets/images/AuthIllustration.png";

const AuthLayout = ({ children }) => {
    return (
        <div className="flex justify-center items-start xl:items-center bg-background p-4 page-canvas">

            <div className="max-w-5xl w-full flex flex-col md:flex-row gap-3.5 rounded-2xl overflow-hidden shadow-2xl">

                {/* Left — form */}
                <div className="flex-1 flex flex-col bg-card-left rounded-2xl shadow-lg p-6 md:p-10 ">

                    {/* Logo */}
                    <div className="flex items-center gap-2 mb-6 md:mb-8">
                        <div className="logo-icon bg-accent-blue rounded-lg" />
                        <span className="text-logo text-text-primary">Task Flow</span>
                    </div>

                    <div className="flex flex-col">
                        {children}
                    </div>

                </div>

                {/* Right — banner */}
                <div className="flex-1 hidden md:flex flex-col items-center justify-center bg-card-right p-8 md:p-10 gap-6 text-center shadow-lg">
                    <img
                        src={AuthIllustration}
                        alt="Banner"
                        className="w-full md:max-w-sm object-contain"
                    />

                    <div>
                        <h2 className="text-[22px] font-poppins font-medium text-text-primary">
                            Manage work. Ship faster.
                        </h2>
                        <p className="text-[14px] font-poppins font-normal text-text-secondary mt-1">
                            Track sprints, tickets & progress
                        </p>
                    </div>

                    <div className="flex items-center gap-1.5">
                        <div className="w-5 h-1.5 rounded-full bg-accent-blue" />
                        <div className="w-1.5 h-1.5 rounded-full bg-accent-blue opacity-66" />
                        <div className="w-1.5 h-1.5 rounded-full bg-accent-blue opacity-33" />
                    </div>
                </div>

            </div>
        </div>
    );
}
export default AuthLayout;