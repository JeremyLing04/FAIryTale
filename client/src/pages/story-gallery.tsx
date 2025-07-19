import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "wouter";
import { type Story, type Character } from "@shared/schema";
import StoryCard from "@/components/story-card";
import CharacterCard from "@/components/character-card";
import LoadingAnimation from "@/components/loading-animation";
import { BookOpen, Users, Wand2, Plus, Trash2, Share2 } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function StoryGallery() {
  const [_, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const { data: stories, isLoading: storiesLoading } = useQuery<Story[]>({
    queryKey: ["/api/stories"],
  });

  const { data: characters, isLoading: charactersLoading } = useQuery<Character[]>({
    queryKey: ["/api/characters"],
  });

  const deleteStoryMutation = useMutation({
    mutationFn: async (storyId: number) => {
      const response = await apiRequest("DELETE", `/api/stories/${storyId}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/stories"] });
      toast({
        title: "Story Deleted",
        description: "Your story has been deleted successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete story. Please try again.",
        variant: "destructive",
      });
    },
  });

  const shareStoryMutation = useMutation({
    mutationFn: async (storyId: number) => {
      const response = await apiRequest("GET", `/api/stories/${storyId}/share`);
      return response.json();
    },
    onSuccess: (data) => {
      navigator.clipboard.writeText(data.shareUrl);
      toast({
        title: "Share Link Copied!",
        description: "The story share link has been copied to your clipboard.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to generate share link. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleCharacterSelect = (character: Character) => {
    // Navigate to character creator with the selected character to create a new story
    setLocation(`/character-creator?characterId=${character.id}&step=story`);
  };

  const handleDeleteStory = (story: Story) => {
    if (window.confirm(`Are you sure you want to delete "${story.title}"? This action cannot be undone.`)) {
      deleteStoryMutation.mutate(story.id);
    }
  };

  const handleShareStory = (story: Story) => {
    shareStoryMutation.mutate(story.id);
  };

  if (storiesLoading || charactersLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingAnimation message="Loading your magical collection..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen py-20 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="fredoka text-5xl md:text-6xl text-white mb-4 animate-bounce-slow">
            Your Story Gallery
          </h1>
          <p className="text-xl text-white/90 max-w-2xl mx-auto">
            Continue your adventures and meet your amazing characters!
          </p>
        </div>

        {/* Stories Section */}
        <section className="mb-16">
          <div className="flex items-center justify-between mb-8">
            <Link href="/my-stories">
              <h2 className="fredoka text-3xl text-white flex items-center hover:text-coral transition-colors cursor-pointer">
                <BookOpen className="mr-3 w-8 h-8" />
                My Stories
              </h2>
            </Link>
            <Link href="/character-creator">
              <Button className="bg-coral hover:bg-[#ff5252] text-white px-6 py-3 rounded-full fredoka">
                <Plus className="mr-2 w-5 h-5" />
                New Story
              </Button>
            </Link>
          </div>

          {stories && stories.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {stories.map((story) => (
                <div key={story.id} className="relative group">
                  <StoryCard story={story} />
                  <div className="absolute top-2 right-2 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      onClick={() => handleShareStory(story)}
                      variant="outline"
                      size="sm"
                      className="bg-turquoise/80 hover:bg-turquoise text-white border-turquoise p-2"
                      disabled={shareStoryMutation.isPending}
                    >
                      <Share2 className="w-4 h-4" />
                    </Button>
                    <Button
                      onClick={() => handleDeleteStory(story)}
                      variant="outline"
                      size="sm"
                      className="bg-red-500/80 hover:bg-red-500 text-white border-red-500 p-2"
                      disabled={deleteStoryMutation.isPending}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <Card className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl">
              <CardContent className="p-12 text-center">
                <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-6" />
                <h3 className="fredoka text-2xl text-darkgray mb-4">No Stories Yet</h3>
                <p className="text-gray-600 mb-6">
                  You haven't created any stories yet. Start your first adventure!
                </p>
                <Link href="/character-creator">
                  <Button className="bg-coral hover:bg-[#ff5252] text-white px-8 py-3 rounded-full fredoka">
                    <Wand2 className="mr-2 w-5 h-5" />
                    Create Your First Story
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </section>

        {/* Characters Section */}
        <section>
          <div className="flex items-center justify-between mb-8">
            <Link href="/my-characters">
              <h2 className="fredoka text-3xl text-white flex items-center hover:text-turquoise transition-colors cursor-pointer">
                <Users className="mr-3 w-8 h-8" />
                My Characters
              </h2>
            </Link>
            <Link href="/character-creator">
              <Button className="bg-turquoise hover:bg-[#26a69a] text-white px-6 py-3 rounded-full fredoka">
                <Plus className="mr-2 w-5 h-5" />
                New Character
              </Button>
            </Link>
          </div>

          {characters && characters.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {characters.map((character) => (
                <CharacterCard 
                  key={character.id} 
                  character={character} 
                  onSelect={handleCharacterSelect} 
                />
              ))}
            </div>
          ) : (
            <Card className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl">
              <CardContent className="p-12 text-center">
                <Users className="w-16 h-16 text-gray-400 mx-auto mb-6" />
                <h3 className="fredoka text-2xl text-darkgray mb-4">No Characters Yet</h3>
                <p className="text-gray-600 mb-6">
                  Create your first character and start building amazing stories!
                </p>
                <Link href="/character-creator">
                  <Button className="bg-turquoise hover:bg-[#26a69a] text-white px-8 py-3 rounded-full fredoka">
                    <Users className="mr-2 w-5 h-5" />
                    Create Your First Character
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </section>
      </div>
    </div>
  );
}
