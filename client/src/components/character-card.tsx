import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { type Character } from "@shared/schema";
import { User, Sparkles } from "lucide-react";

interface CharacterCardProps {
  character: Character;
  onSelect: (character: Character) => void;
  isSelected?: boolean;
}

export default function CharacterCard({ character, onSelect, isSelected }: CharacterCardProps) {
  const getGradientClass = (type: string) => {
    switch (type) {
      case 'explorer':
        return 'bg-gradient-to-br from-[hsl(44,100%,80%)] to-orange-300';
      case 'princess':
        return 'bg-gradient-to-br from-[hsl(300,47%,75%)] to-purple-300';
      case 'superhero':
        return 'bg-gradient-to-br from-[hsl(150,50%,60%)] to-green-300';
      case 'dragon':
        return 'bg-gradient-to-br from-[hsl(0,100%,70%)] to-red-300';
      case 'unicorn':
        return 'bg-gradient-to-br from-[hsl(174,72%,56%)] to-blue-300';
      default:
        return 'bg-gradient-to-br from-[hsl(199,89%,48%)] to-blue-300';
    }
  };

  return (
    <Card className={`character-card cursor-pointer transition-all duration-300 hover:scale-105 ${isSelected ? 'ring-4 ring-coral' : ''}`}>
      <CardContent className={`${getGradientClass(character.type)} rounded-t-lg p-6`}>
        <div className="flex items-center justify-center mb-4">
          <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center">
            <User className="w-10 h-10 text-white" />
          </div>
        </div>
        <div className="text-center">
          <h4 className="fredoka text-xl text-darkgray mb-2">{character.name}</h4>
          <p className="text-darkgray text-sm mb-4 capitalize">{character.type}</p>
          <p className="text-darkgray/80 text-sm mb-4">{character.personality}</p>
          {character.powers && character.powers.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-4">
              {character.powers.map((power, index) => (
                <span key={index} className="bg-white/30 text-darkgray text-xs px-2 py-1 rounded-full">
                  {power}
                </span>
              ))}
            </div>
          )}
          <Button 
            onClick={() => onSelect(character)}
            className="w-full bg-white/90 text-darkgray hover:bg-white transition-colors"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            Choose {character.name}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
