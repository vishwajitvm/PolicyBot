import { scorePercent } from "../../utils/score";
import { Progress } from "./Progress";

export function ScoreMeter({ label, value }: { label: string; value?: number }) {
  const percent = scorePercent(value);
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted">{label}</span>
        <strong className="text-text">{percent}%</strong>
      </div>
      <Progress value={percent} />
    </div>
  );
}
