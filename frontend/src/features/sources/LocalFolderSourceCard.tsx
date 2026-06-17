import { FormEvent, useState } from "react";
import { FolderPlus } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createLocalSource } from "../../api/sources.api";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { Input } from "../../components/ui/Input";

export function LocalFolderSourceCard() {
  const [folderPath, setFolderPath] = useState("");
  const queryClient = useQueryClient();
  const mutation = useMutation({ mutationFn: () => createLocalSource(folderPath), onSuccess: () => queryClient.invalidateQueries({ queryKey: ["sources"] }) });
  const submit = (event: FormEvent) => {
    event.preventDefault();
    mutation.mutate();
  };
  return (
    <Card>
      <h3 className="mb-3 font-semibold">Local Folder Source</h3>
      <form onSubmit={submit} className="flex flex-col gap-3 sm:flex-row">
        <Input value={folderPath} onChange={(event) => setFolderPath(event.target.value)} placeholder="C:\\policies or /data/policies" />
        <Button disabled={!folderPath || mutation.isPending}><FolderPlus size={16} />Add</Button>
      </form>
    </Card>
  );
}
