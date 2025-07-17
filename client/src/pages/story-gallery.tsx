import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "wouter";
import { type Story, type Character } from "@shared/schema";
import StoryCard from "@/components/story-card";
import CharacterCard from "@/components/character-card";
import LoadingAnimation from "@/components/loading-animation";
import { BookOpen, Users, Wand2, Plus } from "lucide-react";

export default function StoryGallery() {
  const [_, setLocation] = useLocation();
  
  const { data: stories, isLoading: storiesLoading } = useQuery<Story[]>({
    queryKey: ["/api/stories"],
  });

  const { data: characters, isLoading: charactersLoading } = useQuery<Character[]>({
    queryKey: ["/api/characters"],
  });

  const handleCharacterSelect = (character: Character) => {
    // Navigate to character creator with the selected character to create a new story
    setLocation(`/character-creator?characterId=${character.id}&step=story`);
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
            Your FAIryTale <span className="text-red-400">AI</span> Collection
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
                <StoryCard key={story.id} story={story} />
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
