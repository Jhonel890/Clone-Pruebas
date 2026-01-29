import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Cloud, Shield, Zap, HardDrive, Lock, Upload } from "lucide-react";
import { Link } from "react-router-dom";
import heroImage from "@/assets/hero-storage.jpg";

const Index = () => {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${heroImage})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-primary/95 via-primary/90 to-accent/30" />
        </div>
        
        <div className="relative z-10 container mx-auto px-4 text-center">
          <div className="max-w-4xl mx-auto">
            <div className="w-20 h-20 bg-gradient-to-br from-primary to-accent rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-glow animate-pulse">
              <Cloud className="w-10 h-10 text-white" />
            </div>
            
            <h1 className="text-6xl md:text-7xl font-bold text-white mb-6 animate-fade-in">
              Holdit
            </h1>
            
            <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-2xl mx-auto">
              Tu nube personal y segura. Almacena, gestiona y accede a tus archivos desde cualquier lugar.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="bg-accent hover:bg-accent/90 text-primary font-semibold shadow-glow">
                <Link to="/auth">Comenzar Gratis</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-white/20 text-white hover:bg-white/10 backdrop-blur-sm">
                <Link to="/dashboard">Ver Dashboard</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-4">
              Características Principales
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Todo lo que necesitas para gestionar tus archivos de forma segura y eficiente
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="border-border hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mb-4">
                  <Shield className="w-6 h-6 text-accent" />
                </div>
                <CardTitle>Seguridad Máxima</CardTitle>
                <CardDescription>
                  Tus archivos están protegidos con encriptación de extremo a extremo
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-border hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mb-4">
                  <Zap className="w-6 h-6 text-accent" />
                </div>
                <CardTitle>Acceso Rápido</CardTitle>
                <CardDescription>
                  Accede a tus archivos instantáneamente desde cualquier dispositivo
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-border hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mb-4">
                  <HardDrive className="w-6 h-6 text-accent" />
                </div>
                <CardTitle>Almacenamiento Ilimitado</CardTitle>
                <CardDescription>
                  Espacio generoso para todos tus archivos importantes
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-border hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mb-4">
                  <Lock className="w-6 h-6 text-accent" />
                </div>
                <CardTitle>Privacidad Total</CardTitle>
                <CardDescription>
                  Solo tú tienes acceso a tus archivos. Sin excepciones.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-border hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mb-4">
                  <Upload className="w-6 h-6 text-accent" />
                </div>
                <CardTitle>Subida Rápida</CardTitle>
                <CardDescription>
                  Sube archivos de cualquier tamaño de forma rápida y segura
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-border hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mb-4">
                  <Cloud className="w-6 h-6 text-accent" />
                </div>
                <CardTitle>100% Local</CardTitle>
                <CardDescription>
                  Ejecuta todo localmente en tu PC. Tú tienes el control total.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-br from-primary via-primary/90 to-accent/20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            ¿Listo para comenzar?
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Únete a Holdit hoy y lleva tu almacenamiento personal al siguiente nivel
          </p>
          <Button asChild size="lg" className="bg-accent hover:bg-accent/90 text-primary font-semibold shadow-glow">
            <Link to="/auth">Crear Cuenta Gratis</Link>
          </Button>
        </div>
      </section>
    </div>
  );
};

export default Index;
