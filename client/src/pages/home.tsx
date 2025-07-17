import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { 
  Wand2, 
  BookOpen, 
  Palette, 
  Image, 
  Route, 
  Shield, 
  Bookmark,
  Bot,
  Star,
  Sparkles,
  Users,
  PlusCircle
} from "lucide-react";

export default function Home() {
  const characterTypes = [
    {
      id: 'explorer',
      name: 'Brave Explorer',
      description: 'Ready for outdoor adventures!',
      gradient: 'bg-gradient-to-br from-[hsl(44,100%,80%)] to-orange-300',
      icon: '🏃‍♂️'
    },
    {
      id: 'princess',
      name: 'Magic Princess',
      description: 'Rules a kingdom of wonder!',
      gradient: 'bg-gradient-to-br from-[hsl(300,47%,75%)] to-purple-300',
      icon: '👸'
    },
    {
      id: 'superhero',
      name: 'Super Hero',
      description: 'Saves the day with kindness!',
      gradient: 'bg-gradient-to-br from-[hsl(150,50%,60%)] to-green-300',
      icon: '🦸'
    }
  ];

  const features = [
    {
      icon: <Bot className="w-12 h-12 text-coral animate-pulse-slow" />,
      title: 'AI Story Magic',
      description: 'Our smart AI creates unique stories just for you! Every adventure is different and exciting.'
    },
    {
      icon: <Palette className="w-12 h-12 text-turquoise animate-pulse-slow" />,
      title: 'Custom Characters',
      description: 'Create and customize your own characters! Choose their looks, powers, and personality.'
    },
    {
      icon: <Image className="w-12 h-12 text-warmyellow animate-pulse-slow" />,
      title: 'Beautiful Pictures',
      description: 'Every story comes with amazing pictures that help bring your adventure to life!'
    },
    {
      icon: <Route className="w-12 h-12 text-lavender animate-pulse-slow" />,
      title: 'Choose Your Path',
      description: 'Make important choices that change your story! Each decision leads to new adventures.'
    },
    {
      icon: <Shield className="w-12 h-12 text-mint animate-pulse-slow" />,
      title: 'Safe & Fun',
      description: 'All stories are kid-friendly and safe. Parents can feel confident about the content.'
    },
    {
      icon: <Bookmark className="w-12 h-12 text-skyblue animate-pulse-slow" />,
      title: 'Save Stories',
      description: 'Keep your favorite stories and continue reading them anytime you want!'
    }
  ];

  const sampleStories = [
    {
      title: 'The Crystal Castle Quest',
      description: 'Join brave knights on their mission to save the magical crystal castle from the sleepy dragon!',
      genre: 'Adventure',
      gradient: 'bg-gradient-to-br from-[hsl(44,100%,80%)] to-orange-200',
      badgeClass: 'bg-coral'
    },
    {
      title: "Mermaid's Ocean Secret",
      description: 'Dive deep with Marina the mermaid to discover the lost treasure of the singing seahorses!',
      genre: 'Fantasy',
      gradient: 'bg-gradient-to-br from-[hsl(174,72%,56%)] to-blue-200',
      badgeClass: 'bg-turquoise'
    },
    {
      title: "Space Explorer's Mission",
      description: 'Blast off with Captain Nova to help friendly aliens find their way back to the rainbow planet!',
      genre: 'Sci-Fi',
      gradient: 'bg-gradient-to-br from-[hsl(150,50%,60%)] to-green-200',
      badgeClass: 'bg-mint'
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="fredoka text-5xl md:text-7xl text-white mb-6 animate-bounce-slow">
            Create Your Magic Story!
          </h1>
          <p className="text-xl md:text-2xl text-white/90 mb-12 max-w-3xl mx-auto leading-relaxed">
            Build amazing adventures with AI! Create your own characters and watch them come to life in personalized stories where YOU choose what happens next!
          </p>
          
          {/* Character Creation Preview */}
          <Card className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl mb-12">
            <CardContent className="p-8">
              <h3 className="fredoka text-3xl text-darkgray mb-8">Start by Creating Your Hero!</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {characterTypes.map((character) => (
                  <Link key={character.id} href={`/character-creator?type=${character.id}`}>
                    <div className={`character-card ${character.gradient} rounded-2xl p-6 cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-xl`}>
                      <div className="text-center">
                        <div className="text-6xl mb-4">{character.icon}</div>
                        <h4 className="fredoka text-xl text-darkgray mb-2">{character.name}</h4>
                        <p className="text-darkgray text-sm">{character.description}</p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
              
              <Link href="/character-creator">
                <Button className="mt-8 bg-coral hover:bg-[#ff5252] text-white px-12 py-4 rounded-full text-xl fredoka shadow-lg">
                  <Wand2 className="mr-3 w-6 h-6" />
                  Create My Character
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-[hsl(150,50%,60%)] to-[hsl(174,72%,56%)]">
        <div className="max-w-6xl mx-auto">
          <h2 className="fredoka text-4xl md:text-5xl text-center text-white mb-16">Amazing Features for Kids!</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="bg-white rounded-3xl shadow-xl text-center">
                <CardContent className="p-8">
                  <div className="flex justify-center mb-6">
                    {feature.icon}
                  </div>
                  <h3 className="fredoka text-2xl text-darkgray mb-4">{feature.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Story Gallery */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <h2 className="fredoka text-4xl md:text-5xl text-center text-darkgray mb-4">Popular Story Adventures</h2>
          <p className="text-xl text-center text-gray-600 mb-16">Check out these amazing stories created by other kids!</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {sampleStories.map((story, index) => (
              <Card key={index} className={`${story.gradient} overflow-hidden shadow-xl`}>
                <div className="h-48 bg-gradient-to-br from-white/20 to-white/10 flex items-center justify-center">
                  <BookOpen className="w-16 h-16 text-white/70" />
                </div>
                <CardContent className="p-6">
                  <h3 className="fredoka text-xl text-darkgray mb-2">{story.title}</h3>
                  <p className="text-gray-700 mb-4 text-sm">{story.description}</p>
                  <div className="flex items-center justify-between">
                    <Badge className={`${story.badgeClass} text-white px-3 py-1 text-sm font-semibold`}>
                      {story.genre}
                    </Badge>
                    <div className="flex items-center space-x-1">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-warmyellow text-warmyellow" />
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          <div className="text-center mt-12">
            <Link href="/gallery">
              <Button className="bg-coral hover:bg-[#ff5252] text-white px-8 py-4 rounded-full text-lg fredoka shadow-lg">
                <BookOpen className="mr-3 w-5 h-5" />
                Explore More Stories
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 px-4 bg-gradient-to-br from-[hsl(0,100%,70%)] to-red-400">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="fredoka text-4xl md:text-6xl text-white mb-6">Ready for Your Adventure?</h2>
          <p className="text-xl md:text-2xl text-white/90 mb-12 leading-relaxed">
            Join thousands of kids creating amazing stories every day! Your next great adventure is just one click away.
          </p>
          
          <Card className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl mb-8">
            <CardContent className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="text-center">
                  <Users className="w-12 h-12 text-coral mb-4 mx-auto" />
                  <h3 className="fredoka text-xl text-darkgray mb-2">1. Sign Up Free</h3>
                  <p className="text-gray-600">Create your account in seconds</p>
                </div>
                <div className="text-center">
                  <Wand2 className="w-12 h-12 text-turquoise mb-4 mx-auto" />
                  <h3 className="fredoka text-xl text-darkgray mb-2">2. Create Character</h3>
                  <p className="text-gray-600">Design your perfect hero</p>
                </div>
                <div className="text-center">
                  <BookOpen className="w-12 h-12 text-warmyellow mb-4 mx-auto" />
                  <h3 className="fredoka text-xl text-darkgray mb-2">3. Start Adventure</h3>
                  <p className="text-gray-600">Begin your magical journey</p>
                </div>
              </div>
              
              <Link href="/character-creator">
                <Button className="bg-coral hover:bg-[#ff5252] text-white px-12 py-4 rounded-full text-xl fredoka shadow-lg">
                  <Sparkles className="mr-3 w-6 h-6" />
                  Start My First Story FREE!
                </Button>
              </Link>
            </CardContent>
          </Card>
          
          <p className="text-white/80 text-lg">
            <Shield className="inline mr-2 w-5 h-5" />
            100% safe and ad-free for kids • Trusted by parents worldwide
          </p>
        </div>
      </section>
    </div>
  );
}
