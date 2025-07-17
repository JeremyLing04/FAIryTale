import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { type Character } from "@shared/schema";
import { Heart, Shield, Lightbulb, Palette, Dumbbell, Users } from "lucide-react";

interface CharacterStatsProps {
  character: Character;
  showTitle?: boolean;
  compact?: boolean;
}

export default function CharacterStats({ character, showTitle = true, compact = false }: CharacterStatsProps) {
  const stats = [
    { name: "Courage", value: character.courage || 50, icon: Shield, color: "text-red-500" },
    { name: "Kindness", value: character.kindness || 50, icon: Heart, color: "text-pink-500" },
    { name: "Wisdom", value: character.wisdom || 50, icon: Lightbulb, color: "text-yellow-500" },
    { name: "Creativity", value: character.creativity || 50, icon: Palette, color: "text-purple-500" },
    { name: "Strength", value: character.strength || 50, icon: Dumbbell, color: "text-blue-500" },
    { name: "Friendship", value: character.friendship || 50, icon: Users, color: "text-green-500" },
  ];

  const getStatLevel = (value: number) => {
    if (value >= 80) return { label: "Excellent", color: "bg-green-500" };
    if (value >= 60) return { label: "Good", color: "bg-blue-500" };
    if (value >= 40) return { label: "Average", color: "bg-yellow-500" };
    if (value >= 20) return { label: "Developing", color: "bg-orange-500" };
    return { label: "Needs Growth", color: "bg-red-500" };
  };

  if (compact) {
    return (
      <div className="space-y-2">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.name} className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Icon className={`w-4 h-4 ${stat.color}`} />
                <span className="text-sm font-medium">{stat.name}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Progress value={stat.value} className="w-16 h-2" />
                <span className="text-xs text-gray-500 w-8">{stat.value}</span>
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <Card className="bg-white rounded-2xl shadow-lg">
      {showTitle && (
        <CardHeader className="pb-3">
          <CardTitle className="fredoka text-xl text-darkgray">Character Stats</CardTitle>
        </CardHeader>
      )}
      <CardContent className="space-y-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          const level = getStatLevel(stat.value);
          return (
            <div key={stat.name} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Icon className={`w-5 h-5 ${stat.color}`} />
                  <span className="font-medium">{stat.name}</span>
                </div>
                <Badge className={`${level.color} text-white text-xs`}>
                  {level.label}
                </Badge>
              </div>
              <div className="flex items-center space-x-3">
                <Progress value={stat.value} className="flex-1" />
                <span className="text-sm text-gray-600 w-8">{stat.value}</span>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}