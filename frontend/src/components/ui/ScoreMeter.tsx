import { scorePercent } from "../../utils/score";
import { Progress } from "./Progress";

export function ScoreMeter({
  label,
  value,
  helpText
}: {
  label: string;
  value?: number;
  helpText?: string
}) {
  const percent = scorePercent(value);
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted" title={helpText || undefined}>
          {label}
        </span>
        <strong className="text-text">{percent}%</strong>
      </div>
      <Progress value={percent} />
    </div>
  );
}
