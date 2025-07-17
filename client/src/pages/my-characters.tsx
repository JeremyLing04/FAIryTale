import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "wouter";
import { type Character } from "@shared/schema";
import CharacterCard from "@/components/character-card";
import LoadingAnimation from "@/components/loading-animation";
import { Users, Plus, ArrowLeft } from "lucide-react";

export default function MyCharacters() {
  const [_, setLocation] = useLocation();
  
  const { data: characters, isLoading: charactersLoading } = useQuery<Character[]>({
    queryKey: ["/api/characters"],
  });

  const handleCharacterSelect = (character: Character) => {
    // Navigate to character creator with the selected character to create a new story
    setLocation(`/character-creator?characterId=${character.id}&step=story`);
  };

  if (charactersLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingAnimation message="Loading your characters..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen py-20 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="fredoka text-5xl md:text-6xl text-white mb-4 animate-bounce-slow">
            My Characters
          </h1>
          <p className="text-xl text-white/90 max-w-2xl mx-auto">
            Meet your amazing characters and create new adventures with them!
          </p>
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center mb-8">
          <Link href="/gallery">
            <Button variant="outline" className="bg-white/90 hover:bg-white text-darkgray px-6 py-3 rounded-full fredoka">
              <ArrowLeft className="mr-2 w-5 h-5" />
              Back to Gallery
            </Button>
          </Link>
          <Link href="/character-creator">
            <Button className="bg-turquoise hover:bg-[#26a69a] text-white px-6 py-3 rounded-full fredoka">
              <Plus className="mr-2 w-5 h-5" />
              New Character
            </Button>
          </Link>
        </div>

        {/* Characters Grid */}
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
      </div>
    </div>
  );
}