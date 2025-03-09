export default function Loading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center">
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full opacity-20 animate-pulse"></div>
        <div className="w-32 h-32 border-4 border-purple-400/30 border-t-purple-400 rounded-full animate-spin"></div>
      </div>
    </div>
  );
} 