'use client';
import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useMutation } from '@tanstack/react-query';
import { generateQuizQuestions } from '@/lib/api';
import { toast } from 'sonner';

interface RightPaneTabsProps {
  roomCode: string;
  sessionConfig: any; // The config object for this session
  pushCodingQuestion: (markdown: string) => void;
  launchQuiz: (quizData: any) => void;
}

export default function RightPaneTabs({ roomCode, sessionConfig, pushCodingQuestion, launchQuiz }: RightPaneTabsProps) {
  const [questionText, setQuestionText] = useState('');
  const [isQuizLaunched, setIsQuizLaunched] = useState(false);

  const quizMutation = useMutation({
    mutationFn: () => generateQuizQuestions({
        topic: sessionConfig.quizTopic,
        count: sessionConfig.quizQuestionCount,
        directions: `Each question should be answered within ${sessionConfig.quizQuestionDuration} seconds.`
    }),
    onSuccess: (quizData) => {
        launchQuiz({
            questions: quizData,
            duration: sessionConfig.quizQuestionDuration
        });
        setIsQuizLaunched(true);
    },
    onError: (error) => {
        toast.error('Failed to generate quiz', { description: error.message });
    }
  })

  const handlePushQuestion = () => {
    if (questionText.trim()) {
      pushCodingQuestion(questionText);
    }
  };

  return (
    <div className="h-full bg-card">
      <Tabs defaultValue="screen" className="h-full flex flex-col">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="screen">Screen Share</TabsTrigger>
          <TabsTrigger value="coding" disabled={!sessionConfig.hasCodingChallenge}>Coding</TabsTrigger>
          <TabsTrigger value="quiz" disabled={!sessionConfig.hasQuiz}>Quiz</TabsTrigger>
        </TabsList>
        <TabsContent value="screen" className="flex-1 p-4">
            <h3 className="text-lg font-semibold">Interviewee Screen</h3>
            <p className="text-muted-foreground">When the interviewee shares their screen, it will appear in the main video pane on the left.</p>
        </TabsContent>
        <TabsContent value="coding" className="flex-1 p-4 flex flex-col gap-4">
           <h3 className="text-lg font-semibold">Post a Coding Question</h3>
           <p className="text-sm text-muted-foreground">Enter the question in Markdown format. The interviewee will see it in their "Question" tab.</p>
           <Textarea 
                className="flex-1 font-mono" 
                placeholder="e.g., ## Two Sum..." 
                value={questionText}
                onChange={(e) => setQuestionText(e.target.value)}
            />
           <Button onClick={handlePushQuestion}>Push Question</Button>
        </TabsContent>
        <TabsContent value="quiz" className="flex-1 p-4 flex flex-col items-center justify-center gap-4">
            <h3 className="text-lg font-semibold">Quiz Control</h3>
            {isQuizLaunched ? (
                <div className="text-center">
                    <p className="text-green-500 font-bold text-xl">Quiz is live!</p>
                    <p className="text-muted-foreground">The interviewee is now taking the quiz.</p>
                </div>
            ) : (
                <>
                    <p className="text-muted-foreground text-center">Click below to generate and launch the quiz for the interviewee.</p>
                    <Button onClick={() => quizMutation.mutate()} disabled={quizMutation.isPending}>
                        {quizMutation.isPending ? "Generating & Launching..." : "Launch Quiz"}
                    </Button>
                </>
            )}
        </TabsContent>
      </Tabs>
    </div>
  );
}