import { useState, useRef, useCallback } from "react";
import { Upload } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { User } from "@supabase/supabase-js";

interface FileUploadProps {
  user: User;
  onUploadComplete?: () => void;
}

const FileUpload = ({ user, onUploadComplete }: FileUploadProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFiles = async (files: FileList) => {
    if (files.length === 0) return;

    setIsUploading(true);
    
    try {
      // Verificar que el usuario está autenticado
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({
          title: "Error de autenticación",
          description: "Debes iniciar sesión para subir archivos.",
          variant: "destructive",
        });
        return;
      }

      const uploadPromises = Array.from(files).map(async (file) => {
        const filePath = `${user.id}/${Date.now()}-${file.name}`;
        
        const { error } = await supabase.storage
          .from('user-files')
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false
          });

        if (error) {
          console.error("Upload error:", error);
          throw error;
        }
        return file.name;
      });

      const uploadedFiles = await Promise.all(uploadPromises);
      toast({
        title: "Archivos subidos",
        description: `${uploadedFiles.length} archivo(s) subido(s) exitosamente.`,
      });
      onUploadComplete?.();
    } catch (error: any) {
      console.error("Error uploading files:", error);
      toast({
        title: "Error al subir archivos",
        description: error.message || "Hubo un error al subir los archivos.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    await handleFiles(files);
  }, [user]);

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      await handleFiles(files);
    }
  };

  return (
    <div
      onClick={handleClick}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors cursor-pointer ${
        isDragging
          ? "border-accent bg-accent/10"
          : "border-white/30 hover:border-accent"
      } ${isUploading ? "opacity-50 pointer-events-none" : ""}`}
    >
      <input
        ref={fileInputRef}
        type="file"
        multiple
        onChange={handleFileInputChange}
        className="hidden"
      />
      <Upload className="w-12 h-12 text-accent mx-auto mb-4" />
      <p className="text-white mb-2">
        {isUploading ? "Subiendo archivos..." : "Haz clic para subir archivos"}
      </p>
      <p className="text-sm text-white/60">o arrastra y suelta aquí</p>
    </div>
  );
};

export default FileUpload;