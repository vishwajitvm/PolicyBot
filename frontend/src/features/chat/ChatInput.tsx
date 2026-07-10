import { FormEvent, useState, useRef, useEffect } from "react";
import { Send } from "lucide-react";
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
      <div className="relative w-full group">
        {/* Subtle glow effect behind the input */}
        <div className="absolute -inset-0.5 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 opacity-20 blur group-hover:opacity-40 transition duration-500"></div>
        
        <input
          ref={inputRef}
          value={question}
          onChange={(event) => setQuestion(event.target.value)}
          placeholder="Ask anything about your policy documents..."
          className="relative w-full rounded-full border border-white/10 bg-black/40 px-6 py-4 pr-32 text-sm text-foreground shadow-xl outline-none backdrop-blur-md transition-all placeholder:text-muted focus:border-indigo-500/50 focus:bg-black/60 focus:ring-1 focus:ring-indigo-500/50"
          disabled={pending}
        />
        
        <div className="absolute right-2 top-1/2 -translate-y-1/2">
          <Button
            type="submit"
            disabled={pending || !question.trim()}
            className="rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 px-5 transition-transform hover:scale-105 active:scale-95 disabled:hover:scale-100"
          >
            {pending ? (
              <span className="flex items-center gap-2">Thinking...</span>
            ) : (
              <span className="flex items-center gap-2"><Send size={16} /> Ask</span>
            )}
          </Button>
        </div>
      </div>
    </form>
  );
}
