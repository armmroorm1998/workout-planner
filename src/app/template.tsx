// Re-mounts on every navigation, so each page plays the entrance animation.
export default function Template({ children }: { children: React.ReactNode }) {
  return <div className="page-enter">{children}</div>;
}
