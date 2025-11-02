import { useEffect, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useAccessibility } from "@/contexts/AccessibilityContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Mic, Volume2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { TextToSpeech, SpeechToText } from "@/utils/speech";
import { Progress } from "@/components/ui/progress";
import parseQuiz from "@/utils/quizParser";

interface Question {
  question: string;
  options: string[];
  correctAnswer: number;
}

const Quiz = () => {
  const { topicId } = useParams();
  const location = useLocation();
  const { topicName } = location.state || {};
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [quizComplete, setQuizComplete] = useState(false);
  const [loading, setLoading] = useState(true);
  const [listening, setListening] = useState(false);
  const [tts] = useState(() => new TextToSpeech());
  const [stt] = useState(() => new SpeechToText());
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isAccessibilityMode } = useAccessibility();
  const { toast } = useToast();

  useEffect(() => {
    if (!user || !topicId) {
      navigate("/dashboard");
      return;
    }

    const fetchQuestions = async () => {
      try {
        const { data: topic, error } = await supabase
          .from("topics")
          .select("quiz_path")
          .eq("id", topicId)
          .single();

        if (error) throw error;

        const res = await fetch(topic.quiz_path);
        const text = await res.text();
        const parsed = parseQuiz(text);
        setQuestions(parsed);
      } catch (error: any) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, [user, topicId, navigate, toast]);

  const readQuestion = async () => {
    if (!isAccessibilityMode || questions.length === 0) return;

    const q = questions[currentQuestion];
    const text = `Pregunta ${currentQuestion + 1} de ${questions.length}. ${
      q.question
    }. ${q.options
      .map((opt, i) => `Opción ${String.fromCharCode(65 + i)}: ${opt}`)
      .join(". ")}`;
    await tts.speak(text);
  };

  useEffect(() => {
    if (isAccessibilityMode && questions.length > 0 && !quizComplete) {
      readQuestion();
    }
  }, [currentQuestion, isAccessibilityMode, questions, quizComplete]);

  const handleVoiceAnswer = async () => {
    if (!stt.isSupported()) {
      toast({
        title: "No soportado",
        description: "Tu navegador no soporta reconocimiento de voz",
        variant: "destructive",
      });
      return;
    }

    if (listening) return;
    setListening(true);
    try {
      tts.cancel();
      stt.stopListening();

      await new Promise((r) => setTimeout(r, 300));

      const answer = await stt.listen();
      // Convert A, B, C, D to 0, 1, 2, 3
      const answerIndex = answer.charCodeAt(0) - 65;
      if (
        answerIndex >= 0 &&
        answerIndex < questions[currentQuestion].options.length
      ) {
        setSelectedAnswer(answerIndex);
        await tts.speak(`Has seleccionado la opción ${answer}`);
      } else {
        await tts.speak("No entendí tu respuesta. Por favor di A, B, C o D");
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: String(error),
        variant: "destructive",
      });
    } finally {
      setListening(false);
    }
  };

  const handleNext = async () => {
    if (selectedAnswer === null) return;

    const isCorrect =
      selectedAnswer === questions[currentQuestion].correctAnswer;
    if (isCorrect) {
      setScore(score + 1);
      if (isAccessibilityMode) await tts.speak("¡Correcto!");
      toast({
        // title: "Error",
        description: "¡Correcto!",
        // variant: "destructive",
      });
    } else {
      if (isAccessibilityMode) await tts.speak("Incorrecto");
      toast({
        description: "¡Incorrecto!",
      });
    }

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
    } else {
      // Quiz complete
      const finalScore = Math.round(
        ((score + (isCorrect ? 1 : 0)) / questions.length) * 100
      );

      // Save progress
      await supabase.from("quiz_progress").insert({
        user_id: user!.id,
        topic_id: topicId!,
        score: finalScore,
      });

      setQuizComplete(true);
      if (isAccessibilityMode) {
        await tts.speak(
          `Cuestionario completado. Tu puntuación es ${finalScore} por ciento`
        );
      }
    }
  };

  const handleRetry = () => {
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setScore(0);
    setQuizComplete(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Cargando cuestionario...</p>
        </div>
      </div>
    );
  }

  if (quizComplete) {
    const finalScore = Math.round((score / questions.length) * 100);
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-lg">
          <CardHeader>
            <CardTitle className="text-center text-2xl">
              ¡Cuestionario Completado!
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-6">
            <div>
              <div className="text-6xl font-bold text-primary mb-2">
                {finalScore}%
              </div>
              <p className="text-muted-foreground">
                {score} de {questions.length} respuestas correctas
              </p>
            </div>
            <div className="flex gap-4 justify-center">
              <Button onClick={handleRetry} variant="outline">
                Intentar de Nuevo
              </Button>
              <Button onClick={() => navigate("/dashboard")}>
                Volver al Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const question = questions[currentQuestion];
  console.log(questions);
  const progress = ((currentQuestion + 1) / questions.length) * 100;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <Button variant="ghost" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
          <div className="mt-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">
                Pregunta {currentQuestion + 1} de {questions.length}
              </span>
              <span className="text-sm font-medium">
                {Math.round(progress)}%
              </span>
            </div>
            <Progress value={progress} />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">{question.question}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <RadioGroup
              value={selectedAnswer !== null ? selectedAnswer.toString() : ""}
              onValueChange={(v) => setSelectedAnswer(parseInt(v))}
            >
              {question.options.map((option, index) => (
                <Label
                  htmlFor={`option-${index}`}
                  className="cursor-pointer flex items-center space-x-3 p-4 border rounded-lg hover:bg-accent"
                  key={index}
                >
                  <RadioGroupItem
                    value={index.toString()}
                    id={`option-${index}`}
                  />
                  <div>
                    <span className="font-bold mr-2">
                      {String.fromCharCode(65 + index)}.
                    </span>
                    {option}
                  </div>
                </Label>
              ))}
            </RadioGroup>
            {isAccessibilityMode && (
              <div className="flex gap-4">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={handleVoiceAnswer}
                  disabled={listening}
                >
                  <Mic
                    className={`h-4 w-4 mr-2 ${
                      listening ? "animate-pulse" : ""
                    }`}
                  />
                  {listening ? "Escuchando..." : "Responder"}
                </Button>
                <Button variant="outline" onClick={readQuestion}>
                  <Volume2 className="h-4 w-4 mr-2" />
                  Repetir
                </Button>
              </div>
            )}

            <Button
              className="w-full"
              size="lg"
              onClick={handleNext}
              disabled={selectedAnswer === null}
            >
              {currentQuestion < questions.length - 1
                ? "Siguiente Pregunta"
                : "Finalizar"}
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Quiz;
