import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { type Story } from "@shared/schema";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Share2, Users, Star, Heart } from "lucide-react";

interface StoryShareButtonProps {
  story: Story;
  disabled?: boolean;
}

export default function StoryShareButton({ story, disabled = false }: StoryShareButtonProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [authorName, setAuthorName] = useState(story.authorName || "");

  const shareStoryMutation = useMutation({
    mutationFn: async (data: { authorName: string }) => {
      const response = await apiRequest("PATCH", `/api/stories/${story.id}`, {
        isShared: true,
        authorName: data.authorName
      });
      return response.json();
    },
    onSuccess: () => {
      setIsOpen(false);
      toast({
        title: "Story Shared!",
        description: "Your amazing story is now shared with other children!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/stories"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stories/shared"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stories", story.id] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to share story. Please try again.",
        variant: "destructive",
      });
    },
  });

  const unshareStoryMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("PATCH", `/api/stories/${story.id}`, {
        isShared: false
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Story Unshared",
        description: "Your story is now private again.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/stories"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stories/shared"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stories", story.id] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to unshare story. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleShare = () => {
    if (!authorName.trim()) {
      toast({
        title: "Author Name Required",
        description: "Please enter your name to share your story.",
        variant: "destructive",
      });
      return;
    }
    shareStoryMutation.mutate({ authorName: authorName.trim() });
  };

  const handleUnshare = () => {
    unshareStoryMutation.mutate();
  };

  if (!story.isCompleted) {
    return (
      <Button
        disabled
        variant="outline"
        className="border-gray-300 text-gray-400 cursor-not-allowed"
      >
        <Share2 className="mr-2 w-4 h-4" />
        Complete Story to Share
      </Button>
    );
  }

  if (story.isShared) {
    return (
      <div className="flex items-center gap-3">
        <div className="flex items-center text-green-600 text-sm">
          <Users className="w-4 h-4 mr-1" />
          <span className="font-medium">Shared</span>
          {story.likes > 0 && (
            <div className="flex items-center ml-3 text-coral">
              <Heart className="w-4 h-4 mr-1" />
              <span className="font-semibold">{story.likes}</span>
            </div>
          )}
        </div>
        <Button
          onClick={handleUnshare}
          disabled={unshareStoryMutation.isPending}
          variant="outline"
          size="sm"
          className="border-coral text-coral hover:bg-coral hover:text-white"
        >
          Make Private
        </Button>
      </div>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          disabled={disabled}
          className="bg-turquoise hover:bg-[#26a69a] text-white"
        >
          <Share2 className="mr-2 w-4 h-4" />
          Share with Friends
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="fredoka text-2xl text-darkgray flex items-center">
            <Star className="mr-2 w-6 h-6 text-warmyellow" />
            Share Your Amazing Story!
          </DialogTitle>
          <DialogDescription className="text-darkgray/70">
            Let other children read and enjoy your completed story! They can give it a ❤️ if they love it.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="authorName" className="text-sm font-semibold text-darkgray">
              Your Name (this will show as the story author)
            </Label>
            <Input
              id="authorName"
              value={authorName}
              onChange={(e) => setAuthorName(e.target.value)}
              placeholder="Enter your name..."
              className="mt-2 rounded-xl border-coral/30 focus:border-coral"
            />
          </div>
          <div className="flex gap-3">
            <Button
              onClick={() => setIsOpen(false)}
              variant="outline"
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleShare}
              disabled={shareStoryMutation.isPending || !authorName.trim()}
              className="flex-1 bg-coral hover:bg-[#ff5252] text-white"
            >
              {shareStoryMutation.isPending ? "Sharing..." : "Share Story"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}