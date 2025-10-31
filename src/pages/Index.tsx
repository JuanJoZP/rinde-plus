import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { BookOpen, Volume2, Mic } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && user) {
      navigate("/dashboard");
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
    <div className="min-h-[100dvh] overflow-hidden bg-gradient-to-br from-primary/10 via-background to-secondary/10 flex items-center justify-center">
      <div className="container px-10 py-6 md:py-12 flex flex-col justify-center items-center text-center max-w-4xl">
        {/* Logo */}
        <div className="mb-6 flex justify-center items-center shrink-0">
          <img
            src="logo.png"
            alt="logo"
            className="w-48 h-48 md:w-80 md:h-80 object-contain"
          />
        </div>

        {/* Grid de features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-8 w-full">
          <div className="bg-card p-4 md:p-6 rounded-lg border shadow-sm">
            <BookOpen className="h-10 w-10 md:h-12 md:w-12 mx-auto mb-3 text-primary" />
            <h3 className="font-bold mb-1 md:mb-2 text-base md:text-lg">
              Contenido Rico
            </h3>
            <p className="text-sm text-muted-foreground">
              Lecciones interactivas con texto, videos y cuestionarios
            </p>
          </div>

          <div className="bg-card p-4 md:p-6 rounded-lg border shadow-sm">
            <Volume2 className="h-10 w-10 md:h-12 md:w-12 mx-auto mb-3 text-secondary" />
            <h3 className="font-bold mb-1 md:mb-2 text-base md:text-lg">
              Lectura en Voz Alta
            </h3>
            <p className="text-sm text-muted-foreground">
              Todo el contenido puede ser leído en voz alta
            </p>
          </div>

          <div className="bg-card p-4 md:p-6 rounded-lg border shadow-sm">
            <Mic className="h-10 w-10 md:h-12 md:w-12 mx-auto mb-3 text-accent" />
            <h3 className="font-bold mb-1 md:mb-2 text-base md:text-lg">
              Entrada por Voz
            </h3>
            <p className="text-sm text-muted-foreground">
              Responde cuestionarios usando tu voz
            </p>
          </div>
        </div>

        {/* Botón */}
        <div className="space-y-3 md:space-y-4">
          <Button
            size="lg"
            className="text-base md:text-lg px-6 md:px-8"
            onClick={() => navigate("/auth")}
          >
            Comenzar Ahora
          </Button>
          <p className="text-xs md:text-sm text-muted-foreground">
            Totalmente accesible para estudiantes con discapacidad visual
          </p>
        </div>
      </div>
    </div>
  );
};

export default Index;
