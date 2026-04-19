export default function LoadingSpinner({ message = "Loading" }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 p-6 bg-white/70 dark:bg-gray-900/70 rounded-xl text-center shadow-xl">
      <div className="h-10 w-10 border-4 border-blue-300 rounded-full border-t-blue-600 animate-spin" />
      <p className="text-sm text-gray-500 dark:text-gray-300">{message}...</p>
    </div>
  );
}