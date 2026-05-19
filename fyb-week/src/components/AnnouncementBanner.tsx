"use client";

interface AnnouncementBannerProps {
  text: string;
}

export default function AnnouncementBanner({ text }: AnnouncementBannerProps) {
  if (!text) return null;
  return (
    <div className="w-full bg-[#4A0E1A] text-[#F5F0E8] text-center py-2 px-4 text-xs font-dm tracking-[1.5px] uppercase">
      {text}
    </div>
  );
}
