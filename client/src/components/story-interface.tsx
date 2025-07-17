import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Volume2, VolumeX, Heart } from "lucide-react";
import { type StoryChapter } from "@shared/schema";

interface StoryInterfaceProps {
  chapter: StoryChapter;
  storyTitle: string;
  currentChapter: number;
  totalChapters: number;
  onChoiceSelect?: (choice: 'optionA' | 'optionB') => void;
  onContinue?: () => void;
  isLoading?: boolean;
  isReadingMode?: boolean;
}

export default function StoryInterface({ 
  chapter, 
  storyTitle, 
  currentChapter, 
  totalChapters, 
  onChoiceSelect,
  onContinue,
  isLoading = false,
  isReadingMode = false
}: StoryInterfaceProps) {
  const progressPercentage = (currentChapter / totalChapters) * 100;
  const [isSpeaking, setIsSpeaking] = useState(false);

  const handleSpeak = () => {
    if ('speechSynthesis' in window) {
      if (isSpeaking) {
        // Stop speaking
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
      } else {
        // Start speaking
        const utterance = new SpeechSynthesisUtterance(chapter.content);
        utterance.rate = 0.8; // Slightly slower for children
        utterance.pitch = 1.1; // Slightly higher pitch for friendliness
        
        utterance.onstart = () => setIsSpeaking(true);
        utterance.onend = () => setIsSpeaking(false);
        utterance.onerror = () => setIsSpeaking(false);
        
        window.speechSynthesis.speak(utterance);
      }
    } else {
      alert('Sorry, your browser does not support text-to-speech!');
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-4">
      <div className="bg-gradient-to-br from-[hsl(199,89%,48%)] to-[hsl(174,72%,56%)] rounded-3xl p-8 shadow-2xl">
        {/* Story Progress */}
        <div className="flex items-center justify-center mb-8">
          <Card className="bg-white rounded-full px-6 py-3 shadow-lg">
            <CardContent className="p-0">
              <div className="text-center">
                <span className="fredoka text-darkgray">Chapter {currentChapter} of {totalChapters}</span>
                <Progress value={progressPercentage} className="w-48 mt-2" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Story Content */}
        <Card className="bg-white rounded-2xl shadow-lg mb-8">
          <CardContent className="p-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              <div>
                {chapter.imageUrl ? (
                  <img 
                    src={chapter.imageUrl} 
                    alt={`Chapter ${currentChapter}`}
                    className="w-full h-64 object-cover rounded-xl shadow-lg"
                  />
                ) : (
                  <div className="w-full h-64 bg-gradient-to-br from-[hsl(300,47%,75%)] to-purple-300 rounded-xl shadow-lg flex items-center justify-center">
                    <Heart className="w-16 h-16 text-white/70" />
                  </div>
                )}
              </div>
              <div>
                <h3 className="fredoka text-2xl text-darkgray mb-4">{storyTitle}</h3>
                <p className="text-lg text-gray-700 leading-relaxed mb-6">
                  {chapter.content}
                </p>
                <div 
                  className="flex items-center space-x-4 text-coral cursor-pointer hover:text-[#ff5252] transition-colors"
                  onClick={handleSpeak}
                >
                  {isSpeaking ? (
                    <VolumeX className="w-5 h-5" />
                  ) : (
                    <Volume2 className="w-5 h-5" />
                  )}
                  <span className="text-sm">
                    {isSpeaking ? 'Click to stop' : 'Click to hear the story!'}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Choice Interface - only show when not in reading mode */}
        {chapter.choices && !isLoading && !isReadingMode && onChoiceSelect && (
          <div className="space-y-4">
            <h4 className="fredoka text-2xl text-white text-center mb-6">
              What should happen next?
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Button
                onClick={() => onChoiceSelect('optionA')}
                className="story-choice-button bg-[hsl(44,100%,80%)] hover:bg-[#ffb300] rounded-2xl p-6 h-auto text-left shadow-lg"
                disabled={isLoading}
              >
                <div className="flex items-start space-x-4">
                  <div className="text-3xl">🌟</div>
                  <div>
                    <h5 className="fredoka text-xl text-darkgray mb-2">
                      {chapter.choices.optionA.text}
                    </h5>
                    <p className="text-darkgray text-sm">
                      {chapter.choices.optionA.description}
                    </p>
                  </div>
                </div>
              </Button>

              <Button
                onClick={() => onChoiceSelect('optionB')}
                className="story-choice-button bg-[hsl(300,47%,75%)] hover:bg-[#ba68c8] rounded-2xl p-6 h-auto text-left shadow-lg"
                disabled={isLoading}
              >
                <div className="flex items-start space-x-4">
                  <div className="text-3xl">🌈</div>
                  <div>
                    <h5 className="fredoka text-xl text-darkgray mb-2">
                      {chapter.choices.optionB.text}
                    </h5>
                    <p className="text-darkgray text-sm">
                      {chapter.choices.optionB.description}
                    </p>
                  </div>
                </div>
              </Button>
            </div>
          </div>
        )}

        {/* Continue Button when no choices - only show when not in reading mode */}
        {!chapter.choices && !isLoading && !isReadingMode && onContinue && (
          <div className="text-center">
            <Button
              onClick={onContinue}
              className="bg-[hsl(174,72%,56%)] hover:bg-[#26a69a] text-white px-8 py-4 rounded-full text-lg fredoka shadow-lg"
              disabled={isLoading}
            >
              Continue the Adventure
            </Button>
          </div>
        )}

        {/* Reading Mode Message */}
        {isReadingMode && (
          <div className="text-center">
            <div className="bg-white/20 rounded-full px-6 py-3">
              <span className="fredoka text-white text-lg">
                📖 Reading Mode - Use navigation buttons above to move between chapters
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
