export function Empty({ message = "Nothing here yet." }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-text-light">
      <div className="text-4xl mb-3">📭</div>
      <p className="text-sm font-medium">{message}</p>
    </div>
  );
}
