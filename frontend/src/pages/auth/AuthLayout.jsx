import AuthIllustration from "../../assets/images/AuthIllustration.png";

export default function AuthLayout({ children }) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
            <div className="max-w-5xl w-full grid grid-cols-1 md:grid-cols-2 rounded-2xl overflow-hidden shadow-2xl">

                {/* Left — form */}
                <div className="bg-card-left flex flex-col w-full p-10">

                    {/* Logo */}
                    <div className="flex items-center gap-2 mb-8">
                        <div className="w-7 h-7 bg-accent-blue rounded-lg" />
                        <span className="text-logo text-text-primary">
                            Task Flow
                        </span>
                    </div>

                    {children}
                </div>

                {/* Right — banner */}
                <div className="hidden md:flex flex-col justify-end items-start bg-card-right p-10 gap-6">
                    <img
                        src={AuthIllustration}
                        alt="Banner"
                        className="w-full max-w-sm object-contain"
                    />
                    <div>
                        <h2 className="text-[22px] font-poppins font-medium text-text-primary">
                            Manage work. Ship faster.
                        </h2>
                        <p className="text-[14px] font-poppins font-normal text-text-secondary mt-1">
                            Track sprints, tickets & progress
                        </p>
                    </div>
                </div>

            </div>
        </div>
    );
}