import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "wouter";
import { type Character } from "@shared/schema";
import CharacterCard from "@/components/character-card";
import LoadingAnimation from "@/components/loading-animation";
import { Users, Plus, ArrowLeft, Trash2 } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function MyCharacters() {
  const [_, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const { data: characters, isLoading: charactersLoading } = useQuery<Character[]>({
    queryKey: ["/api/characters"],
  });

  const deleteCharacterMutation = useMutation({
    mutationFn: async (characterId: number) => {
      const response = await apiRequest("DELETE", `/api/characters/${characterId}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/characters"] });
      toast({
        title: "Character Deleted",
        description: "Your character has been deleted successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete character. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleCharacterSelect = (character: Character) => {
    // Navigate to character creator with the selected character to create a new story
    setLocation(`/character-creator?characterId=${character.id}&step=story`);
  };

  const handleDeleteCharacter = (character: Character) => {
    if (window.confirm(`Are you sure you want to delete ${character.name}? This action cannot be undone.`)) {
      deleteCharacterMutation.mutate(character.id);
    }
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
              <div key={character.id} className="relative group">
                <CharacterCard 
                  character={character} 
                  onSelect={handleCharacterSelect} 
                />
                <Button
                  onClick={() => handleDeleteCharacter(character)}
                  variant="outline"
                  size="sm"
                  className="absolute top-2 right-2 bg-red-500/80 hover:bg-red-500 text-white border-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-2"
                  disabled={deleteCharacterMutation.isPending}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
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