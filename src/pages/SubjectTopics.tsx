import { useEffect, useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Topic {
  id: string;
  name: string;
  display_order: number;
}

interface TopicProgress {
  topicId: string;
  score: number;
}

const SubjectTopics = () => {
  const { subjectId } = useParams();
  const location = useLocation();
  const { subjectName } = location.state || {};
  const [topics, setTopics] = useState<Topic[]>([]);
  const [progress, setProgress] = useState<Map<string, number>>(new Map());
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (!user || !subjectId) {
      navigate('/dashboard');
      return;
    }

    const fetchTopicsAndProgress = async () => {
      try {
        // Fetch topics for this subject
        const { data: topicsData, error: topicsError } = await supabase
          .from('topics')
          .select('*')
          .eq('subject_id', subjectId)
          .order('display_order');

        if (topicsError) throw topicsError;

        setTopics(topicsData || []);

        // Fetch user's progress for these topics
        if (topicsData && topicsData.length > 0) {
          const topicIds = topicsData.map(t => t.id);
          const { data: progressData } = await supabase
            .from('quiz_progress')
            .select('topic_id, score')
            .eq('user_id', user.id)
            .in('topic_id', topicIds);

          // Get latest score for each topic
          const progressMap = new Map<string, number>();
          progressData?.forEach((p: any) => {
            const currentScore = progressMap.get(p.topic_id) || 0;
            progressMap.set(p.topic_id, Math.max(currentScore, p.score));
          });

          setProgress(progressMap);
        }
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

    fetchTopicsAndProgress();
  }, [user, subjectId, navigate, toast]);

  const handleTopicClick = (topic: Topic) => {
    navigate(`/lesson/${topic.id}`, { state: { topicName: topic.name } });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Cargando temas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <Button variant="ghost" onClick={() => navigate('/dashboard')} className="mb-2">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver al Dashboard
          </Button>
          <h1 className="text-3xl font-bold">{subjectName}</h1>
          <p className="text-muted-foreground">Selecciona un tema para comenzar</p>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {topics.map((topic) => {
            const score = progress.get(topic.id) || 0;
            return (
              <Card
                key={topic.id}
                className="cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => handleTopicClick(topic)}
              >
                <CardHeader>
                  <CardTitle>{topic.name}</CardTitle>
                  <CardDescription>
                    {score > 0 ? `Progreso: ${score}%` : 'Sin comenzar'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Progress value={score} className="mb-4" />
                  <Button className="w-full">
                    {score > 0 ? 'Continuar' : 'Comenzar'}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {topics.length === 0 && (
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-muted-foreground">
                No hay temas disponibles para esta materia aún.
              </p>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
};

export default SubjectTopics;
