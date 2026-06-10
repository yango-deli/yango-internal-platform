"use client";

import { useI18n } from "@/components/providers/i18n-provider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RECRUITMENT_STAGES } from "@/types/recruitment";

export function StageSelector({
  value,
  onChange,
  disabled,
}: {
  value: string;
  onChange: (stage: string) => void;
  disabled?: boolean;
}) {
  const { t } = useI18n();

  return (
    <Select value={value} onValueChange={onChange} disabled={disabled}>
      <SelectTrigger>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {RECRUITMENT_STAGES.map((stage) => (
          <SelectItem key={stage} value={stage}>
            {t(`stages.${stage}`)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
