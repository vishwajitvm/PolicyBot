import { FormEvent, useState, useRef, useEffect } from "react";
import { Send, Paperclip, Play } from "lucide-react";
import { Button } from "../../components/ui/Button";

export function ChatInput({ onAsk, pending }: { onAsk: (question: string) => void; pending: boolean }) {
  const [question, setQuestion] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (question.trim() && !pending) {
      onAsk(question.trim());
      setQuestion(""); // Fix the bug: clear input after submitting
    }
  };
  
  useEffect(() => {
    if (!pending) {
      inputRef.current?.focus();
    }
  }, [pending]);

  return (
    <form onSubmit={submit} className="relative flex w-full max-w-4xl mx-auto items-center">
      <div className="relative w-full group flex items-center bg-panel border border-border rounded-2xl p-2">
        <button type="button" className="p-3 text-muted hover:text-text transition-colors">
          <Paperclip size={20} />
        </button>
        
        <input
          ref={inputRef}
          value={question}
          onChange={(event) => setQuestion(event.target.value)}
          placeholder="Ask anything about your policy documents..."
          className="flex-1 bg-transparent px-2 py-2 text-sm text-text placeholder:text-muted focus:outline-none"
          disabled={pending}
        />
        
        <Button
          type="submit"
          disabled={pending || !question.trim()}
          className="rounded-xl bg-primary hover:bg-primary/80 text-white font-semibold px-6 py-2 transition-transform hover:scale-105 active:scale-95 disabled:hover:scale-100 flex items-center gap-2"
        >
          {pending ? (
            <span>Thinking...</span>
          ) : (
            <>
              ASK <Play size={14} fill="currentColor" />
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
