import { FormEvent, useState } from "react";
import { Send } from "lucide-react";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";

export function ChatInput({ onAsk, pending }: { onAsk: (question: string) => void; pending: boolean }) {
  const [question, setQuestion] = useState("");
  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (question.trim()) onAsk(question.trim());
  };
  return (
    <form onSubmit={submit} className="flex gap-3">
      <Input value={question} onChange={(event) => setQuestion(event.target.value)} placeholder="Ask across indexed policy documents..." />
      <Button disabled={pending || !question.trim()}><Send size={16} />Ask</Button>
    </form>
  );
}
