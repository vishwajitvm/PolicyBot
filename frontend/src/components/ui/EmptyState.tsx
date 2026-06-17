export function EmptyState({ title, body }: { title: string; body?: string }) {
  return (
    <div className="rounded-lg border border-dashed border-border p-8 text-center">
      <h3 className="font-semibold text-text">{title}</h3>
      {body ? <p className="mt-2 text-sm text-muted">{body}</p> : null}
    </div>
  );
}
