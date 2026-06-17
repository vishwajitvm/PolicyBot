import { PageShell } from "../components/layout/PageShell";
import { ChatPageFeature } from "../features/chat/ChatPage";

export function ChatPage() {
  return <PageShell title="Chat"><ChatPageFeature /></PageShell>;
}
