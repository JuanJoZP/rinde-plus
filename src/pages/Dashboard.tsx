import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useAccessibility } from "@/contexts/AccessibilityContext";
import { LogOut, Volume2, VolumeX } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Subject {
  id: string;
  name: string;
  icon: string;
  display_order: number;
}

const Dashboard = () => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [userGrade, setUserGrade] = useState<number>(9);
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { isAccessibilityMode, toggleAccessibilityMode } = useAccessibility();
  const { toast } = useToast();

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }

    const fetchData = async () => {
      try {
        // Determine grade from navigation state first, then sessionStorage
        const navState =
          (window.history.state && (window.history.state.state as any)) || {};
        const selectedFromState = navState.grade;

        let gradeToUse: number | null = null;
        if (selectedFromState) {
          gradeToUse = Number(selectedFromState);
        }

        if (!gradeToUse) {
          // Fallback: try to read from profiles table as before
          const { data: profile } = await supabase
            .from("profiles")
            .select("grade")
            .eq("user_id", user.id)
            .single();

          if (profile) gradeToUse = profile.grade;
        }

        if (!gradeToUse) {
          toast({
            title: "Error",
            description: "No se pudo determinar el grado del usuario.",
            variant: "destructive",
          });
          setSubjects([]);
          setLoading(false);
          return;
        }

        setUserGrade(gradeToUse);

        // Fetch subjects for the determined grade
        const { data: subjectsData, error } = await supabase
          .from("subjects")
          .select("*")
          .eq("grade", gradeToUse)
          .order("display_order");

        if (error) throw error;
        setSubjects(subjectsData || []);
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

    fetchData();
  }, [user, navigate, toast]);

  const handleSubjectClick = (subjectId: string, subjectName: string) => {
    navigate(`/subjects/${subjectId}`, { state: { subjectName } });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">RindePlus</h1>
            <p className="text-sm text-muted-foreground">Grado {userGrade}</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              {isAccessibilityMode ? (
                <Volume2 className="h-4 w-4" />
              ) : (
                <VolumeX className="h-4 w-4" />
              )}
              <Switch
                checked={isAccessibilityMode}
                onCheckedChange={toggleAccessibilityMode}
                aria-label="Modo de accesibilidad"
              />
              <Label className="text-sm">Modo Accesible</Label>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate("/grades")}
                aria-label="Volver a Grados"
              >
                Volver a Grados
              </Button>
              <Button variant="outline" size="sm" onClick={signOut}>
                <LogOut className="h-4 w-4 mr-2" />
                Salir
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">Tus Materias</h2>
          <p className="text-muted-foreground">
            Selecciona una materia para comenzar a estudiar
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {subjects.map((subject) => (
            <Card
              key={subject.id}
              className="cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => handleSubjectClick(subject.id, subject.name)}
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="text-4xl">{subject.icon}</div>
                </div>
                <CardTitle className="mt-4">{subject.name}</CardTitle>
                <CardDescription>
                  Toca para ver los temas disponibles
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full" variant="outline">
                  Ver Temas
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {subjects.length === 0 && (
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-muted-foreground">
                No hay materias disponibles para tu grado aún.
              </p>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
