import { PropsWithChildren } from "react";

export function PageShell({ title, children }: PropsWithChildren<{ title: string }>) {
  return (
    <main className="min-w-0 flex-1 overflow-auto p-4 lg:p-6">
      {/* <h2 className="mb-5 text-2xl font-bold text-text">{title}</h2> */}
      {children}
    </main>
  );
}
