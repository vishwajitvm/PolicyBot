import { Navigate, createBrowserRouter } from "react-router-dom";
import { AppLayout } from "../layouts/AppLayout";
import { ChatPage } from "../pages/ChatPage";
import { DashboardPage } from "../pages/DashboardPage";
import { EvaluationPage } from "../pages/EvaluationPage";
import { IngestionPage } from "../pages/IngestionPage";
import { LogsPage } from "../pages/LogsPage";
import { SettingsPage } from "../pages/SettingsPage";
import { SourcesPage } from "../pages/SourcesPage";
import { TracePage } from "../pages/TracePage";
import { ModelManagerPage } from "../pages/ModelManagerPage";

import { WorkflowConfigPage } from "../pages/WorkflowConfigPage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <AppLayout />,
    children: [
      { index: true, element: <Navigate to="/dashboard" replace /> },
      { path: "dashboard", element: <DashboardPage /> },
      { path: "sources", element: <SourcesPage /> },
      { path: "ingestion", element: <IngestionPage /> },
      { path: "chat", element: <ChatPage /> },
      { path: "traces/:traceId", element: <TracePage /> },
      { path: "evaluation", element: <EvaluationPage /> },
      { path: "settings", element: <SettingsPage /> },
      { path: "logs", element: <LogsPage /> },
      { path: "models", element: <ModelManagerPage /> },
      { path: "workflow", element: <WorkflowConfigPage /> }
    ]
  }
]);
