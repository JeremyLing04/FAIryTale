import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, PlayCircle } from "lucide-react";
import { type Story } from "@shared/schema";
import { Link } from "wouter";

interface StoryCardProps {
  story: Story;
}

export default function StoryCard({ story }: StoryCardProps) {
  const getGradientClass = (genre: string) => {
    switch (genre) {
      case 'adventure':
        return 'bg-gradient-to-br from-[hsl(44,100%,80%)] to-orange-200';
      case 'fantasy':
        return 'bg-gradient-to-br from-[hsl(174,72%,56%)] to-blue-200';
      case 'mystery':
        return 'bg-gradient-to-br from-[hsl(300,47%,75%)] to-purple-200';
      case 'sci-fi':
        return 'bg-gradient-to-br from-[hsl(150,50%,60%)] to-green-200';
      case 'friendship':
        return 'bg-gradient-to-br from-[hsl(0,100%,70%)] to-red-200';
      default:
        return 'bg-gradient-to-br from-[hsl(199,89%,48%)] to-indigo-200';
    }
  };

  const getBadgeColor = (genre: string) => {
    switch (genre) {
      case 'adventure':
        return 'bg-coral text-white';
      case 'fantasy':
        return 'bg-turquoise text-white';
      case 'mystery':
        return 'bg-lavender text-white';
      case 'sci-fi':
        return 'bg-mint text-white';
      case 'friendship':
        return 'bg-coral text-white';
      default:
        return 'bg-skyblue text-white';
    }
  };

  return (
    <Card className={`${getGradientClass(story.genre)} overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300`}>
      <div className="h-48 bg-gradient-to-br from-white/20 to-white/10 flex items-center justify-center">
        {story.imageUrl ? (
          <img 
            src={story.imageUrl} 
            alt={story.title} 
            className="w-full h-full object-cover"
          />
        ) : (
          <PlayCircle className="w-16 h-16 text-white/70" />
        )}
      </div>
      <CardContent className="p-6">
        <h3 className="fredoka text-xl text-darkgray mb-2">{story.title}</h3>
        <p className="text-darkgray/80 text-sm mb-4">
          Chapter {story.currentChapter} of {story.totalChapters}
        </p>
        <div className="flex items-center justify-between">
          <Badge className={`${getBadgeColor(story.genre)} px-3 py-1 text-sm font-semibold capitalize`}>
            {story.genre}
          </Badge>
          <div className="flex items-center space-x-1">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-4 h-4 fill-warmyellow text-warmyellow" />
            ))}
          </div>
        </div>
        <Link href={`/story/${story.id}`} className="block mt-4">
          <div className="w-full bg-white/90 hover:bg-white text-darkgray text-center py-2 px-4 rounded-lg transition-colors font-semibold">
            {story.isCompleted ? 'Read Again' : 'Continue Story'}
          </div>
        </Link>
      </CardContent>
    </Card>
  );
}
