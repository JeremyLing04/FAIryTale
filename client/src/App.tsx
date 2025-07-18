import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Navigation from "@/components/navigation";
import Home from "@/pages/home";
import CharacterCreator from "@/pages/character-creator";
import StoryReader from "@/pages/story-reader";
import StoryGallery from "@/pages/story-gallery";
import MyStories from "@/pages/my-stories";
import MyCharacters from "@/pages/my-characters";
import SharedStories from "@/pages/shared-stories";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/character-creator" component={CharacterCreator} />
      <Route path="/story/:id" component={StoryReader} />
      <Route path="/gallery" component={StoryGallery} />
      <Route path="/shared-stories" component={SharedStories} />
      <Route path="/my-stories" component={MyStories} />
      <Route path="/my-characters" component={MyCharacters} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="min-h-screen bg-gradient-to-br from-[hsl(199,89%,48%)] to-[hsl(174,72%,56%)]">
          <Navigation />
          <Router />
          <Toaster />
        </div>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
