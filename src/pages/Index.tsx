import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { BookOpen, Volume2, Mic } from 'lucide-react';

const Index = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && user) {
      navigate('/dashboard');
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-secondary/10">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center">
          <div className="mb-8">
            <h1 className="text-6xl font-bold mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              📚 EduAccess
            </h1>
            <p className="text-2xl text-muted-foreground mb-8">
              Educación Accesible para Todos
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <div className="bg-card p-6 rounded-lg border shadow-sm">
              <BookOpen className="h-12 w-12 mx-auto mb-4 text-primary" />
              <h3 className="font-bold mb-2">Contenido Rico</h3>
              <p className="text-sm text-muted-foreground">
                Lecciones interactivas con texto, videos y cuestionarios
              </p>
            </div>
            <div className="bg-card p-6 rounded-lg border shadow-sm">
              <Volume2 className="h-12 w-12 mx-auto mb-4 text-secondary" />
              <h3 className="font-bold mb-2">Lectura en Voz Alta</h3>
              <p className="text-sm text-muted-foreground">
                Todo el contenido puede ser leído en voz alta
              </p>
            </div>
            <div className="bg-card p-6 rounded-lg border shadow-sm">
              <Mic className="h-12 w-12 mx-auto mb-4 text-accent" />
              <h3 className="font-bold mb-2">Entrada por Voz</h3>
              <p className="text-sm text-muted-foreground">
                Responde cuestionarios usando tu voz
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <Button size="lg" className="text-lg px-8" onClick={() => navigate('/auth')}>
              Comenzar Ahora
            </Button>
            <p className="text-sm text-muted-foreground">
              Totalmente accesible para estudiantes con discapacidad visual
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
