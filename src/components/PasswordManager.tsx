import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Plus, Eye, EyeOff, Copy, Trash2, Key } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const passwordSchema = z.object({
  platform_name: z.string().min(1, "El nombre de la plataforma es requerido").max(100),
  username: z.string().min(1, "El usuario es requerido").max(255),
  password: z.string().min(1, "La contraseña es requerida").max(500),
  description: z.string().max(500).optional(),
  token: z.string().max(500).optional(),
});

type PasswordFormData = z.infer<typeof passwordSchema>;

interface Password extends PasswordFormData {
  id: string;
  created_at: string;
}

const PasswordManager = () => {
  const { toast } = useToast();
  const [passwords, setPasswords] = useState<Password[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [visiblePasswords, setVisiblePasswords] = useState<Set<string>>(new Set());
  const [editingPassword, setEditingPassword] = useState<Password | null>(null);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
  });

  useEffect(() => {
    fetchPasswords();
  }, []);

  const fetchPasswords = async () => {
    try {
      const { data, error } = await supabase
        .from("passwords")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setPasswords(data || []);
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

  const onSubmit = async (data: PasswordFormData) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuario no autenticado");

      if (editingPassword) {
        const { error } = await supabase
          .from("passwords")
          .update(data)
          .eq("id", editingPassword.id);

        if (error) throw error;
        toast({
          title: "Contraseña actualizada",
          description: "La contraseña se actualizó correctamente.",
        });
      } else {
        const { error } = await supabase
          .from("passwords")
          .insert([{
            platform_name: data.platform_name,
            username: data.username,
            password: data.password,
            description: data.description || null,
            token: data.token || null,
            user_id: user.id
          }]);

        if (error) throw error;
        toast({
          title: "Contraseña guardada",
          description: "La contraseña se guardó correctamente.",
        });
      }

      setIsDialogOpen(false);
      reset();
      setEditingPassword(null);
      fetchPasswords();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Estás seguro de eliminar esta contraseña?")) return;

    try {
      const { error } = await supabase
        .from("passwords")
        .delete()
        .eq("id", id);

      if (error) throw error;
      toast({
        title: "Contraseña eliminada",
        description: "La contraseña se eliminó correctamente.",
      });
      fetchPasswords();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleEdit = (password: Password) => {
    setEditingPassword(password);
    reset(password);
    setIsDialogOpen(true);
  };

  const togglePasswordVisibility = (id: string) => {
    setVisiblePasswords(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copiado",
      description: `${label} copiado al portapapeles.`,
    });
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingPassword(null);
    reset({
      platform_name: "",
      username: "",
      password: "",
      description: "",
      token: "",
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Key className="w-6 h-6" />
            Gestor de Contraseñas
          </h2>
          <p className="text-white/70 mt-1">Almacena y gestiona tus contraseñas de forma segura</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          if (!open) handleCloseDialog();
          else setIsDialogOpen(true);
        }}>
          <DialogTrigger asChild>
            <Button className="bg-accent hover:bg-accent/90">
              <Plus className="w-4 h-4 mr-2" />
              Nueva Contraseña
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-primary/95 backdrop-blur-sm border-white/20 text-white">
            <DialogHeader>
              <DialogTitle>{editingPassword ? "Editar" : "Agregar"} Contraseña</DialogTitle>
              <DialogDescription className="text-white/70">
                {editingPassword ? "Modifica" : "Completa"} los datos de la contraseña
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <Label htmlFor="platform_name">Plataforma *</Label>
                <Input
                  id="platform_name"
                  {...register("platform_name")}
                  placeholder="Ej: Gmail, Netflix, etc."
                  className="bg-white/10 border-white/20 text-white"
                />
                {errors.platform_name && (
                  <p className="text-destructive text-sm mt-1">{errors.platform_name.message}</p>
                )}
              </div>
              <div>
                <Label htmlFor="username">Usuario *</Label>
                <Input
                  id="username"
                  {...register("username")}
                  placeholder="usuario@ejemplo.com"
                  className="bg-white/10 border-white/20 text-white"
                />
                {errors.username && (
                  <p className="text-destructive text-sm mt-1">{errors.username.message}</p>
                )}
              </div>
              <div>
                <Label htmlFor="password">Contraseña *</Label>
                <Input
                  id="password"
                  type="password"
                  {...register("password")}
                  placeholder="••••••••"
                  className="bg-white/10 border-white/20 text-white"
                />
                {errors.password && (
                  <p className="text-destructive text-sm mt-1">{errors.password.message}</p>
                )}
              </div>
              <div>
                <Label htmlFor="description">Descripción</Label>
                <Textarea
                  id="description"
                  {...register("description")}
                  placeholder="Notas adicionales..."
                  className="bg-white/10 border-white/20 text-white"
                />
              </div>
              <div>
                <Label htmlFor="token">Token (opcional)</Label>
                <Input
                  id="token"
                  {...register("token")}
                  placeholder="Token de autenticación"
                  className="bg-white/10 border-white/20 text-white"
                />
              </div>
              <div className="flex gap-2 justify-end">
                <Button type="button" variant="outline" onClick={handleCloseDialog} className="border-white/20 text-white hover:bg-white/10">
                  Cancelar
                </Button>
                <Button type="submit" className="bg-accent hover:bg-accent/90">
                  {editingPassword ? "Actualizar" : "Guardar"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {passwords.length === 0 ? (
        <Card className="bg-white/10 backdrop-blur-sm border-white/20">
          <CardContent className="py-12 text-center">
            <Key className="w-12 h-12 text-white/40 mx-auto mb-4" />
            <p className="text-white/60">No tienes contraseñas guardadas aún.</p>
            <p className="text-white/40 text-sm mt-2">Haz clic en "Nueva Contraseña" para comenzar.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {passwords.map((pwd) => (
            <Card key={pwd.id} className="bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/15 transition-colors">
              <CardHeader>
                <CardTitle className="text-white text-lg flex items-center justify-between">
                  <span className="truncate">{pwd.platform_name}</span>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(pwd)}
                      className="h-8 w-8 text-white/70 hover:text-white hover:bg-white/10"
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(pwd.id)}
                      className="h-8 w-8 text-destructive/70 hover:text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardTitle>
                <CardDescription className="text-white/60">
                  {pwd.username}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <Label className="text-xs text-white/60">Contraseña</Label>
                      <p className="text-white font-mono text-sm truncate">
                        {visiblePasswords.has(pwd.id) ? pwd.password : "••••••••"}
                      </p>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => togglePasswordVisibility(pwd.id)}
                        className="h-8 w-8 text-white/70 hover:text-white hover:bg-white/10"
                      >
                        {visiblePasswords.has(pwd.id) ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => copyToClipboard(pwd.password, "Contraseña")}
                        className="h-8 w-8 text-white/70 hover:text-white hover:bg-white/10"
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {pwd.token && (
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <Label className="text-xs text-white/60">Token</Label>
                        <p className="text-white font-mono text-sm truncate">
                          {visiblePasswords.has(pwd.id) ? pwd.token : "••••••••"}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => copyToClipboard(pwd.token!, "Token")}
                        className="h-8 w-8 text-white/70 hover:text-white hover:bg-white/10"
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </div>

                {pwd.description && (
                  <div>
                    <Label className="text-xs text-white/60">Descripción</Label>
                    <p className="text-white/80 text-sm line-clamp-2">{pwd.description}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default PasswordManager;
