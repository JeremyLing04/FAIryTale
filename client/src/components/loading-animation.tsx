import { Loader2, Sparkles } from "lucide-react";

interface LoadingAnimationProps {
  message?: string;
}

export default function LoadingAnimation({ message = "Creating your magical story..." }: LoadingAnimationProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="relative">
        <Loader2 className="w-12 h-12 animate-spin text-coral" />
        <Sparkles className="w-6 h-6 text-warmyellow absolute top-0 right-0 animate-pulse-slow" />
      </div>
      <p className="mt-4 text-lg font-semibold text-darkgray fredoka">{message}</p>
      <div className="mt-2 flex space-x-1">
        <div className="w-2 h-2 bg-coral rounded-full animate-bounce"></div>
        <div className="w-2 h-2 bg-turquoise rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
        <div className="w-2 h-2 bg-warmyellow rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
      </div>
    </div>
  );
}
