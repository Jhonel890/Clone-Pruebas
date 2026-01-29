import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Cloud, Upload, File, LogOut, Folder } from "lucide-react";
import type { User } from "@supabase/supabase-js";
import PasswordManager from "@/components/PasswordManager";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import FileUpload from "@/components/FileUpload";
import FileList from "@/components/FileList";

const Dashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [fileRefreshTrigger, setFileRefreshTrigger] = useState(0);

  useEffect(() => {
    // Set up auth listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (!session) {
        navigate("/auth");
      }
    });

    // Check initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
      
      if (!session) {
        navigate("/auth");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast({
      title: "Sesión cerrada",
      description: "Has cerrado sesión exitosamente.",
    });
    navigate("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary via-primary/90 to-accent/20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary via-primary/90 to-accent/20">
      {/* Header */}
      <header className="border-b border-white/10 bg-primary/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center shadow-glow">
              <Cloud className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white">Holdit</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-white/80">{user?.email}</span>
            <Button variant="outline" onClick={handleSignOut} className="border-white/20 text-white hover:bg-white/10">
              <LogOut className="w-4 h-4 mr-2" />
              Cerrar Sesión
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="files" className="w-full">
          <TabsList className="bg-white/10 border-white/20 mb-8">
            <TabsTrigger value="files" className="data-[state=active]:bg-accent data-[state=active]:text-white">
              Archivos
            </TabsTrigger>
            <TabsTrigger value="passwords" className="data-[state=active]:bg-accent data-[state=active]:text-white">
              Contraseñas
            </TabsTrigger>
          </TabsList>

          <TabsContent value="files" className="space-y-8">
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-white mb-2">Mis Archivos</h2>
              <p className="text-white/70">Gestiona tu almacenamiento personal en la nube</p>
            </div>

        {/* Upload Section */}
        <Card className="mb-8 bg-white/10 backdrop-blur-sm border-white/20 shadow-xl">
          <CardHeader>
            <CardTitle className="text-white">Subir Archivos</CardTitle>
            <CardDescription className="text-white/70">
              Arrastra archivos aquí o haz clic para seleccionar
            </CardDescription>
          </CardHeader>
          <CardContent>
            {user && <FileUpload user={user} onUploadComplete={() => setFileRefreshTrigger(prev => prev + 1)} />}
          </CardContent>
        </Card>

        {/* Files List */}
        {user && <FileList user={user} refreshTrigger={fileRefreshTrigger} />}


            {/* Storage Stats */}
            <Card className="mt-8 bg-white/10 backdrop-blur-sm border-white/20">
              <CardHeader>
                <CardTitle className="text-white">Almacenamiento</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm text-white/80">
                    <span>0 GB usado de 10 GB</span>
                    <span>0%</span>
                  </div>
                  <div className="w-full h-2 bg-white/20 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-accent to-accent/80 rounded-full" style={{ width: "0%" }} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="passwords">
            <PasswordManager />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Dashboard;
