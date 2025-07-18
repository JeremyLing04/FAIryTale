import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { 
  Bot, 
  Wand2, 
  Sparkles, 
  Image, 
  Lightbulb, 
  RefreshCw,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

interface CharacterSuggestion {
  name: string;
  personality: string;
  powers: string[];
  backstory: string;
}

interface StoryIdeaSuggestion {
  title: string;
  genre: string;
  description: string;
  setting: string;
}

interface AIAssistantProps {
  step: 'character' | 'story';
  character?: {
    name: string;
    type: string;
    personality: string;
    powers: string[];
  };
  onCharacterSuggestionApply?: (suggestion: CharacterSuggestion) => void;
  onStoryIdeaApply?: (idea: StoryIdeaSuggestion) => void;
  onImageGenerate?: (imageUrl: string) => void;
  onPersonalityEnhance?: (enhanced: string) => void;
  onPowerSuggestionsApply?: (powers: string[]) => void;
}

export default function AIAssistant({
  step,
  character,
  onCharacterSuggestionApply,
  onStoryIdeaApply,
  onImageGenerate,
  onPersonalityEnhance,
  onPowerSuggestionsApply
}: AIAssistantProps) {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [userInput, setUserInput] = useState("");
  const [characterSuggestions, setCharacterSuggestions] = useState<CharacterSuggestion[]>([]);
  const [storyIdeas, setStoryIdeas] = useState<StoryIdeaSuggestion[]>([]);
  const [powerSuggestions, setPowerSuggestions] = useState<string[]>([]);

  const characterSuggestionsMutation = useMutation({
    mutationFn: async (params: { characterType: string; userInput?: string }) => {
      const response = await apiRequest("POST", "/api/ai/character-suggestions", params);
      return response.json();
    },
    onSuccess: (data) => {
      setCharacterSuggestions(data.suggestions);
      toast({
        title: "AI Suggestions Ready!",
        description: "I've created some character ideas for you.",
      });
    },
    onError: () => {
      toast({
        title: "AI Error",
        description: "Failed to generate character suggestions. Please try again.",
        variant: "destructive",
      });
    },
  });

  const storyIdeasMutation = useMutation({
    mutationFn: async (params: any) => {
      const response = await apiRequest("POST", "/api/ai/story-ideas", params);
      return response.json();
    },
    onSuccess: (data) => {
      setStoryIdeas(data.ideas);
      toast({
        title: "Story Ideas Ready!",
        description: "I've created some adventure ideas for your character.",
      });
    },
    onError: () => {
      toast({
        title: "AI Error",
        description: "Failed to generate story ideas. Please try again.",
        variant: "destructive",
      });
    },
  });

  const generateImageMutation = useMutation({
    mutationFn: async (params: any) => {
      const response = await apiRequest("POST", "/api/ai/generate-character-image", params);
      return response.json();
    },
    onSuccess: (data) => {
      if (onImageGenerate) {
        onImageGenerate(data.imageUrl);
      }
      toast({
        title: "Image Generated!",
        description: "I've created a character image for you.",
      });
    },
    onError: () => {
      toast({
        title: "AI Error",
        description: "Failed to generate image. Please try again.",
        variant: "destructive",
      });
    },
  });

  const enhancePersonalityMutation = useMutation({
    mutationFn: async (params: { personalityInput: string; characterType: string }) => {
      const response = await apiRequest("POST", "/api/ai/enhance-personality", params);
      return response.json();
    },
    onSuccess: (data) => {
      if (onPersonalityEnhance) {
        onPersonalityEnhance(data.enhanced);
      }
      toast({
        title: "Personality Enhanced!",
        description: "I've improved your character's personality description.",
      });
    },
    onError: () => {
      toast({
        title: "AI Error",
        description: "Failed to enhance personality. Please try again.",
        variant: "destructive",
      });
    },
  });

  const powerSuggestionsMutation = useMutation({
    mutationFn: async (params: { characterType: string; personality: string }) => {
      const response = await apiRequest("POST", "/api/ai/power-suggestions", params);
      return response.json();
    },
    onSuccess: (data) => {
      setPowerSuggestions(data.powers);
      toast({
        title: "Power Ideas Ready!",
        description: "I've suggested some cool powers for your character.",
      });
    },
    onError: () => {
      toast({
        title: "AI Error",
        description: "Failed to generate power suggestions. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleGenerateCharacterSuggestions = () => {
    if (!character?.type) return;
    characterSuggestionsMutation.mutate({
      characterType: character.type,
      userInput: userInput || undefined
    });
  };

  const handleGenerateStoryIdeas = () => {
    if (!character?.name || !character?.type || !character?.personality) return;
    storyIdeasMutation.mutate({
      characterName: character.name,
      characterType: character.type,
      personality: character.personality,
      powers: character.powers || []
    });
  };

  const handleGenerateImage = () => {
    if (!character?.type || !character?.personality) return;
    generateImageMutation.mutate({
      characterName: character.name,
      characterType: character.type,
      personality: character.personality,
      powers: character.powers,
      style: 'colorful'
    });
  };

  const handleEnhancePersonality = () => {
    if (!character?.personality || !character?.type) return;
    enhancePersonalityMutation.mutate({
      personalityInput: character.personality,
      characterType: character.type
    });
  };

  const handleGeneratePowerSuggestions = () => {
    if (!character?.type || !character?.personality) return;
    powerSuggestionsMutation.mutate({
      characterType: character.type,
      personality: character.personality
    });
  };

  return (
    <Card className="border-2 border-coral/20 bg-gradient-to-br from-coral/10 to-turquoise/10">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-white/20 transition-colors rounded-t-lg">
            <CardTitle className="fredoka text-2xl text-coral flex items-center justify-between">
              <div className="flex items-center">
                <Bot className="mr-3 w-6 h-6 animate-pulse" />
                AI Story Assistant
              </div>
              {isOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </CardTitle>
          </CardHeader>
        </CollapsibleTrigger>
        
        <CollapsibleContent>
          <CardContent className="p-6">
            {step === 'character' && (
              <div className="space-y-6">
                <div className="text-center">
                  <p className="text-darkgray mb-4">
                    Let me help you create an amazing character! I can suggest ideas, enhance descriptions, and even generate images.
                  </p>
                </div>

                {/* User Input for Custom Suggestions */}
                <div>
                  <Label htmlFor="ai-input" className="text-sm font-semibold text-darkgray mb-2 block">
                    Tell me your ideas (optional):
                  </Label>
                  <Input
                    id="ai-input"
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    placeholder="What kind of character do you want? (e.g., a brave explorer who loves animals)"
                    className="rounded-xl border-coral/30 focus:border-coral"
                  />
                </div>

                {/* AI Action Buttons */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <Button
                    onClick={handleGenerateCharacterSuggestions}
                    disabled={characterSuggestionsMutation.isPending || !character?.type}
                    className="bg-coral hover:bg-[#ff5252] text-white rounded-xl p-4"
                  >
                    {characterSuggestionsMutation.isPending ? (
                      <RefreshCw className="mr-2 w-4 h-4 animate-spin" />
                    ) : (
                      <Lightbulb className="mr-2 w-4 h-4" />
                    )}
                    Get Character Ideas
                  </Button>

                  <Button
                    onClick={handleGeneratePowerSuggestions}
                    disabled={powerSuggestionsMutation.isPending || !character?.type || !character?.personality}
                    className="bg-turquoise hover:bg-[#26a69a] text-white rounded-xl p-4"
                  >
                    {powerSuggestionsMutation.isPending ? (
                      <RefreshCw className="mr-2 w-4 h-4 animate-spin" />
                    ) : (
                      <Sparkles className="mr-2 w-4 h-4" />
                    )}
                    Suggest Powers
                  </Button>

                  <Button
                    onClick={handleEnhancePersonality}
                    disabled={enhancePersonalityMutation.isPending || !character?.personality}
                    className="bg-lavender hover:bg-purple-400 text-white rounded-xl p-4"
                  >
                    {enhancePersonalityMutation.isPending ? (
                      <RefreshCw className="mr-2 w-4 h-4 animate-spin" />
                    ) : (
                      <Wand2 className="mr-2 w-4 h-4" />
                    )}
                    Enhance Personality
                  </Button>

                  <Button
                    onClick={handleGenerateImage}
                    disabled={generateImageMutation.isPending || !character?.type || !character?.personality}
                    className="bg-warmyellow hover:bg-yellow-400 text-white rounded-xl p-4"
                  >
                    {generateImageMutation.isPending ? (
                      <RefreshCw className="mr-2 w-4 h-4 animate-spin" />
                    ) : (
                      <Image className="mr-2 w-4 h-4" />
                    )}
                    Generate Image
                  </Button>
                </div>

                {/* Character Suggestions */}
                {characterSuggestions.length > 0 && (
                  <div>
                    <h4 className="fredoka text-lg text-darkgray mb-3">Character Suggestions:</h4>
                    <div className="space-y-3">
                      {characterSuggestions.map((suggestion, index) => (
                        <Card key={index} className="bg-white/80 border border-coral/20">
                          <CardContent className="p-4">
                            <div className="flex justify-between items-start mb-2">
                              <h5 className="font-semibold text-darkgray">{suggestion.name}</h5>
                              <Button
                                size="sm"
                                onClick={() => onCharacterSuggestionApply?.(suggestion)}
                                className="bg-coral hover:bg-[#ff5252] text-white text-xs px-3 py-1"
                              >
                                Use This
                              </Button>
                            </div>
                            <p className="text-sm text-darkgray mb-2">{suggestion.personality}</p>
                            <p className="text-xs text-darkgray/70 mb-2">{suggestion.backstory}</p>
                            <div className="flex flex-wrap gap-1">
                              {suggestion.powers.map((power, powerIndex) => (
                                <Badge key={powerIndex} variant="secondary" className="text-xs">
                                  {power}
                                </Badge>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}

                {/* Power Suggestions */}
                {powerSuggestions.length > 0 && (
                  <div>
                    <h4 className="fredoka text-lg text-darkgray mb-3">Power Suggestions:</h4>
                    <div className="flex flex-wrap gap-2">
                      {powerSuggestions.map((power, index) => (
                        <Button
                          key={index}
                          variant="outline"
                          size="sm"
                          onClick={() => onPowerSuggestionsApply?.([power])}
                          className="text-xs border-turquoise text-turquoise hover:bg-turquoise hover:text-white"
                        >
                          + {power}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {step === 'story' && (
              <div className="space-y-6">
                <div className="text-center">
                  <p className="text-darkgray mb-4">
                    Now let's create an amazing story for {character?.name}! I can suggest different adventure ideas.
                  </p>
                </div>

                <Button
                  onClick={handleGenerateStoryIdeas}
                  disabled={storyIdeasMutation.isPending || !character?.name}
                  className="w-full bg-coral hover:bg-[#ff5252] text-white rounded-xl p-4"
                >
                  {storyIdeasMutation.isPending ? (
                    <RefreshCw className="mr-2 w-4 h-4 animate-spin" />
                  ) : (
                    <Lightbulb className="mr-2 w-4 h-4" />
                  )}
                  Get Story Ideas for {character?.name}
                </Button>

                {/* Story Ideas */}
                {storyIdeas.length > 0 && (
                  <div>
                    <h4 className="fredoka text-lg text-darkgray mb-3">Story Ideas:</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {storyIdeas.map((idea, index) => (
                        <Card key={index} className="bg-white/80 border border-coral/20">
                          <CardContent className="p-4">
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <h5 className="font-semibold text-darkgray mb-1">{idea.title}</h5>
                                <Badge variant="secondary" className="text-xs mb-2">
                                  {idea.genre}
                                </Badge>
                              </div>
                              <Button
                                size="sm"
                                onClick={() => onStoryIdeaApply?.(idea)}
                                className="bg-coral hover:bg-[#ff5252] text-white text-xs px-3 py-1"
                              >
                                Use This
                              </Button>
                            </div>
                            <p className="text-sm text-darkgray mb-2">{idea.description}</p>
                            <p className="text-xs text-darkgray/70">Setting: {idea.setting}</p>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}