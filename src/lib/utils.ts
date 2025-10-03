import clsx from "clsx"; // ✅ default import
import { twMerge } from "tailwind-merge";

export function cn(...inputs: any[]) {
  return twMerge(clsx(...inputs));
}
