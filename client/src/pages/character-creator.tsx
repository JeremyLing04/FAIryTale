import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { type InsertCharacter, type Character } from "@shared/schema";
import ImageUpload from "@/components/image-upload";
import CharacterStatsEditor from "@/components/character-stats-editor";
import { Wand2, Plus, X, Sparkles } from "lucide-react";

export default function CharacterCreator() {
  const [_, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Check URL parameters for existing character and type
  const urlParams = new URLSearchParams(window.location.search);
  const characterId = urlParams.get('characterId');
  const urlStep = urlParams.get('step');
  const urlType = urlParams.get('type');

  const [character, setCharacter] = useState<InsertCharacter>({
    name: "",
    type: urlType || "explorer",
    personality: "",
    powers: [],
    imageUrl: "",
    courage: 50,
    kindness: 50,
    wisdom: 50,
    creativity: 50,
    strength: 50,
    friendship: 50
  });

  const [newPower, setNewPower] = useState("");
  const [step, setStep] = useState<'character' | 'story'>(urlStep === 'story' ? 'story' : 'character');
  const [createdCharacter, setCreatedCharacter] = useState<any>(null);
  const [customType, setCustomType] = useState("");
  const [isCustomType, setIsCustomType] = useState(false);
  const [customGenre, setCustomGenre] = useState("");
  const [isCustomGenre, setIsCustomGenre] = useState(false);
  const [storyDetails, setStoryDetails] = useState({
    title: "",
    genre: "adventure",
    imageUrl: "" // for story art
  });

  // Fetch existing character if characterId is provided
  const { data: existingCharacter } = useQuery<Character>({
    queryKey: ["/api/characters", characterId],
    enabled: !!characterId && urlStep === 'story',
  });

  // Set up character data when existing character is loaded
  useEffect(() => {
    if (existingCharacter && urlStep === 'story') {
      setCreatedCharacter(existingCharacter);
      setStep('story');
    }
  }, [existingCharacter, urlStep]);

  // Handle URL type parameter
  useEffect(() => {
    if (urlType === 'custom') {
      setIsCustomType(true);
    }
  }, [urlType]);

  const characterTypes = [
    { id: 'explorer', name: 'Brave Explorer', icon: '🏃‍♂️' },
    { id: 'princess', name: 'Magic Princess', icon: '👸' },
    { id: 'superhero', name: 'Super Hero', icon: '🦸' },
    { id: 'dragon', name: 'Friendly Dragon', icon: '🐲' },
    { id: 'unicorn', name: 'Magical Unicorn', icon: '🦄' },
    { id: 'knight', name: 'Noble Knight', icon: '🤺' },
    { id: 'fairy', name: 'Garden Fairy', icon: '🧚' },
    { id: 'pirate', name: 'Kind Pirate', icon: '🏴‍☠️' },
    { id: 'custom', name: 'Create Your Own', icon: '✨' }
  ];

  const createCharacterMutation = useMutation({
    mutationFn: async (character: InsertCharacter) => {
      const response = await apiRequest("POST", "/api/characters", character);
      return response.json();
    },
    onSuccess: (newCharacter) => {
      setCreatedCharacter(newCharacter);
      setStep('story');
      toast({
        title: "Character Created!",
        description: `${newCharacter.name} is ready for adventure! Now let's create a story!`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/characters"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create character. Please try again.",
        variant: "destructive",
      });
    },
  });

  const createStoryMutation = useMutation({
    mutationFn: async (story: any) => {
      const response = await apiRequest("POST", "/api/stories", story);
      return response.json();
    },
    onSuccess: (newStory) => {
      toast({
        title: "Story Created!",
        description: `${newStory.title} is ready to begin!`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/stories"] });
      setLocation(`/story/${newStory.id}`);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create story. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (step === 'character') {
      if (!character.name || !character.personality) {
        toast({
          title: "Missing Information",
          description: "Please fill in your character's name and personality.",
          variant: "destructive",
        });
        return;
      }
      createCharacterMutation.mutate(character);
    } else {
      if (!storyDetails.title) {
        toast({
          title: "Missing Information",
          description: "Please give your story a title.",
          variant: "destructive",
        });
        return;
      }
      const targetCharacter = createdCharacter || existingCharacter;
      createStoryMutation.mutate({
        title: storyDetails.title,
        genre: isCustomGenre ? customGenre : storyDetails.genre,
        characterId: targetCharacter.id,
        currentChapter: 1,
        totalChapters: 5,
        isCompleted: false,
        imageUrl: storyDetails.imageUrl,
      });
    }
  };

  const addPower = () => {
    if (newPower.trim() && !character.powers.includes(newPower.trim())) {
      setCharacter({
        ...character,
        powers: [...character.powers, newPower.trim()]
      });
      setNewPower("");
    }
  };

  const removePower = (powerToRemove: string) => {
    setCharacter({
      ...character,
      powers: character.powers.filter(power => power !== powerToRemove)
    });
  };

  return (
    <div className="min-h-screen py-20 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="fredoka text-5xl md:text-6xl text-white mb-4 animate-bounce-slow">
            {step === 'character' ? 'Create Your Hero!' : 'Create Your Story!'}
          </h1>
          <p className="text-xl text-white/90 max-w-2xl mx-auto">
            {step === 'character' 
              ? 'Design your perfect character and watch them come to life in amazing stories!'
              : `Now let's create an amazing adventure for ${(createdCharacter || existingCharacter)?.name}!`
            }
          </p>
        </div>

        <Card className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl">
          <CardHeader>
            <CardTitle className="fredoka text-3xl text-darkgray text-center">
              <Wand2 className="inline mr-3 w-8 h-8" />
              Character Creator
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            <form onSubmit={handleSubmit} className="space-y-8">
              {step === 'story' && (
                <>
                  {/* Character Summary */}
                  <div className="bg-gradient-to-br from-[hsl(174,72%,56%)] to-blue-200 rounded-2xl p-6 mb-8">
                    <h3 className="fredoka text-2xl text-white mb-4">Your Hero is Ready!</h3>
                    <div className="bg-white/90 rounded-xl p-4">
                      {(() => {
                        const displayCharacter = createdCharacter || existingCharacter;
                        return (
                          <>
                            <div className="flex items-center gap-4 mb-4">
                              {displayCharacter?.imageUrl && (
                                <img 
                                  src={displayCharacter.imageUrl} 
                                  alt={displayCharacter.name}
                                  className="w-16 h-16 rounded-full object-cover"
                                />
                              )}
                              <div>
                                <h4 className="fredoka text-xl text-darkgray mb-2">{displayCharacter?.name}</h4>
                                <p className="text-darkgray capitalize">{displayCharacter?.type} • {displayCharacter?.personality}</p>
                              </div>
                            </div>
                            {displayCharacter?.powers && displayCharacter.powers.length > 0 && (
                              <div className="flex flex-wrap gap-2">
                                {displayCharacter.powers.map((power: string, index: number) => (
                                  <span key={index} className="bg-turquoise text-white text-xs px-2 py-1 rounded-full">
                                    {power}
                                  </span>
                                ))}
                              </div>
                            )}
                          </>
                        );
                      })()}
                    </div>
                  </div>

                  {/* Story Title */}
                  <div>
                    <Label htmlFor="title" className="text-lg font-semibold text-darkgray mb-3 block">
                      What's your story called?
                    </Label>
                    <Input
                      id="title"
                      value={storyDetails.title}
                      onChange={(e) => setStoryDetails({ ...storyDetails, title: e.target.value })}
                      placeholder="Enter a magical title..."
                      className="text-lg p-4 rounded-2xl border-2 border-gray-200 focus:border-coral"
                    />
                  </div>

                  {/* Story Genre */}
                  <div>
                    <Label className="text-lg font-semibold text-darkgray mb-3 block">
                      Choose your adventure type:
                    </Label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {[
                        { id: 'adventure', name: 'Adventure', icon: '🏔️', color: 'bg-coral' },
                        { id: 'fantasy', name: 'Fantasy', icon: '🦄', color: 'bg-turquoise' },
                        { id: 'mystery', name: 'Mystery', icon: '🔍', color: 'bg-lavender' },
                        { id: 'friendship', name: 'Friendship', icon: '🤝', color: 'bg-warmyellow' },
                        { id: 'sci-fi', name: 'Space', icon: '🚀', color: 'bg-mint' },
                        { id: 'magic', name: 'Magic', icon: '✨', color: 'bg-skyblue' },
                        { id: 'custom', name: 'Create Your Own', icon: '🎨', color: 'bg-coral' }
                      ].map((genre) => (
                        <Button
                          key={genre.id}
                          type="button"
                          variant="outline"
                          onClick={() => {
                            setStoryDetails({ ...storyDetails, genre: genre.id });
                            setIsCustomGenre(genre.id === 'custom');
                          }}
                          className={`p-4 h-auto rounded-2xl text-center transition-all duration-200 ${
                            storyDetails.genre === genre.id 
                              ? `${genre.color} text-white border-transparent shadow-lg transform scale-105 hover:opacity-90` 
                              : 'bg-white border-gray-200 text-darkgray hover:bg-gray-50 hover:border-coral hover:shadow-md'
                          }`}
                        >
                          <div>
                            <div className="text-2xl mb-2">{genre.icon}</div>
                            <div className="text-sm font-semibold">{genre.name}</div>
                          </div>
                        </Button>
                      ))}
                    </div>
                    
                    {isCustomGenre && (
                      <div className="mt-4">
                        <Input
                          value={customGenre}
                          onChange={(e) => {
                            setCustomGenre(e.target.value);
                            setStoryDetails({ ...storyDetails, genre: e.target.value });
                          }}
                          placeholder="What type of adventure do you want to create?"
                          className="text-lg p-4 rounded-2xl border-2 border-gray-200 focus:border-coral"
                        />
                      </div>
                    )}
                  </div>

                  {/* Story Art Upload */}
                  <ImageUpload
                    onImageUpload={(imageUrl) => setStoryDetails({ ...storyDetails, imageUrl })}
                    currentImage={storyDetails.imageUrl}
                    label="Upload story artwork (optional):"
                    placeholder="Add artwork for your story"
                  />
                </>
              )}

              {step === 'character' && (
                <>
                  {/* Character Name */}
              <div>
                <Label htmlFor="name" className="text-lg font-semibold text-darkgray mb-3 block">
                  What's your character's name?
                </Label>
                <Input
                  id="name"
                  value={character.name}
                  onChange={(e) => setCharacter({ ...character, name: e.target.value })}
                  placeholder="Enter a magical name..."
                  className="text-lg p-4 rounded-2xl border-2 border-gray-200 focus:border-coral"
                />
              </div>

              {/* Character Type */}
              <div>
                <Label className="text-lg font-semibold text-darkgray mb-3 block">
                  Choose your character type:
                </Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {characterTypes.map((type) => (
                    <Button
                      key={type.id}
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setCharacter({ ...character, type: type.id });
                        setIsCustomType(type.id === 'custom');
                      }}
                      className={`p-4 h-auto rounded-2xl text-center transition-all duration-200 ${
                        character.type === type.id 
                          ? 'bg-coral text-white border-coral hover:bg-[#ff5252] shadow-lg transform scale-105' 
                          : 'bg-white border-gray-200 text-darkgray hover:bg-gray-50 hover:border-coral hover:shadow-md'
                      }`}
                    >
                      <div>
                        <div className="text-2xl mb-2">{type.icon}</div>
                        <div className="text-sm font-semibold">{type.name}</div>
                      </div>
                    </Button>
                  ))}
                </div>
                
                {isCustomType && (
                  <div className="mt-4">
                    <Input
                      value={customType}
                      onChange={(e) => {
                        setCustomType(e.target.value);
                        setCharacter({ ...character, type: e.target.value });
                      }}
                      placeholder="What type of character do you want to create?"
                      className="text-lg p-4 rounded-2xl border-2 border-gray-200 focus:border-coral"
                    />
                  </div>
                )}
              </div>

              {/* Character Image Upload */}
              <ImageUpload
                onImageUpload={(imageUrl) => setCharacter({ ...character, imageUrl })}
                currentImage={character.imageUrl}
                label="Upload your character's picture:"
                placeholder="Add a picture of your character"
              />

              {/* Personality */}
              <div>
                <Label htmlFor="personality" className="text-lg font-semibold text-darkgray mb-3 block">
                  Describe your character's personality:
                </Label>
                <Textarea
                  id="personality"
                  value={character.personality}
                  onChange={(e) => setCharacter({ ...character, personality: e.target.value })}
                  placeholder="Is your character brave, kind, funny, curious...?"
                  className="text-lg p-4 rounded-2xl border-2 border-gray-200 focus:border-coral min-h-[100px]"
                />
              </div>

              {/* Powers */}
              <div>
                <Label className="text-lg font-semibold text-darkgray mb-3 block">
                  Special powers or abilities:
                </Label>
                <div className="flex gap-2 mb-4">
                  <Input
                    value={newPower}
                    onChange={(e) => setNewPower(e.target.value)}
                    placeholder="Add a special power..."
                    className="flex-1 rounded-2xl border-2 border-gray-200 focus:border-coral"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addPower())}
                  />
                  <Button
                    type="button"
                    onClick={addPower}
                    className="bg-turquoise hover:bg-[#26a69a] text-white px-6 rounded-2xl"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {character.powers.map((power, index) => (
                    <Badge
                      key={index}
                      variant="secondary"
                      className="bg-mint text-white text-sm px-3 py-1 rounded-full"
                    >
                      {power}
                      <button
                        type="button"
                        onClick={() => removePower(power)}
                        className="ml-2 hover:text-red-500"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Character Stats */}
              <CharacterStatsEditor
                character={character}
                onStatsChange={(stats) => setCharacter({ ...character, ...stats })}
              />


                </>
              )}

              {/* Submit Button */}
              <div className="text-center pt-8">
                <Button
                  type="submit"
                  disabled={createCharacterMutation.isPending || createStoryMutation.isPending}
                  className="bg-coral hover:bg-[#ff5252] text-white px-12 py-4 rounded-full text-xl fredoka shadow-lg"
                >
                  {step === 'character' ? (
                    createCharacterMutation.isPending ? (
                      <>
                        <Wand2 className="mr-3 w-6 h-6 animate-spin" />
                        Creating Character...
                      </>
                    ) : (
                      <>
                        <Wand2 className="mr-3 w-6 h-6" />
                        Create {character.name || 'My Character'}
                      </>
                    )
                  ) : (
                    createStoryMutation.isPending ? (
                      <>
                        <Wand2 className="mr-3 w-6 h-6 animate-spin" />
                        Creating Story...
                      </>
                    ) : (
                      <>
                        <Wand2 className="mr-3 w-6 h-6" />
                        Start {storyDetails.title || 'My Adventure'}
                      </>
                    )
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
