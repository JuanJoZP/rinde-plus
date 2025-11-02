import { useEffect, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useAccessibility } from "@/contexts/AccessibilityContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Volume2, Play, Pause } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { TextToSpeech } from "@/utils/speech";
import Markdown from "react-markdown";
import rehypeRaw from "rehype-raw";

const Lesson = () => {
  const { topicId } = useParams();
  const location = useLocation();
  const { topicName } = location.state || {};
  const [content, setContent] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [reading, setReading] = useState(false);
  const [tts] = useState(() => new TextToSpeech());
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isAccessibilityMode } = useAccessibility();
  const { toast } = useToast();

  useEffect(() => {
    if (!user || !topicId) {
      navigate("/dashboard");
      return;
    }

    const fetchContent = async () => {
      try {
        // Get topic content path
        const { data: topic, error } = await supabase
          .from("topics")
          .select("content_path")
          .eq("id", topicId)
          .single();

        if (error) throw error;

        fetch(topic.content_path)
          .then((res) => res.text())
          .then((text) => setContent(text))
          .catch((err) => console.error("Error cargando contenido:", err));
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

    fetchContent();
  }, [user, topicId, topicName, navigate, toast]);

  const handleStartQuiz = () => {
    navigate(`/quiz/${topicId}`, { state: { topicName } });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Cargando lección...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver
            </Button>
            <div>
              <h1 className="text-xl font-bold">{topicName}</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <Card>
          <CardContent className="pt-6">
            <article className="prose prose-lg max-w-none dark:prose-invert">
              <Markdown rehypePlugins={[rehypeRaw]}>{content}</Markdown>
            </article>
          </CardContent>
        </Card>

        <div className="mt-8 flex justify-center">
          <Button size="lg" onClick={handleStartQuiz}>
            Comenzar Cuestionario
          </Button>
        </div>
      </main>
    </div>
  );
};

export default Lesson;
