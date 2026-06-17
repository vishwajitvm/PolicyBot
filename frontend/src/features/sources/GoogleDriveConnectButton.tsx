import { Cloud } from "lucide-react";
import { Button } from "../../components/ui/Button";

export function GoogleDriveConnectButton({ onClick }: { onClick: () => void }) {
  return <Button onClick={onClick}><Cloud size={16} />Connect Google Drive</Button>;
}
