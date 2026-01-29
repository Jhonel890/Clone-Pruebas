import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { File, Download, Trash2, FileText, Image, Video, Music, ExternalLink } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { User } from "@supabase/supabase-js";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface FileListProps {
  user: User;
  refreshTrigger?: number;
}

interface FileItem {
  name: string;
  size: number;
  created_at: string;
  path: string;
  category: 'documentos' | 'imagenes' | 'videos';
}

type FileCategory = 'documentos' | 'imagenes' | 'videos';

const getFileCategory = (fileName: string): FileCategory => {
  const ext = fileName.split('.').pop()?.toLowerCase();
  
  const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp', 'ico'];
  const videoExtensions = ['mp4', 'avi', 'mov', 'mkv', 'wmv', 'flv', 'webm', 'm4v'];
  const documentExtensions = ['pdf', 'doc', 'docx', 'txt', 'xls', 'xlsx', 'ppt', 'pptx', 'odt', 'rtf', 'csv'];
  
  if (imageExtensions.includes(ext || '')) return 'imagenes';
  if (videoExtensions.includes(ext || '')) return 'videos';
  if (documentExtensions.includes(ext || '')) return 'documentos';
  
  return 'documentos'; // Default category
};

const getFileIcon = (fileName: string) => {
  const ext = fileName.split('.').pop()?.toLowerCase();
  
  if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp', 'ico'].includes(ext || '')) {
    return <Image className="w-5 h-5 text-blue-400" />;
  }
  if (['mp4', 'avi', 'mov', 'mkv', 'wmv', 'flv', 'webm', 'm4v'].includes(ext || '')) {
    return <Video className="w-5 h-5 text-purple-400" />;
  }
  if (['mp3', 'wav', 'ogg', 'm4a'].includes(ext || '')) {
    return <Music className="w-5 h-5 text-green-400" />;
  }
  if (['pdf', 'doc', 'docx', 'txt', 'xls', 'xlsx', 'ppt', 'pptx'].includes(ext || '')) {
    return <FileText className="w-5 h-5 text-orange-400" />;
  }
  
  return <File className="w-5 h-5 text-gray-400" />;
};

const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
};

const FileList = ({ user, refreshTrigger }: FileListProps) => {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<FileCategory | 'todos'>('todos');
  const { toast } = useToast();

  const loadFiles = async () => {
    try {
      const { data, error } = await supabase.storage
        .from('user-files')
        .list(user.id, {
          sortBy: { column: 'created_at', order: 'desc' }
        });

      if (error) throw error;

      const fileItems: FileItem[] = (data || []).map(file => ({
        name: file.name,
        size: file.metadata?.size || 0,
        created_at: file.created_at,
        path: `${user.id}/${file.name}`,
        category: getFileCategory(file.name)
      }));

      setFiles(fileItems);
    } catch (error) {
      console.error("Error loading files:", error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los archivos.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFiles();
  }, [user, refreshTrigger]);

  const getCategoryCount = (category: FileCategory) => {
    return files.filter(f => f.category === category).length;
  };

  const filteredFiles = activeCategory === 'todos' 
    ? files 
    : files.filter(f => f.category === activeCategory);

  const handleOpenFile = async (file: FileItem) => {
    try {
      const { data, error } = await supabase.storage
        .from('user-files')
        .createSignedUrl(file.path, 3600); // URL válida por 1 hora

      if (error) throw error;

      if (data?.signedUrl) {
        window.open(data.signedUrl, '_blank');
      }
    } catch (error) {
      console.error("Error opening file:", error);
      toast({
        title: "Error",
        description: "No se pudo abrir el archivo.",
        variant: "destructive",
      });
    }
  };

  const handleDownload = async (file: FileItem) => {
    try {
      const { data, error } = await supabase.storage
        .from('user-files')
        .download(file.path);

      if (error) throw error;

      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "Descarga iniciada",
        description: `Descargando ${file.name}`,
      });
    } catch (error) {
      console.error("Error downloading file:", error);
      toast({
        title: "Error",
        description: "No se pudo descargar el archivo.",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (file: FileItem) => {
    try {
      const { error } = await supabase.storage
        .from('user-files')
        .remove([file.path]);

      if (error) throw error;

      setFiles(files.filter(f => f.path !== file.path));
      toast({
        title: "Archivo eliminado",
        description: `${file.name} ha sido eliminado.`,
      });
    } catch (error) {
      console.error("Error deleting file:", error);
      toast({
        title: "Error",
        description: "No se pudo eliminar el archivo.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <Card className="bg-white/10 backdrop-blur-sm border-white/20">
        <CardContent className="p-8 text-center">
          <p className="text-white/70">Cargando archivos...</p>
        </CardContent>
      </Card>
    );
  }

  const renderFileList = (filesToRender: FileItem[]) => {
    if (filesToRender.length === 0) {
      return (
        <div className="p-8 text-center">
          <File className="w-12 h-12 text-white/40 mx-auto mb-4" />
          <p className="text-white/70">No hay archivos en esta categoría</p>
        </div>
      );
    }

    return (
      <div className="space-y-2">
        {filesToRender.map((file) => (
          <div
            key={file.path}
            className="flex items-center justify-between p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
            onClick={() => handleOpenFile(file)}
          >
            <div className="flex items-center gap-3 flex-1 min-w-0">
              {getFileIcon(file.name)}
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-medium truncate">{file.name}</p>
                <p className="text-white/60 text-xs">{formatFileSize(file.size)}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => { e.stopPropagation(); handleOpenFile(file); }}
                className="text-white hover:bg-white/10"
                title="Abrir en navegador"
              >
                <ExternalLink className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => { e.stopPropagation(); handleDownload(file); }}
                className="text-white hover:bg-white/10"
                title="Descargar"
              >
                <Download className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => { e.stopPropagation(); handleDelete(file); }}
                className="text-red-400 hover:bg-red-400/10"
                title="Eliminar"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <Card className="bg-white/10 backdrop-blur-sm border-white/20">
        <CardContent className="p-8 text-center">
          <p className="text-white/70">Cargando archivos...</p>
        </CardContent>
      </Card>
    );
  }

  if (files.length === 0) {
    return (
      <Card className="bg-white/10 backdrop-blur-sm border-white/20">
        <CardContent className="p-8 text-center">
          <File className="w-12 h-12 text-white/40 mx-auto mb-4" />
          <p className="text-white/70">No hay archivos subidos</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white/10 backdrop-blur-sm border-white/20">
      <CardHeader>
        <CardTitle className="text-white">
          Archivos Subidos ({files.length})
        </CardTitle>
        <div className="flex gap-2 mt-4">
          <div className="text-sm text-white/70">
            <FileText className="w-4 h-4 inline mr-1" />
            Documentos: {getCategoryCount('documentos')}
          </div>
          <div className="text-sm text-white/70">
            <Image className="w-4 h-4 inline mr-1" />
            Imágenes: {getCategoryCount('imagenes')}
          </div>
          <div className="text-sm text-white/70">
            <Video className="w-4 h-4 inline mr-1" />
            Videos: {getCategoryCount('videos')}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="todos" value={activeCategory} onValueChange={(v) => setActiveCategory(v as any)}>
          <TabsList className="bg-white/10 border-white/20 mb-4 w-full grid grid-cols-4">
            <TabsTrigger value="todos" className="data-[state=active]:bg-accent">
              Todos ({files.length})
            </TabsTrigger>
            <TabsTrigger value="documentos" className="data-[state=active]:bg-accent">
              <FileText className="w-4 h-4 mr-1" />
              Documentos ({getCategoryCount('documentos')})
            </TabsTrigger>
            <TabsTrigger value="imagenes" className="data-[state=active]:bg-accent">
              <Image className="w-4 h-4 mr-1" />
              Imágenes ({getCategoryCount('imagenes')})
            </TabsTrigger>
            <TabsTrigger value="videos" className="data-[state=active]:bg-accent">
              <Video className="w-4 h-4 mr-1" />
              Videos ({getCategoryCount('videos')})
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="todos">
            {renderFileList(files)}
          </TabsContent>
          
          <TabsContent value="documentos">
            {renderFileList(files.filter(f => f.category === 'documentos'))}
          </TabsContent>
          
          <TabsContent value="imagenes">
            {renderFileList(files.filter(f => f.category === 'imagenes'))}
          </TabsContent>
          
          <TabsContent value="videos">
            {renderFileList(files.filter(f => f.category === 'videos'))}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default FileList;