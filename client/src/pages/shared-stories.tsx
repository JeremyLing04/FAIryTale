import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";
import { type Story, type Character } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import LoadingAnimation from "@/components/loading-animation";
import {
  Heart,
  BookOpen,
  Star,
  ArrowLeft,
  Users,
  Sparkles,
  Trophy
} from "lucide-react";

export default function SharedStories() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: sharedStories, isLoading } = useQuery<Story[]>({
    queryKey: ["/api/stories/shared"],
  });

  // Cache characters as we load them
  const { data: charactersCache } = useQuery<Character[]>({
    queryKey: ["/api/characters"],
  });

  const likeMutation = useMutation({
    mutationFn: async (storyId: number) => {
      const response = await apiRequest("POST", `/api/stories/${storyId}/like`);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Story Liked!",
        description: "You liked this amazing story!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/stories/shared"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to like story. Please try again.",
        variant: "destructive",
      });
    },
  });

  const getCharacterForStory = (story: Story): Character | undefined => {
    return charactersCache?.find(char => char.id === story.characterId);
  };

  const handleLike = (storyId: number) => {
    likeMutation.mutate(storyId);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingAnimation message="Loading shared stories..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen py-20 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <Link href="/story-gallery">
            <Button
              variant="outline"
              className="mb-6 bg-white/10 border-white/20 text-white hover:bg-white/20"
            >
              <ArrowLeft className="mr-2 w-4 h-4" />
              Back to Gallery
            </Button>
          </Link>
          <h1 className="fredoka text-5xl md:text-6xl text-white mb-4 animate-bounce-slow">
            <Users className="inline mr-4 w-12 h-12" />
            Stories from Friends
          </h1>
          <p className="text-xl text-white/90 max-w-3xl mx-auto">
            Read amazing stories created by other children! Give them a ❤️ if you love them!
          </p>
        </div>

        {/* Stories Grid */}
        {sharedStories && sharedStories.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {sharedStories.map((story) => {
              const character = getCharacterForStory(story);
              const genreColors: Record<string, string> = {
                adventure: "bg-coral",
                fantasy: "bg-turquoise",
                mystery: "bg-lavender",
                friendship: "bg-warmyellow",
                "sci-fi": "bg-mint",
                magic: "bg-skyblue",
              };

              return (
                <Card
                  key={story.id}
                  className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-105"
                >
                  <CardHeader className="pb-4">
                    <div className="flex justify-between items-start mb-3">
                      <Badge className={`${genreColors[story.genre] || "bg-coral"} text-white text-xs px-3 py-1`}>
                        {story.genre}
                      </Badge>
                      <div className="flex items-center gap-2">
                        {story.likes > 0 && (
                          <div className="flex items-center text-coral">
                            <Trophy className="w-4 h-4 mr-1" />
                            <span className="text-sm font-semibold">{story.likes}</span>
                          </div>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleLike(story.id)}
                          disabled={likeMutation.isPending}
                          className="border-coral text-coral hover:bg-coral hover:text-white transition-colors"
                        >
                          <Heart className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    <CardTitle className="fredoka text-xl text-darkgray mb-2">
                      {story.title}
                    </CardTitle>
                    {story.authorName && (
                      <p className="text-sm text-darkgray/70 mb-2">
                        <Star className="inline w-3 h-3 mr-1" />
                        by {story.authorName}
                      </p>
                    )}
                  </CardHeader>

                  <CardContent className="pt-0">
                    {/* Character Info */}
                    {character && (
                      <div className="flex items-center gap-3 mb-4 p-3 bg-gradient-to-r from-turquoise/10 to-coral/10 rounded-xl">
                        {character.imageUrl && (
                          <img
                            src={character.imageUrl}
                            alt={character.name}
                            className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm"
                          />
                        )}
                        <div className="flex-1">
                          <p className="font-semibold text-darkgray text-sm">
                            {character.name}
                          </p>
                          <p className="text-xs text-darkgray/70 capitalize">
                            {character.type}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Story Stats */}
                    <div className="flex justify-between items-center mb-4">
                      <div className="flex items-center text-darkgray/70 text-sm">
                        <BookOpen className="w-4 h-4 mr-1" />
                        {story.totalChapters} chapters
                      </div>
                      <div className="flex items-center text-green-600 text-sm">
                        <Sparkles className="w-4 h-4 mr-1" />
                        Complete
                      </div>
                    </div>

                    {/* Story Image */}
                    {story.imageUrl && (
                      <img
                        src={story.imageUrl}
                        alt={story.title}
                        className="w-full h-32 object-cover rounded-xl mb-4"
                      />
                    )}

                    {/* Read Button */}
                    <Link href={`/story/${story.id}`}>
                      <Button className="w-full bg-coral hover:bg-[#ff5252] text-white rounded-xl fredoka">
                        <BookOpen className="mr-2 w-4 h-4" />
                        Read Story
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl">
            <CardContent className="p-12 text-center">
              <Users className="w-16 h-16 text-gray-400 mx-auto mb-6" />
              <h3 className="fredoka text-2xl text-darkgray mb-4">No Shared Stories Yet</h3>
              <p className="text-darkgray/70 mb-6">
                Be the first to share your completed story with friends!
              </p>
              <Link href="/story-gallery">
                <Button className="bg-coral hover:bg-[#ff5252] text-white px-6 py-3 rounded-full fredoka">
                  <BookOpen className="mr-2 w-5 h-5" />
                  Create a Story
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}