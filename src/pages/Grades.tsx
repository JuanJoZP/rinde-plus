import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const Grades = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      navigate("/auth");
    }
  }, [user, navigate]);

  const selectGrade = (grade: number) => {
  // Navigate to dashboard with grade in location state
    navigate("/dashboard", { state: { grade } });
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">RindePlus</h1>
            <p className="text-sm text-muted-foreground">Selecciona tu grado</p>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">Elige tu grado</h2>
          <p className="text-muted-foreground">
            Selecciona el grado para ver las materias disponibles
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[9, 10, 11].map((g) => (
            <Card
              key={g}
              className="cursor-pointer hover:shadow-lg transition-shadow"
            >
              <CardHeader>
                <CardTitle>Grado {g}</CardTitle>
                <CardDescription>
                  Accede a las materias de grado {g}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full" onClick={() => selectGrade(g)}>
                  Seleccionar
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
};

export default Grades;
