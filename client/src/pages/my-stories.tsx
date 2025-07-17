import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { type Story } from "@shared/schema";
import StoryCard from "@/components/story-card";
import LoadingAnimation from "@/components/loading-animation";
import { BookOpen, Wand2, Plus, ArrowLeft } from "lucide-react";

export default function MyStories() {
  const { data: stories, isLoading: storiesLoading } = useQuery<Story[]>({
    queryKey: ["/api/stories"],
  });

  if (storiesLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingAnimation message="Loading your stories..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen py-20 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="fredoka text-5xl md:text-6xl text-white mb-4 animate-bounce-slow">
            My FAIryTale <span className="text-red-400">AI</span> Stories
          </h1>
          <p className="text-xl text-white/90 max-w-2xl mx-auto">
            Continue your amazing adventures and create new ones!
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
            <Button className="bg-coral hover:bg-[#ff5252] text-white px-6 py-3 rounded-full fredoka">
              <Plus className="mr-2 w-5 h-5" />
              New Story
            </Button>
          </Link>
        </div>

        {/* Stories Grid */}
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
      </div>
    </div>
  );
}