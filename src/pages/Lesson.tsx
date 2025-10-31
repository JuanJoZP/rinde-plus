import { useEffect, useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useAccessibility } from '@/contexts/AccessibilityContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, Volume2, Play, Pause } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { TextToSpeech } from '@/utils/speech';
import ReactMarkdown from 'react-markdown';

const Lesson = () => {
  const { topicId } = useParams();
  const location = useLocation();
  const { topicName } = location.state || {};
  const [content, setContent] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [reading, setReading] = useState(false);
  const [tts] = useState(() => new TextToSpeech());
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isAccessibilityMode } = useAccessibility();
  const { toast } = useToast();

  useEffect(() => {
    if (!user || !topicId) {
      navigate('/dashboard');
      return;
    }

    const fetchContent = async () => {
      try {
        // Get topic content path
        const { data: topic, error } = await supabase
          .from('topics')
          .select('content_path')
          .eq('id', topicId)
          .single();

        if (error) throw error;

        // For MVP, using sample content
        // In production, fetch from Supabase Storage
        setContent(`# ${topicName}

## Introducción

En esta lección aprenderás sobre ${topicName}. Este es un tema fundamental que te ayudará a comprender conceptos más avanzados.

## Contenido Principal

### Concepto 1

Este es el primer concepto importante que debes comprender. Presta atención a los detalles y ejemplos.

**Ejemplo:**
- Punto importante 1
- Punto importante 2
- Punto importante 3

### Concepto 2

Aquí exploramos el segundo concepto clave. Asegúrate de entender cómo se relaciona con el concepto anterior.

### Video Educativo

A continuación puedes ver un video explicativo sobre este tema:

<iframe width="560" height="315" src="https://www.youtube.com/embed/dQw4w9WgXcQ" title="Video educativo" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>

## Resumen

Recuerda los puntos clave de esta lección antes de continuar al cuestionario.`);

      } catch (error: any) {
        toast({
          title: 'Error',
          description: error.message,
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchContent();
  }, [user, topicId, topicName, navigate, toast]);

  const handleReadAloud = async () => {
    if (reading) {
      tts.cancel();
      setReading(false);
    } else {
      setReading(true);
      // Remove markdown formatting for speech
      const plainText = content
        .replace(/#{1,6}\s/g, '')
        .replace(/\*\*/g, '')
        .replace(/\*/g, '')
        .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1')
        .replace(/<[^>]*>/g, '');
      
      await tts.speak(plainText);
      setReading(false);
    }
  };

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
          {isAccessibilityMode && (
            <Button onClick={handleReadAloud} variant="outline">
              {reading ? <Pause className="h-4 w-4 mr-2" /> : <Play className="h-4 w-4 mr-2" />}
              {reading ? 'Pausar' : 'Leer en Voz Alta'}
            </Button>
          )}
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <Card>
          <CardContent className="pt-6">
            <article className="prose prose-lg max-w-none dark:prose-invert">
              <ReactMarkdown>{content}</ReactMarkdown>
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
