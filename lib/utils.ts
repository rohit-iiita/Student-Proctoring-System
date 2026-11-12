import { TComplaintCategory } from "@/modules/complaints/types";

export { cn } from "cn";

export const formatComplaintCategory = (
  complaintCategory: TComplaintCategory,
) => {
  return complaintCategory.toUpperCase().split("_").join(" ");
};
