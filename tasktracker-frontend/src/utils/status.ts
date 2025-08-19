// Utility to normalize status from backend (number | string → string)
export function mapStatus(status: number | string): string {
    if (typeof status === "string") return status;
    switch (status) {
        case 0:
            return "New";
        case 1:
            return "InProgress";
        case 2:
            return "Completed";
        default:
            return "Unknown";
    }
}
