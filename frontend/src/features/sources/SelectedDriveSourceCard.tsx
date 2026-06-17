import { Card } from "../../components/ui/Card";

export function SelectedDriveSourceCard() {
  return (
    <Card>
      <h3 className="font-semibold">Selected Drive Items</h3>
      <p className="mt-2 text-sm text-muted">Google Picker is wired through the backend selection endpoint. Configure Google API keys to use the hosted picker flow.</p>
    </Card>
  );
}
