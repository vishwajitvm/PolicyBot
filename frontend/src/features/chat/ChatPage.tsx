import { useEffect, useMemo, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Activity,
  Bot,
  MessageSquare,
  PanelLeftClose,
  PanelLeftOpen,
  Pencil,
  Plus,
  Trash2,
  User,
} from "lucide-react";
import { formatDate, formatTime } from "../../utils/formatters";

import {
  createChatSession,
  deleteChatSession,
  getChatSession,
  getChatSessions,
  getMessageTraces,
  sendMessage,
  updateChatSession,
} from "../../api/chat.api";
import { FreshnessDecisionCard } from "../../components/rag/FreshnessDecisionCard";
import { RetrievedChunkCard } from "../../components/rag/RetrievedChunkCard";
import { ScoreBreakdown } from "../../components/rag/ScoreBreakdown";
import { TraceTimeline } from "../../components/rag/TraceTimeline";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { Input } from "../../components/ui/Input";
import { Modal } from "../../components/ui/Modal";
import { Spinner } from "../../components/ui/Spinner";
import { PageShell } from "../../components/layout/PageShell";
import { ChatInput } from "./ChatInput";

type ChatSession = {
  id: string;
  title: string;
  updated_at?: string;
  created_at?: string;
  messages?: ChatMessage[];
};

type ChatMessage = {
  id: string;
  role: "user" | "assistant" | string;
  content?: string;
  question?: string;
  answer?: string;
  trace_id?: string | null;
  created_at?: string;
};

type ApiResponse<T> = T | { data: T };

function unwrapApiData<T>(response: ApiResponse<T> | undefined | null): T | undefined {
  if (!response) return undefined;
  if (typeof response === "object" && "data" in response) {
    return response.data as T;
  }
  return response as T;
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return "Something went wrong";
}



function getMessageText(message: ChatMessage): string {
  return message.content || message.answer || message.question || "";
}

export function ChatPageFeature() {
  const queryClient = useQueryClient();

  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const [openRenameModal, setOpenRenameModal] = useState(false);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [openTraceModal, setOpenTraceModal] = useState(false);
  const [traceModalMessageId, setTraceModalMessageId] = useState<string | null>(null);
  const [renamingSessionId, setRenamingSessionId] = useState<string | null>(null);
  const [deletingSessionId, setDeletingSessionId] = useState<string | null>(null);
  const [renameTitle, setRenameTitle] = useState("");

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const sessionsQuery = useQuery({
    queryKey: ["chat-sessions"],
    queryFn: getChatSessions,
  });

  const sessions = useMemo(() => {
    return unwrapApiData<ChatSession[]>(sessionsQuery.data) || [];
  }, [sessionsQuery.data]);

  const currentSessionQuery = useQuery({
    queryKey: ["chat-session", currentSessionId],
    queryFn: () => getChatSession(currentSessionId as string),
    enabled: Boolean(currentSessionId),
  });

  const currentSession = unwrapApiData<ChatSession>(currentSessionQuery.data);

  const traceQuery = useQuery({
    queryKey: ["message-traces", traceModalMessageId],
    queryFn: () => getMessageTraces(traceModalMessageId as string),
    enabled: Boolean(traceModalMessageId && openTraceModal),
  });

  const traceData = unwrapApiData<any>(traceQuery.data);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [currentSession?.messages?.length]);

  const createSessionMutation = useMutation({
    mutationFn: createChatSession,
    onError: (error) => {
      console.error("Failed to create session", error);
    },
  });

  const updateSessionMutation = useMutation({
    mutationFn: ({ sessionId, data }: { sessionId: string; data: { title: string } }) =>
      updateChatSession(sessionId, data),
    onSuccess: async (_response, variables) => {
      await queryClient.invalidateQueries({ queryKey: ["chat-sessions"] });
      await queryClient.invalidateQueries({ queryKey: ["chat-session", variables.sessionId] });
      setOpenRenameModal(false);
      setRenamingSessionId(null);
      setRenameTitle("");
    },
    onError: (error) => {
      console.error("Failed to update session", error);
    },
  });

  const deleteSessionMutation = useMutation({
    mutationFn: deleteChatSession,
    onSuccess: async (_response, deletedSessionId) => {
      await queryClient.invalidateQueries({ queryKey: ["chat-sessions"] });

      if (currentSessionId === deletedSessionId) {
        setCurrentSessionId(null);
      }

      setOpenDeleteModal(false);
      setDeletingSessionId(null);
    },
    onError: (error) => {
      console.error("Failed to delete session", error);
    },
  });

  const sendMessageMutation = useMutation({
    mutationFn: ({ sessionId, data }: { sessionId: string; data: { question: string } }) =>
      sendMessage(sessionId, data),
    onSuccess: async (_response, variables) => {
      await queryClient.invalidateQueries({ queryKey: ["chat-session", variables.sessionId] });
      await queryClient.invalidateQueries({ queryKey: ["chat-sessions"] });
    },
    onError: (error) => {
      console.error("Failed to send message", error);
    },
  });

  const handleNewChat = () => {
    createSessionMutation.mutate(
      { title: "New Chat" },
      {
        onSuccess: async (response) => {
          const session = unwrapApiData<ChatSession>(response);
          await queryClient.invalidateQueries({ queryKey: ["chat-sessions"] });

          if (session?.id) {
            setCurrentSessionId(session.id);
          }
        },
      },
    );
  };

  const handleSelectSession = (sessionId: string) => {
    setCurrentSessionId(sessionId);
  };

  const handleRenameSession = (sessionId: string, title: string) => {
    setRenamingSessionId(sessionId);
    setRenameTitle(title || "");
    setOpenRenameModal(true);
  };

  const handleDeleteSession = (sessionId: string) => {
    setDeletingSessionId(sessionId);
    setOpenDeleteModal(true);
  };

  const handleConfirmRename = () => {
    const trimmedTitle = renameTitle.trim();

    if (!renamingSessionId || !trimmedTitle) return;

    updateSessionMutation.mutate({
      sessionId: renamingSessionId,
      data: { title: trimmedTitle },
    });
  };

  const handleConfirmDelete = () => {
    if (!deletingSessionId) return;
    deleteSessionMutation.mutate(deletingSessionId);
  };

  const handleSendMessage = (question: string) => {
    const trimmedQuestion = question.trim();
    if (!trimmedQuestion) return;

    if (!currentSessionId) {
      const title =
        trimmedQuestion.length > 50 ? `${trimmedQuestion.substring(0, 50)}...` : trimmedQuestion;

      createSessionMutation.mutate(
        { title },
        {
          onSuccess: async (response) => {
            const session = unwrapApiData<ChatSession>(response);
            await queryClient.invalidateQueries({ queryKey: ["chat-sessions"] });

            if (!session?.id) return;

            setCurrentSessionId(session.id);
            sendMessageMutation.mutate({
              sessionId: session.id,
              data: { question: trimmedQuestion, content: trimmedQuestion },
            });
          },
        },
      );

      return;
    }

    sendMessageMutation.mutate({
      sessionId: currentSessionId,
      data: { question: trimmedQuestion, content: trimmedQuestion },
    });
  };

  const handleViewTrace = (messageId: string) => {
    setTraceModalMessageId(messageId);
    setOpenTraceModal(true);
  };

  const handleCloseTraceModal = () => {
    setOpenTraceModal(false);
    setTraceModalMessageId(null);
  };

  const sortedSessions = useMemo(() => {
    return [...sessions].sort((a, b) => {
      const dateA = new Date(a.updated_at || a.created_at || 0).getTime();
      const dateB = new Date(b.updated_at || b.created_at || 0).getTime();
      return dateB - dateA; // Newest on top
    });
  }, [sessions]);

  return (
    <main className="flex-1 flex flex-col h-full relative overflow-hidden bg-[#0f111a] min-w-0">
      {/* Abstract background elements */}
      <div className="absolute top-0 left-0 right-0 h-[500px] bg-gradient-to-b from-indigo-500/10 via-purple-500/5 to-transparent pointer-events-none opacity-50"></div>
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-500/10 blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[30%] rounded-full bg-purple-500/10 blur-[100px] pointer-events-none"></div>

      {/* Main chat column */}
      <div className="relative flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        <header className="flex shrink-0 items-center justify-between gap-3 border-b border-white/5 bg-background/50 backdrop-blur-xl px-6 py-4 relative z-30">
          <div className="flex items-center gap-4">
            <div className="relative group">
              <select
                value={currentSessionId || ""}
                onChange={(e) => handleSelectSession(e.target.value)}
                className="appearance-none bg-white/5 border border-white/10 text-white rounded-lg px-4 py-2 pr-10 hover:bg-white/10 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer min-w-[280px]"
              >
                <option value="" disabled className="bg-gray-900 text-gray-500">Select Chat History...</option>
                {sortedSessions.map((session) => (
                  <option key={session.id} value={session.id} className="bg-gray-900 text-white">
                    {session.title || "Untitled Chat"} - {formatDate(session.updated_at || session.created_at)}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-white/50">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
              </div>
            </div>
            <Button
              onClick={handleNewChat}
              disabled={createSessionMutation.isPending}
              className="bg-indigo-600 hover:bg-indigo-700 text-white border-0 shadow-lg shadow-indigo-500/20 transition-all active:scale-95"
            >
              {createSessionMutation.isPending ? <Spinner className="mr-2 h-4 w-4" /> : <Plus className="mr-2 h-4 w-4" />}
              New Chat
            </Button>
          </div>
          
          {currentSessionId && currentSession && (
             <div className="flex items-center gap-2">
               <Button variant="ghost" size="icon" onClick={() => handleRenameSession(currentSessionId, currentSession.title)} className="hover:bg-white/10">
                 <Pencil className="h-4 w-4 text-white/70" />
               </Button>
               <Button variant="ghost" size="icon" onClick={() => handleDeleteSession(currentSessionId)} className="hover:bg-red-500/20">
                 <Trash2 className="h-4 w-4 text-red-400" />
               </Button>
             </div>
          )}
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto z-10 scroll-smooth pb-4">
          <div className="mx-auto max-w-4xl space-y-8 px-4 pt-8 pb-4">
            {currentSessionId ? (
               currentSessionQuery.isLoading ? (
                  <div className="py-12 text-center"><Spinner className="mx-auto" /></div>
               ) : currentSessionQuery.error ? (
                  <Card className="border-red-500 p-4 text-center text-red-200">{getErrorMessage(currentSessionQuery.error)}</Card>
               ) : currentSession?.messages?.length ? (
                  <>
                    {currentSession.messages.map((message, idx) => {
                      const isUser = message.role === "user";
                      const messageText = getMessageText(message);

                      if (isUser) {
                        return (
                          <div key={message.id} className="flex justify-end transition-all duration-300">
                            <div className="max-w-[85%] rounded-3xl rounded-tr-sm bg-[#7c3aed] px-6 py-4 text-white shadow-lg">
                              <p className="whitespace-pre-wrap break-words text-sm leading-relaxed">{messageText}</p>
                              {message.created_at && (
                                <p className="mt-2 text-right text-[10px] text-white/60">{formatTime(message.created_at)}</p>
                              )}
                            </div>
                          </div>
                        );
                      }

                      return (
                        <div key={message.id} className="flex items-start gap-4 transition-all duration-300">
                          <div className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#1c1f2e] border border-white/5 shadow-inner">
                            <Bot className="h-5 w-5 text-indigo-400" />
                          </div>
                          <div className="min-w-0 flex-1 max-w-[90%]">
                            <div className="rounded-2xl rounded-tl-sm bg-[#1c1f2e] border-l-4 border-l-[#3bd59b] px-6 py-4 text-gray-200 shadow-md">
                              <p className="whitespace-pre-wrap break-words text-sm leading-relaxed">{messageText}</p>
                              <div className="mt-3 flex items-center gap-3 text-[11px] text-muted">
                                {message.created_at && <span>{formatTime(message.created_at)}</span>}
                                {message.trace_id && (
                                  <button type="button" onClick={() => handleViewTrace(message.id)} className="inline-flex items-center gap-1 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3 py-1 text-indigo-300 transition-colors hover:bg-indigo-500/30">
                                    <Activity className="h-3 w-3" /> View trace
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    <div ref={messagesEndRef} />
                  </>
               ) : (
                  <div className="flex flex-col items-center gap-3 py-24 text-center text-muted">
                    <div className="p-4 rounded-full bg-white/5"><MessageSquare className="h-8 w-8 text-indigo-400" /></div>
                    <h3 className="text-xl font-medium text-white/80">No messages yet</h3>
                    <p className="text-sm">Ask a question below to get started.</p>
                  </div>
               )
            ) : (
               <div className="flex flex-1 flex-col items-center justify-center px-4 py-24 text-center">
                  <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-indigo-500/10 border border-indigo-500/30">
                    <MessageSquare className="h-10 w-10 text-indigo-400" />
                  </div>
                  <h2 className="mb-3 text-4xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400">Welcome to PolicyBot</h2>
                  <p className="mb-8 max-w-xl text-lg text-muted">
                    Start a new conversation or select your chat history from the dropdown above.
                  </p>
                  <Button onClick={handleNewChat} disabled={createSessionMutation.isPending} className="bg-indigo-600 hover:bg-indigo-700 px-8 py-6 text-lg rounded-full shadow-xl shadow-indigo-500/20 transition-all hover:scale-105 active:scale-95">
                    {createSessionMutation.isPending ? <Spinner className="mr-2 h-5 w-5" /> : <Plus className="mr-2 h-5 w-5" />}
                    Start a New Chat
                  </Button>
               </div>
            )}

            {sendMessageMutation.isPending && (
              <div className="flex items-start gap-4 opacity-70">
                <div className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/5 border border-white/10">
                  <Bot className="h-5 w-5 text-indigo-400" />
                </div>
                <div className="rounded-3xl rounded-tl-sm bg-white/5 backdrop-blur-sm border border-white/10 px-6 py-4 flex items-center gap-3 text-sm text-muted">
                  <Spinner className="h-4 w-4 text-indigo-400" />
                  Thinking...
                </div>
              </div>
            )}
          </div>
        </div>

        {currentSessionId && (
          <div className="shrink-0 pt-2 pb-6 px-4 z-20">
            <ChatInput onAsk={handleSendMessage} pending={sendMessageMutation.isPending} />
          </div>
        )}
      </div>

      {/* Rename modal */}
      <Modal open={openRenameModal} onClose={() => setOpenRenameModal(false)} className="w-full max-w-sm">
        <div className="px-6 py-4 pt-8">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">Rename Chat</h3>
          </div>
          <Input
            value={renameTitle}
            onChange={(event) => setRenameTitle(event.target.value)}
            placeholder="Enter new chat title"
            className="mb-6 bg-black/40 border-white/10 text-white"
            autoFocus
          />
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setOpenRenameModal(false)} className="border-white/10 hover:bg-white/5">
              Cancel
            </Button>
            <Button onClick={handleConfirmRename} disabled={updateSessionMutation.isPending || !renameTitle.trim()} className="bg-indigo-600 hover:bg-indigo-700 text-white">
              {updateSessionMutation.isPending ? <Spinner className="mr-2 h-4 w-4" /> : null}
              Rename
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete modal */}
      <Modal open={openDeleteModal} onClose={() => setOpenDeleteModal(false)} className="w-full max-w-sm">
        <div className="px-6 py-4 pt-8">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">Delete Chat</h3>
          </div>
          <p className="mb-6 text-sm text-gray-400">
            Are you sure you want to delete this chat? This action cannot be undone.
          </p>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setOpenDeleteModal(false)} className="border-white/10 hover:bg-white/5">
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleConfirmDelete} disabled={deleteSessionMutation.isPending} className="bg-red-600 hover:bg-red-700 text-white">
              {deleteSessionMutation.isPending ? <Spinner className="mr-2 h-4 w-4" /> : null}
              Delete
            </Button>
          </div>
        </div>
      </Modal>

      {/* Trace modal */}
      <Modal open={openTraceModal} onClose={handleCloseTraceModal} className="w-[95%] max-w-6xl h-[70vh] max-h-[70vh]">
        <div className="px-6 py-4 pt-8">
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Activity className="h-6 w-6 text-indigo-400" />
              <h3 className="text-xl font-bold text-white">Trace Details</h3>
            </div>
          </div>

          {traceQuery.isLoading ? (
            <div className="py-12 text-center">
              <Spinner className="mx-auto h-8 w-8 text-indigo-400" />
            </div>
          ) : traceQuery.error ? (
            <Card className="border-red-500/50 bg-red-500/10 p-6 text-red-200">{getErrorMessage(traceQuery.error)}</Card>
          ) : traceData ? (
            <div className="gap-8 space-y-8 pb-6">
              {/* Operational Trace Section */}
              <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-white">Operational Trace</h3>
                  <span className="rounded-full bg-indigo-500/20 px-3 py-1 text-xs font-medium text-indigo-300">
                    {traceData?.events?.length ?? 0} steps
                  </span>
                </div>
                <TraceTimeline events={traceData?.events || []} />
              </div>

              {/* Retrieved Chunks Section */}
              <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-white">Retrieved Chunks</h3>
                  <span className="rounded-full bg-purple-500/20 px-3 py-1 text-xs font-medium text-purple-300">
                    {traceData?.retrieved_chunks?.length ?? 0} chunks
                  </span>
                </div>
                {(traceData?.retrieved_chunks || []).length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-10 text-gray-500">
                    <p>No chunks were retrieved for this query.</p>
                  </div>
                ) : (
                  <div className="grid gap-4 md:grid-cols-2">
                    {(traceData?.retrieved_chunks || []).map((chunk: any, index: number) => (
                      <RetrievedChunkCard key={chunk?.id || index} chunk={chunk} />
                    ))}
                  </div>
                )}
              </div>

              {/* Decision and Scores Section */}
              <div className="grid gap-6 md:grid-cols-2">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
                  <FreshnessDecisionCard decision={traceData?.freshness_decision || {}} />
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
                  <ScoreBreakdown scores={traceData?.scores || {}} />
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-gray-500">
              <p>No trace data available</p>
            </div>
          )}
        </div>
      </Modal>
    </main>
  );
}

export default ChatPageFeature;