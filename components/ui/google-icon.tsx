"use client";

import type { IconType } from "react-icons";
import {
  MdAutoAwesome,
  MdCheckCircle,
  MdCode,
  MdFlare,
  MdGavel,
  MdLightbulb,
  MdMenuBook,
  MdPolicy,
  MdRoute,
  MdSchool,
  MdScience,
  MdVerified,
  MdWarning,
  MdWorkspacePremium,

  // NEW ICONS
  MdUploadFile,
  MdRefresh,
  MdPlayArrow,
  MdInsertDriveFile,
  MdAnalytics,
  MdSecurity,
  MdBugReport,
  MdSpeed,
  MdShield,
  MdCloudUpload,
  MdOpenInNew,
  MdAccountTree,
  MdApi,
  MdContentCopy,
} from "react-icons/md";

import { cn } from "@/lib/utils";

type GoogleIconProps = {
  name: string;
  className?: string;
};

const iconMap: Record<string, IconType> = {
  // Existing
  school: MdSchool,
  science: MdScience,
  lightbulb: MdLightbulb,
  policy: MdPolicy,
  gavel: MdGavel,
  lab_profile: MdFlare,
  deployed_code: MdCode,
  workspace_premium: MdWorkspacePremium,
  awareness: MdLightbulb,
  route: MdRoute,
  warning: MdWarning,
  verified: MdVerified,
  menu_book: MdMenuBook,
  check_circle: MdCheckCircle,

  // 🔥 NEW (IMPORTANT)
  upload: MdUploadFile,
  cloud_upload: MdCloudUpload,
  reset: MdRefresh,
  scan: MdPlayArrow,
  file: MdInsertDriveFile,
  analytics: MdAnalytics,
  security: MdSecurity,
  malware: MdBugReport,
  speed: MdSpeed,
  open_in_new: MdOpenInNew,
  shield: MdShield,

  // ADD THESE
  book: MdMenuBook,
  architecture: MdAccountTree,
  setup: MdPlayArrow,
  api: MdApi,
  flow: MdRoute,
  copy: MdContentCopy,
};

export function GoogleIcon({ name, className }: GoogleIconProps) {
  const Icon = iconMap[name] ?? MdAutoAwesome;

  return <Icon aria-hidden className={cn("size-5 shrink-0", className)} />;
}
