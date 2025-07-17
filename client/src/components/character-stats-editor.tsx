import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { type InsertCharacter } from "@shared/schema";
import { Heart, Shield, Lightbulb, Palette, Dumbbell, Users } from "lucide-react";

interface CharacterStatsEditorProps {
  character: InsertCharacter;
  onStatsChange: (stats: Partial<InsertCharacter>) => void;
}

export default function CharacterStatsEditor({ character, onStatsChange }: CharacterStatsEditorProps) {
  const stats = [
    { 
      name: "Courage", 
      key: "courage" as keyof InsertCharacter, 
      value: character.courage || 50, 
      icon: Shield, 
      color: "text-red-500",
      description: "How brave your character is in scary situations"
    },
    { 
      name: "Kindness", 
      key: "kindness" as keyof InsertCharacter, 
      value: character.kindness || 50, 
      icon: Heart, 
      color: "text-pink-500",
      description: "How caring and helpful your character is to others"
    },
    { 
      name: "Wisdom", 
      key: "wisdom" as keyof InsertCharacter, 
      value: character.wisdom || 50, 
      icon: Lightbulb, 
      color: "text-yellow-500",
      description: "How smart and thoughtful your character is"
    },
    { 
      name: "Creativity", 
      key: "creativity" as keyof InsertCharacter, 
      value: character.creativity || 50, 
      icon: Palette, 
      color: "text-purple-500",
      description: "How imaginative and artistic your character is"
    },
    { 
      name: "Strength", 
      key: "strength" as keyof InsertCharacter, 
      value: character.strength || 50, 
      icon: Dumbbell, 
      color: "text-blue-500",
      description: "How physically strong your character is"
    },
    { 
      name: "Friendship", 
      key: "friendship" as keyof InsertCharacter, 
      value: character.friendship || 50, 
      icon: Users, 
      color: "text-green-500",
      description: "How good your character is at making friends"
    },
  ];

  const handleStatChange = (statKey: keyof InsertCharacter, value: number[]) => {
    onStatsChange({ [statKey]: value[0] });
  };

  return (
    <Card className="bg-white rounded-2xl shadow-lg">
      <CardHeader>
        <CardTitle className="fredoka text-xl text-darkgray">Character Stats</CardTitle>
        <p className="text-sm text-gray-600">
          Adjust your character's abilities. These will influence how they handle different situations in stories!
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.name} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Icon className={`w-5 h-5 ${stat.color}`} />
                  <Label className="font-medium">{stat.name}</Label>
                </div>
                <span className="text-sm text-gray-600 font-medium">{stat.value}</span>
              </div>
              <p className="text-xs text-gray-500 mb-2">{stat.description}</p>
              <Slider
                value={[stat.value]}
                onValueChange={(value) => handleStatChange(stat.key, value)}
                max={100}
                min={0}
                step={5}
                className="w-full"
              />
            </div>
          );
        })}
        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-800">
            💡 <strong>Tip:</strong> Your character's stats will affect how they react to different situations in stories. 
            High courage helps in dangerous situations, while high kindness helps with making friends!
          </p>
        </div>
      </CardContent>
    </Card>
  );
}