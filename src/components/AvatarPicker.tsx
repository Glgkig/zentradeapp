import { useState, useRef } from "react";
import { Camera, Upload, Check, X } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import avatar01 from "@/assets/avatars/avatar-01.png";
import avatar02 from "@/assets/avatars/avatar-02.png";
import avatar03 from "@/assets/avatars/avatar-03.png";
import avatar04 from "@/assets/avatars/avatar-04.png";
import avatar05 from "@/assets/avatars/avatar-05.png";
import avatar06 from "@/assets/avatars/avatar-06.png";
import avatar07 from "@/assets/avatars/avatar-07.png";
import avatar08 from "@/assets/avatars/avatar-08.png";
import avatar09 from "@/assets/avatars/avatar-09.png";
import avatar10 from "@/assets/avatars/avatar-10.png";
import avatar11 from "@/assets/avatars/avatar-11.png";
import avatar12 from "@/assets/avatars/avatar-12.png";
import avatar13 from "@/assets/avatars/avatar-13.png";
import avatar14 from "@/assets/avatars/avatar-14.png";
import avatar15 from "@/assets/avatars/avatar-15.png";
import avatar16 from "@/assets/avatars/avatar-16.png";

const PRESET_AVATARS = [
  { id: "bull", src: avatar01, label: "שור" },
  { id: "bear", src: avatar02, label: "דוב" },
  { id: "wolf", src: avatar03, label: "זאב" },
  { id: "eagle", src: avatar04, label: "נשר" },
  { id: "lion", src: avatar05, label: "אריה" },
  { id: "shark", src: avatar06, label: "כריש" },
  { id: "fox", src: avatar07, label: "שועל" },
  { id: "dragon", src: avatar08, label: "דרקון" },
  { id: "panther", src: avatar09, label: "פנתר" },
  { id: "hawk", src: avatar10, label: "בז" },
  { id: "cobra", src: avatar11, label: "קוברה" },
  { id: "phoenix", src: avatar12, label: "עוף חול" },
  { id: "owl", src: avatar13, label: "ינשוף" },
  { id: "rhino", src: avatar14, label: "קרנף" },
  { id: "tiger", src: avatar15, label: "טיגריס" },
  { id: "samurai", src: avatar16, label: "סמוראי" },
];

interface AvatarPickerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const AvatarPicker = ({ open, onOpenChange }: AvatarPickerProps) => {
  const { user, profile, updateProfile } = useAuth();
  const [saving, setSaving] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSelectPreset = async (avatarSrc: string) => {
    setSelectedPreset(avatarSrc);
    setSaving(true);
    const { error } = await updateProfile({ avatar_url: avatarSrc });
    setSaving(false);
    if (error) {
      toast.error("שגיאה בשמירת האווטאר");
    } else {
      toast.success("האווטאר עודכן בהצלחה ✓");
      onOpenChange(false);
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user?.id) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.error("הקובץ גדול מדי (מקסימום 2MB)");
      return;
    }

    setSaving(true);
    const ext = file.name.split(".").pop();
    const path = `${user.id}/avatar.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(path, file, { upsert: true });

    if (uploadError) {
      toast.error("שגיאה בהעלאת התמונה");
      setSaving(false);
      return;
    }

    const { data: urlData } = supabase.storage
      .from("avatars")
      .getPublicUrl(path);

    const avatarUrl = urlData.publicUrl + "?t=" + Date.now();
    const { error } = await updateProfile({ avatar_url: avatarUrl });
    setSaving(false);

    if (error) {
      toast.error("שגיאה בשמירת האווטאר");
    } else {
      toast.success("התמונה הועלתה בהצלחה ✓");
      onOpenChange(false);
    }
  };

  const currentAvatar = profile?.avatar_url;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px] bg-[#111116] border-white/[0.08] p-0 overflow-hidden">
        <DialogHeader className="px-5 pt-5 pb-0">
          <DialogTitle className="text-[15px] font-bold text-foreground text-right">
            בחר אווטאר
          </DialogTitle>
        </DialogHeader>

        <div className="px-5 pb-5 space-y-4">
          {/* Upload own photo */}
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={saving}
            className="w-full flex items-center justify-center gap-2.5 rounded-xl border border-dashed border-primary/20 bg-primary/[0.04] hover:bg-primary/[0.08] px-4 py-3.5 transition-all min-h-[48px] group"
          >
            <Upload className="h-4 w-4 text-primary/60 group-hover:text-primary transition-colors" />
            <span className="text-[12px] font-medium text-primary/60 group-hover:text-primary transition-colors">
              העלה תמונה מהגלריה
            </span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleUpload}
          />

          {/* Divider */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-white/[0.06]" />
            <span className="text-2xs text-muted-foreground/30 font-medium">או בחר אווטאר</span>
            <div className="flex-1 h-px bg-white/[0.06]" />
          </div>

          {/* Preset grid */}
          <div className="grid grid-cols-4 gap-2.5">
            {PRESET_AVATARS.map((av) => {
              const isSelected = currentAvatar === av.src;
              return (
                <button
                  key={av.id}
                  onClick={() => handleSelectPreset(av.src)}
                  disabled={saving}
                  className={`relative group flex flex-col items-center gap-1.5 rounded-xl p-2 transition-all duration-200 ${
                    isSelected
                      ? "bg-primary/10 border border-primary/25 ring-1 ring-primary/20"
                      : "bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.08] hover:border-primary/15"
                  }`}
                >
                  <img
                    src={av.src}
                    alt={av.label}
                    loading="lazy"
                    className="h-14 w-14 rounded-lg object-cover"
                  />
                  <span className="text-2xs text-muted-foreground/50 group-hover:text-foreground/70 transition-colors">
                    {av.label}
                  </span>
                  {isSelected && (
                    <div className="absolute top-1 left-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary">
                      <Check className="h-2.5 w-2.5 text-primary-foreground" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {saving && (
            <div className="flex items-center justify-center gap-2 py-2">
              <div className="h-3.5 w-3.5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
              <span className="text-2xs text-muted-foreground/40">שומר...</span>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AvatarPicker;

/* Helper: renders the avatar image or fallback letter */
export const UserAvatar = ({
  avatarUrl,
  userName,
  size = "sm",
  className = "",
}: {
  avatarUrl?: string | null;
  userName: string;
  size?: "xs" | "sm" | "md" | "lg";
  className?: string;
}) => {
  const sizes = {
    xs: "h-6 w-6",
    sm: "h-7 w-7",
    md: "h-9 w-9",
    lg: "h-16 w-16",
  };

  if (avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt={userName}
        className={`${sizes[size]} rounded-xl object-cover ${className}`}
      />
    );
  }

  return (
    <div className={`${sizes[size]} flex items-center justify-center rounded-xl bg-primary/10 text-2xs font-bold text-primary font-mono ${className}`}>
      {userName.charAt(0).toUpperCase() || "?"}
    </div>
  );
};
