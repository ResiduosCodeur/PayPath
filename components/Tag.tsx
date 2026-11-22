export default function Tag({ children }: { children: React.ReactNode }) {
  return (
    <div className="inline-flex items-center gap-1.5 text-xs text-muted mb-3">
      <span className="w-1.5 h-1.5 rounded-full bg-accent" />
      {children}
    </div>
  );
}
