import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { apiRequest } from "@/lib/queryClient";
import { type Story, type Character, type StoryChapter } from "@shared/schema";
import StoryInterface from "@/components/story-interface";
import LoadingAnimation from "@/components/loading-animation";
import { ArrowLeft, BookOpen, Sparkles, CheckCircle, ChevronDown } from "lucide-react";

export default function StoryReader() {
  const { id } = useParams() as { id: string };
  const [_, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isGenerating, setIsGenerating] = useState(false);
  const [readingChapter, setReadingChapter] = useState<number | null>(null);

  const { data: story, isLoading: storyLoading } = useQuery<Story>({
    queryKey: ["/api/stories", parseInt(id)],
  });

  const { data: character, isLoading: characterLoading } = useQuery<Character>({
    queryKey: ["/api/characters", story?.characterId],
    enabled: !!story?.characterId,
  });

  // Get the chapter to display (either current chapter or specific reading chapter)
  const chapterToDisplay = readingChapter || story?.currentChapter;
  
  const { data: currentChapter, isLoading: chapterLoading } = useQuery<StoryChapter>({
    queryKey: ["/api/stories", parseInt(id), "chapters", chapterToDisplay],
    enabled: !!chapterToDisplay,
  });

  // Get all chapters for navigation
  const { data: allChapters } = useQuery<StoryChapter[]>({
    queryKey: ["/api/stories", parseInt(id), "chapters"],
    enabled: !!story,
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



  const makeChoiceMutation = useMutation({
    mutationFn: async ({ chapterNumber, choice }: { chapterNumber: number; choice: 'A' | 'B' }) => {
      const response = await apiRequest("POST", `/api/stories/${id}/make-choice`, {
        chapterNumber,
        choice,
        characterId: story?.characterId
      });
      return response.json();
    },
    onSuccess: (data) => {
      // Invalidate character query to get updated stats
      queryClient.invalidateQueries({ queryKey: ["/api/characters", story?.characterId] });
      queryClient.invalidateQueries({ queryKey: ["/api/stories", id, "chapters"] });
      
      if (data.statEffects) {
        const effects = Object.entries(data.statEffects)
          .filter(([_, effect]) => effect !== 0)
          .map(([stat, effect]) => `${stat} ${effect > 0 ? '+' : ''}${effect}`)
          .join(', ');
        
        if (effects) {
          toast({
            title: "Character Growth!",
            description: `Your choice affected: ${effects}`,
          });
        }
      }
    },
  });

  const generateChapterMutation = useMutation({
    mutationFn: async (request: any) => {
      const response = await apiRequest("POST", `/api/stories/${id}/generate-chapter`, request);
      return response.json();
    },
    onSuccess: (data) => {
      // Invalidate queries to refetch updated story and chapters
      queryClient.invalidateQueries({ queryKey: ["/api/stories", parseInt(id)] });
      queryClient.invalidateQueries({ queryKey: ["/api/stories", parseInt(id), "chapters"] });
      
      setIsGenerating(false);
      toast({
        title: "Chapter Generated!",
        description: `Chapter ${data.chapterNumber} is ready to read!`,
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

  // Story completed state (only show if not reading a specific chapter)
  if (story.isCompleted && !readingChapter) {
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
              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
                <Button
                  onClick={() => setReadingChapter(1)}
                  className="bg-coral hover:bg-[#ff5252] text-white px-8 py-3 rounded-full fredoka"
                >
                  <BookOpen className="mr-2 w-5 h-5" />
                  Read from Beginning
                </Button>
                <Button
                  onClick={handleStartNewStory}
                  className="bg-turquoise hover:bg-[#26a69a] text-white px-8 py-3 rounded-full fredoka"
                >
                  <Sparkles className="mr-2 w-5 h-5" />
                  Start New Adventure
                </Button>
              </div>
              <Button
                onClick={() => setLocation("/gallery")}
                variant="outline"
                className="border-gray-300 text-gray-600 hover:bg-gray-50 px-6 py-2 rounded-full fredoka"
              >
                <ArrowLeft className="mr-2 w-4 h-4" />
                Back to Gallery
              </Button>
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
                    stats: character.stats,
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
      <div className="mb-8 px-4 flex justify-start items-center">
        <Button
          onClick={() => {
            if (readingChapter) {
              setReadingChapter(null);
            } else {
              setLocation("/gallery");
            }
          }}
          className="bg-white/90 hover:bg-white text-darkgray px-6 py-3 rounded-full fredoka"
        >
          <ArrowLeft className="mr-2 w-5 h-5" />
          {readingChapter ? "Back to Current Chapter" : "Back to Gallery"}
        </Button>
      </div>

      {/* Character Stats Panel */}
      <div className="px-4 mb-6">
        <div className="max-w-4xl mx-auto">
          <Card className="bg-gradient-to-r from-purple-100 to-blue-100 border-2 border-purple-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {character.imageUrl && (
                    <img 
                      src={character.imageUrl} 
                      alt={character.name}
                      className="w-12 h-12 rounded-full object-cover border-2 border-white"
                    />
                  )}
                  <div>
                    <h3 className="fredoka text-lg text-darkgray">{character.name}</h3>
                    <p className="text-sm text-gray-600 capitalize">{character.type}</p>
                  </div>
                </div>
                
                {character.stats && (
                  <div className="grid grid-cols-5 gap-3 text-center">
                    {Object.entries(character.stats).map(([stat, value]) => (
                      <div key={stat} className="flex flex-col items-center">
                        <div className="text-lg mb-1">
                          {stat === 'courage' ? '🦁' : 
                           stat === 'intelligence' ? '🧠' :
                           stat === 'kindness' ? '💖' :
                           stat === 'creativity' ? '🎨' :
                           stat === 'strength' ? '💪' : '⭐'}
                        </div>
                        <div className="text-sm font-bold text-coral bg-white px-2 py-1 rounded-full min-w-[2rem]">
                          {value}
                        </div>
                        <div className="text-xs text-gray-600 capitalize">{stat}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <StoryInterface
        chapter={currentChapter}
        storyTitle={story.title}
        currentChapter={readingChapter || story.currentChapter}
        totalChapters={story.totalChapters}
        onChoiceSelect={readingChapter ? undefined : handleChoiceSelect}
        onContinue={readingChapter ? undefined : handleContinue}
        isLoading={isGenerating}
        isReadingMode={!!readingChapter}
        character={character}
        onMakeChoice={makeChoiceMutation.mutate}
      />

      {/* Chapter navigation moved under the story panel */}
      {allChapters && allChapters.length > 1 && (
        <div className="px-4 mt-6">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-6">
              <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                {/* Chapter Info */}
                <div className="flex items-center gap-3">
                  <BookOpen className="w-5 h-5 text-darkgray" />
                  <span className="fredoka text-lg text-darkgray">
                    Chapter {readingChapter || story.currentChapter} of {allChapters.length}
                  </span>
                </div>

                {/* Navigation Controls */}
                <div className="flex gap-2 items-center">
                  {/* Previous Button */}
                  <Button
                    onClick={() => setReadingChapter(Math.max(1, (readingChapter || story.currentChapter) - 1))}
                    disabled={readingChapter === 1 || (!readingChapter && story.currentChapter === 1)}
                    variant="outline"
                    size="sm"
                    className="rounded-full"
                  >
                    Previous
                  </Button>
                  
                  {/* Chapter Dropdown Selector */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm" className="rounded-full px-4">
                        Jump to Chapter
                        <ChevronDown className="ml-1 w-3 h-3" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="center" className="max-h-80 overflow-y-auto w-72">
                      {allChapters.map((chapter) => (
                        <DropdownMenuItem
                          key={chapter.id}
                          onClick={() => setReadingChapter(chapter.chapterNumber)}
                          className={`${
                            (readingChapter || story.currentChapter) === chapter.chapterNumber
                              ? "bg-coral text-white"
                              : ""
                          } p-3 cursor-pointer`}
                        >
                          <div className="flex flex-col w-full">
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-medium">Chapter {chapter.chapterNumber}</span>
                              <div className="flex gap-1">
                                {chapter.hasChoices && <span className="text-xs">🌟</span>}
                                {(readingChapter || story.currentChapter) === chapter.chapterNumber && (
                                  <span className="text-xs bg-white/20 px-1 rounded">Current</span>
                                )}
                              </div>
                            </div>
                            <p className="text-xs opacity-75 line-clamp-2">
                              {chapter.content.slice(0, 80)}...
                            </p>
                          </div>
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>

                  {/* Next Button */}
                  <Button
                    onClick={() => {
                      const maxChapter = story.isCompleted ? allChapters.length : story.currentChapter;
                      setReadingChapter(Math.min(maxChapter, (readingChapter || story.currentChapter) + 1));
                    }}
                    disabled={
                      (story.isCompleted && readingChapter === allChapters.length) ||
                      (!story.isCompleted && readingChapter === story.currentChapter) ||
                      (!readingChapter && !story.isCompleted)
                    }
                    variant="outline"
                    size="sm"
                    className="rounded-full"
                  >
                    Next
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
