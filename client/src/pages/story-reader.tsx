import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { type Story, type Character, type StoryChapter } from "@shared/schema";
import StoryInterface from "@/components/story-interface";
import LoadingAnimation from "@/components/loading-animation";
import { ArrowLeft, BookOpen, Sparkles, CheckCircle } from "lucide-react";

export default function StoryReader() {
  const { id } = useParams() as { id: string };
  const [_, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isGenerating, setIsGenerating] = useState(false);

  const { data: story, isLoading: storyLoading } = useQuery<Story>({
    queryKey: ["/api/stories", parseInt(id)],
  });

  const { data: character, isLoading: characterLoading } = useQuery<Character>({
    queryKey: ["/api/characters", story?.characterId],
    enabled: !!story?.characterId,
  });

  const { data: currentChapter, isLoading: chapterLoading } = useQuery<StoryChapter>({
    queryKey: ["/api/stories", parseInt(id), "chapters", story?.currentChapter],
    enabled: !!story?.currentChapter,
  });

  const updateStoryMutation = useMutation({
    mutationFn: async (updates: Partial<Story>) => {
      const response = await apiRequest("PATCH", `/api/stories/${id}`, updates);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/stories", parseInt(id)] });
    },
  });

  const createChapterMutation = useMutation({
    mutationFn: async (chapter: Partial<StoryChapter>) => {
      const response = await apiRequest("POST", `/api/stories/${id}/chapters`, chapter);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/stories", parseInt(id)] });
      setIsGenerating(false);
    },
  });

  const generateChapterMutation = useMutation({
    mutationFn: async (request: any) => {
      const response = await apiRequest("POST", "/api/generate-chapter", request);
      return response.json();
    },
    onSuccess: (data) => {
      const nextChapter = (story?.currentChapter || 1) + 1;
      
      // Create the new chapter
      createChapterMutation.mutate({
        chapterNumber: nextChapter,
        content: data.content,
        imageUrl: data.imageUrl,
        choices: data.choices,
      });

      // Update story progress
      updateStoryMutation.mutate({
        currentChapter: nextChapter,
        isCompleted: nextChapter >= (story?.totalChapters || 5),
      });
    },
    onError: (error) => {
      setIsGenerating(false);
      toast({
        title: "Story Generation Failed",
        description: "Failed to generate the next chapter. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleChoiceSelect = async (choice: 'optionA' | 'optionB') => {
    if (!story || !character || !currentChapter) return;

    setIsGenerating(true);
    
    const choiceText = choice === 'optionA' 
      ? currentChapter.choices?.optionA.text 
      : currentChapter.choices?.optionB.text;

    const nextChapter = story.currentChapter + 1;

    try {
      await generateChapterMutation.mutateAsync({
        characterName: character.name,
        characterType: character.type,
        personality: character.personality,
        genre: story.genre,
        chapterNumber: nextChapter,
        previousChoice: choiceText,
        previousContent: currentChapter.content,
        characterImageUrl: character.imageUrl,
      });

      toast({
        title: "Chapter Generated!",
        description: `Chapter ${nextChapter} is ready to read!`,
      });
    } catch (error) {
      console.error('Error generating chapter:', error);
    }
  };

  const handleContinue = async () => {
    if (!story || !character || !currentChapter) return;

    setIsGenerating(true);
    
    const nextChapter = story.currentChapter + 1;

    try {
      await generateChapterMutation.mutateAsync({
        characterName: character.name,
        characterType: character.type,
        personality: character.personality,
        genre: story.genre,
        chapterNumber: nextChapter,
        previousContent: currentChapter.content,
        characterImageUrl: character.imageUrl,
      });

      toast({
        title: "Chapter Generated!",
        description: `Chapter ${nextChapter} is ready to read!`,
      });
    } catch (error) {
      console.error('Error generating chapter:', error);
    }
  };

  const handleStartNewStory = () => {
    setLocation("/character-creator");
  };

  if (storyLoading || characterLoading || chapterLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingAnimation message="Loading your story..." />
      </div>
    );
  }

  if (!story || !character) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl">
          <CardContent className="p-12 text-center">
            <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-6" />
            <h3 className="fredoka text-2xl text-darkgray mb-4">Story Not Found</h3>
            <p className="text-gray-600 mb-6">
              The story you're looking for doesn't exist or has been removed.
            </p>
            <Button
              onClick={() => setLocation("/gallery")}
              className="bg-coral hover:bg-[#ff5252] text-white px-8 py-3 rounded-full fredoka"
            >
              <ArrowLeft className="mr-2 w-5 h-5" />
              Back to Gallery
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Story completed state
  if (story.isCompleted) {
    return (
      <div className="min-h-screen py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <Card className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl">
            <CardContent className="p-12 text-center">
              <CheckCircle className="w-20 h-20 text-mint mx-auto mb-6" />
              <h1 className="fredoka text-4xl text-darkgray mb-4">
                🎉 Story Complete! 🎉
              </h1>
              <h2 className="fredoka text-2xl text-coral mb-6">{story.title}</h2>
              <p className="text-xl text-gray-600 mb-8">
                Congratulations! You've completed this amazing adventure with {character.name}!
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  onClick={() => setLocation("/gallery")}
                  className="bg-turquoise hover:bg-[#26a69a] text-white px-8 py-3 rounded-full fredoka"
                >
                  <BookOpen className="mr-2 w-5 h-5" />
                  View All Stories
                </Button>
                <Button
                  onClick={handleStartNewStory}
                  className="bg-coral hover:bg-[#ff5252] text-white px-8 py-3 rounded-full fredoka"
                >
                  <Sparkles className="mr-2 w-5 h-5" />
                  Start New Adventure
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Need to generate first chapter
  if (!currentChapter) {
    return (
      <div className="min-h-screen py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <Card className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl">
            <CardContent className="p-12 text-center">
              <div className="mb-8">
                <h1 className="fredoka text-4xl text-darkgray mb-4">{story.title}</h1>
                <Badge className="bg-coral text-white px-4 py-2 text-lg font-semibold capitalize">
                  {story.genre} Adventure
                </Badge>
              </div>
              <div className="mb-8">
                <h3 className="fredoka text-2xl text-darkgray mb-4">Starring: {character.name}</h3>
                <p className="text-gray-600 mb-6">
                  A {character.personality} {character.type} ready for adventure!
                </p>
              </div>
              <Button
                onClick={async () => {
                  setIsGenerating(true);
                  await generateChapterMutation.mutateAsync({
                    characterName: character.name,
                    characterType: character.type,
                    personality: character.personality,
                    genre: story.genre,
                    chapterNumber: 1,
                    characterImageUrl: character.imageUrl,
                  });
                }}
                disabled={isGenerating}
                className="bg-coral hover:bg-[#ff5252] text-white px-12 py-4 rounded-full text-xl fredoka shadow-lg"
              >
                {isGenerating ? (
                  <>
                    <Sparkles className="mr-3 w-6 h-6 animate-spin" />
                    Generating Story...
                  </>
                ) : (
                  <>
                    <BookOpen className="mr-3 w-6 h-6" />
                    Begin Adventure
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Show loading during generation
  if (isGenerating) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingAnimation message="Creating your next chapter..." />
      </div>
    );
  }

  // Main story interface
  return (
    <div className="min-h-screen py-20">
      <div className="mb-8 px-4">
        <Button
          onClick={() => setLocation("/gallery")}
          className="bg-white/90 hover:bg-white text-darkgray px-6 py-3 rounded-full fredoka"
        >
          <ArrowLeft className="mr-2 w-5 h-5" />
          Back to Gallery
        </Button>
      </div>

      <StoryInterface
        chapter={currentChapter}
        storyTitle={story.title}
        currentChapter={story.currentChapter}
        totalChapters={story.totalChapters}
        onChoiceSelect={handleChoiceSelect}
        onContinue={handleContinue}
        isLoading={isGenerating}
      />
    </div>
  );
}
