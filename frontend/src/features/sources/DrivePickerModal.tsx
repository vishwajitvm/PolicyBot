import { useState } from "react";
import { sendPickerSelection } from "../../api/googleDrive.api";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Modal } from "../../components/ui/Modal";

export function DrivePickerModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [name, setName] = useState("Policy folder");
  const [id, setId] = useState("");

  const extractDriveId = (input: string) => {
    const match = input.match(/[-\w]{25,}/);
    return match ? match[0] : input;
  };

  return (
    <Modal open={open} onClose={onClose}>
      <h3 className="mb-3 font-semibold">Google Picker Selection</h3>
      <div className="space-y-3">
        <Input value={id} onChange={(event) => setId(event.target.value)} placeholder="Drive file or folder URL or ID" />
        <Input value={name} onChange={(event) => setName(event.target.value)} placeholder="Display name" />
        <Button onClick={async () => { await sendPickerSelection([{ id: extractDriveId(id), name, type: "folder" }]); onClose(); }} disabled={!id}>Send Selection</Button>
      </div>
    </Modal>
  );
}
