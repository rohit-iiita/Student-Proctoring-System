export function formatCategoryLabel(category?: string): string {
  if (!category) return "General";
  switch (category) {
    case "ragging_and_harassment":
      return "Ragging and Harassment";
    case "ta":
      return "TA";
    case "hostel":
      return "Hostel";
    case "mess_and_food":
      return "Mess and Food";
    case "discrimination_and_misconduct":
      return "Discrimination and Misconduct";
    default:
      return category
        .split("_")
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" ");
  }
}
