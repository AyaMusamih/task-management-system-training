const TicketIndicators = ({ permissions }) => {
    if (!permissions) return null;

    return (
        <div className="flex gap-2 text-sm">

            {permissions.assignedToMe && (
                <span className="px-2 py-1 bg-blue-100 text-blue-600 rounded">
                    Assigned to me
                </span>
            )}

            {permissions.canEdit && (
                <span className="px-2 py-1 bg-green-100 text-green-600 rounded">
                    Can Edit
                </span>
            )}

            {permissions.canUpdateStatus && (
                <span className="px-2 py-1 bg-yellow-100 text-yellow-600 rounded">
                    Can Update
                </span>
            )}

        </div>
    );
}

export default TicketIndicators;