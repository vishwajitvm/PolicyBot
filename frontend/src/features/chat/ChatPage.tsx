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

function formatDate(value?: string): string {
  if (!value) return "";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  return date.toLocaleString();
}

function formatTime(value?: string): string {
  if (!value) return "";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
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

  const renderSessionItem = (session: ChatSession) => {
    const isActive = session.id === currentSessionId;

    return (
      <div
        key={session.id}
        role="button"
        tabIndex={0}
        onClick={() => handleSelectSession(session.id)}
        onKeyDown={(event) => {
          if (event.key === "Enter") handleSelectSession(session.id);
        }}
        className={`group flex items-center gap-2 rounded-lg border px-3 py-2.5 text-left transition-colors ${
          isActive
            ? "border-primary/30 bg-primary/10 text-primary"
            : "border-transparent hover:bg-accent/40"
        }`}
      >
        <MessageSquare className={`h-4 w-4 shrink-0 ${isActive ? "text-primary" : "text-muted"}`} />

        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium leading-tight">{session.title || "Untitled Chat"}</p>
          <p className="truncate text-xs text-muted">{formatDate(session.updated_at || session.created_at)}</p>
        </div>

        <div className="flex shrink-0 items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
          <Button
            variant="ghost"
            size="icon"
            onClick={(event) => {
              event.stopPropagation();
              handleRenameSession(session.id, session.title);
            }}
            aria-label="Rename chat"
          >
            <Pencil className="h-3.5 w-3.5" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={(event) => {
              event.stopPropagation();
              handleDeleteSession(session.id);
            }}
            aria-label="Delete chat"
          >
            <Trash2 className="h-3.5 w-3.5 text-red-400" />
          </Button>
        </div>
      </div>
    );
  };

  return (
    <PageShell title="">
      <div className="flex h-full min-h-0 overflow-hidden bg-background">
        {/* Sessions sidebar */}
        <aside
          className={`flex min-h-0 shrink-0 overflow-hidden border-r bg-background transition-all duration-200 ${
            sidebarCollapsed ? "w-0" : "w-72"
          }`}
        >
          <div className="flex h-full min-h-0 w-72 flex-col">
            <div className="flex shrink-0 items-center gap-2 border-b px-3 py-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSidebarCollapsed(true)}
                aria-label="Collapse sidebar"
                className="shrink-0"
              >
                <PanelLeftClose className="h-4 w-4" />
              </Button>

              <Button
                variant="outline"
                className="flex-1 justify-center"
                onClick={handleNewChat}
                disabled={createSessionMutation.isPending}
              >
                {createSessionMutation.isPending ? (
                  <Spinner className="mr-2 h-4 w-4" />
                ) : (
                  <Plus className="mr-2 h-4 w-4" />
                )}
                New Chat
              </Button>
            </div>

            {sessionsQuery.isLoading ? (
              <div className="flex flex-1 items-center justify-center">
                <Spinner className="mx-auto" />
              </div>
            ) : sessionsQuery.error ? (
              <Card className="m-3 border-red-500 p-3 text-sm text-red-200">
                {getErrorMessage(sessionsQuery.error)}
              </Card>
            ) : (
              <div className="min-h-0 flex-1 space-y-1 overflow-y-auto px-3 py-3">
                {sessions.length === 0 ? (
                  <div className="flex flex-col items-center gap-2 py-12 text-center text-muted">
                    <MessageSquare className="h-6 w-6" />
                    <p className="text-sm">No chats yet</p>
                  </div>
                ) : (
                  sessions.map(renderSessionItem)
                )}
              </div>
            )}
          </div>
        </aside>

        {/* Main chat column */}
        <div className="relative flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
          {sidebarCollapsed ? (
            <Button
              variant="outline"
              size="icon"
              onClick={() => setSidebarCollapsed(false)}
              aria-label="Expand sidebar"
              className="absolute left-3 top-3 z-10"
            >
              <PanelLeftOpen className="h-4 w-4" />
            </Button>
          ) : null}

          {currentSessionId ? (
            <>
              <header className="flex shrink-0 items-center gap-3 border-b bg-background px-4 py-3 pl-14 md:pl-4">
                {currentSession ? (
                  <>
                    <h3 className="min-w-0 flex-1 truncate font-semibold">
                      {currentSession.title || "Untitled Chat"}
                    </h3>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRenameSession(currentSessionId, currentSession.title)}
                      aria-label="Rename current chat"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </>
                ) : (
                  <h3 className="font-semibold text-muted">Loading chat...</h3>
                )}
              </header>

              <div className="min-h-0 flex-1 overflow-y-auto">
                <div className="mx-auto max-w-3xl space-y-6 px-4 py-6">
                  {currentSessionQuery.isLoading ? (
                    <div className="py-12 text-center">
                      <Spinner className="mx-auto" />
                    </div>
                  ) : currentSessionQuery.error ? (
                    <Card className="border-red-500 p-4 text-center text-red-200">
                      {getErrorMessage(currentSessionQuery.error)}
                    </Card>
                  ) : currentSession?.messages?.length ? (
                    <>
                      {currentSession.messages.map((message) => {
                        const isUser = message.role === "user";
                        const messageText = getMessageText(message);

                        if (isUser) {
                          return (
                            <div key={message.id} className="flex justify-end">
                              <div className="max-w-[80%] rounded-2xl bg-primary/15 px-4 py-2.5 text-foreground">
                                <p className="whitespace-pre-wrap break-words text-sm leading-relaxed">
                                  {messageText}
                                </p>
                                {message.created_at ? (
                                  <p className="mt-1 text-right text-[11px] text-muted">
                                    {formatTime(message.created_at)}
                                  </p>
                                ) : null}
                              </div>
                            </div>
                          );
                        }

                        return (
                          <div key={message.id} className="flex items-start gap-3">
                            <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-muted">
                              <Bot className="h-4 w-4 text-primary" />
                            </div>

                            <div className="min-w-0 flex-1">
                              <p className="whitespace-pre-wrap break-words text-sm leading-relaxed">
                                {messageText}
                              </p>

                              <div className="mt-2 flex items-center gap-3 text-[11px] text-muted">
                                {message.created_at ? <span>{formatTime(message.created_at)}</span> : null}

                                {message.trace_id ? (
                                  <button
                                    type="button"
                                    onClick={() => handleViewTrace(message.id)}
                                    className="inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-primary transition-colors hover:bg-primary/10"
                                  >
                                    <Activity className="h-3 w-3" />
                                    View trace
                                  </button>
                                ) : null}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                      <div ref={messagesEndRef} />
                    </>
                  ) : (
                    <div className="flex flex-col items-center gap-2 py-16 text-center text-muted">
                      <MessageSquare className="h-6 w-6" />
                      <p className="text-sm">No messages yet. Ask a question to get started.</p>
                    </div>
                  )}

                  {sendMessageMutation.isPending ? (
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-muted">
                        <Bot className="h-4 w-4 text-primary" />
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted">
                        <Spinner className="h-4 w-4" />
                        Thinking...
                      </div>
                    </div>
                  ) : null}
                </div>
              </div>

              <div className="shrink-0 border-t bg-background p-4">
                <div className="mx-auto max-w-3xl">
                  <ChatInput onAsk={handleSendMessage} disabled={sendMessageMutation.isPending} />
                </div>
              </div>
            </>
          ) : (
            <div className="flex flex-1 flex-col items-center justify-center px-4 py-12 text-center">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                <MessageSquare className="h-6 w-6 text-primary" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">Select a chat to start</h3>
              <p className="mb-6 max-w-xl text-muted">
                Start a new chat or select an existing one from the sidebar.
              </p>
              <Button variant="outline" onClick={handleNewChat} disabled={createSessionMutation.isPending}>
                {createSessionMutation.isPending ? (
                  <Spinner className="mr-2 h-4 w-4" />
                ) : (
                  <Plus className="mr-2 h-4 w-4" />
                )}
                New Chat
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Rename modal */}
      <Modal open={openRenameModal} onClose={setOpenRenameModal} className="w-96">
        <div className="px-6 py-4">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold">Rename Chat</h3>
            <Button variant="outline" onClick={setOpenRenameModal}>
              Close
            </Button>
          </div>
          <Input
            value={renameTitle}
            onChange={(event) => setRenameTitle(event.target.value)}
            placeholder="Enter new chat title"
            className="mb-4"
            autoFocus
          />
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setOpenRenameModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleConfirmRename} disabled={updateSessionMutation.isPending || !renameTitle.trim()}>
              {updateSessionMutation.isPending ? <Spinner className="mr-2 h-4 w-4" /> : null}
              Rename
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete modal */}
      <Modal open={openDeleteModal} onClose={setOpenDeleteModal} className="w-96">
        <div className="px-6 py-4">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold">Delete Chat</h3>
            <Button variant="outline" onClick={setOpenDeleteModal}>
              Close
            </Button>
          </div>
          <p className="mb-4 text-sm text-muted">
            Are you sure you want to delete this chat? This action cannot be undone.
          </p>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setOpenDeleteModal(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleConfirmDelete} disabled={deleteSessionMutation.isPending}>
              {deleteSessionMutation.isPending ? <Spinner className="mr-2 h-4 w-4" /> : null}
              Delete
            </Button>
          </div>
        </div>
      </Modal>

      {/* Trace modal */}
      <Modal open={openTraceModal} onClose={handleCloseTraceModal} className="w-[90%] max-w-[1200px]">
        <div className="px-6 py-4">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Activity className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-semibold">Trace Details</h3>
            </div>
            <Button variant="outline" onClick={handleCloseTraceModal}>
              Close
            </Button>
          </div>

          {traceQuery.isLoading ? (
            <div className="py-8 text-center">
              <Spinner className="mx-auto" />
            </div>
          ) : traceQuery.error ? (
            <Card className="border-red-500 p-4 text-red-200">{getErrorMessage(traceQuery.error)}</Card>
          ) : traceData ? (
            <div className="gap-6">
              {/* Operational Trace Section */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-text">Operational Trace</h3>
                  <span className="text-xs text-muted">
                    {traceData?.events?.length ?? 0} steps
                  </span>
                </div>
                <TraceTimeline events={traceData?.events || []} />
              </div>

              {/* Retrieved Chunks Section */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-text">Retrieved Chunks</h3>
                  <span className="text-xs text-muted">
                    {traceData?.retrieved_chunks?.length ?? 0} chunks
                  </span>
                </div>
                {(traceData?.retrieved_chunks || []).length === 0 ? (
                  <p className="text-center text-muted py-4">No chunks were retrieved for this query.</p>
                ) : (
                  <div className="grid gap-4 lg:grid-cols-2">
                    {(traceData?.retrieved_chunks || []).map((chunk: any, index: number) => (
                      <RetrievedChunkCard key={chunk?.id || index} chunk={chunk} />
                    ))}
                  </div>
                )}
              </div>

              {/* Decision and Scores Section */}
              <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
                <div className="space-y-4">
                  <FreshnessDecisionCard decision={traceData?.freshness_decision || {}} />
                </div>
                <div className="space-y-4">
                  <ScoreBreakdown scores={traceData?.scores || {}} />
                </div>
              </div>
            </div>
          ) : (
            <p className="py-8 text-center text-muted">No trace data available</p>
          )}
        </div>
      </Modal>
    </PageShell>
  );
}

export default ChatPageFeature;