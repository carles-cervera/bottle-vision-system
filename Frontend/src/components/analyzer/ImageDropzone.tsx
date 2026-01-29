import { useCallback, useState } from "react";
import { Upload, X, Image as ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface ImageDropzoneProps {
  onImageSelect: (file: File, preview: string) => void;
  selectedImage: { file: File; preview: string } | null;
  onClear: () => void;
  disabled?: boolean;
}

export function ImageDropzone({ onImageSelect, selectedImage, onClear, disabled }: ImageDropzoneProps) {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    if (disabled) return;
    
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = () => {
        onImageSelect(file, reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  }, [onImageSelect, disabled]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = () => {
        onImageSelect(file, reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  }, [onImageSelect]);

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  if (selectedImage) {
    return (
      <div className="relative rounded-lg border-2 border-border bg-card p-4">
        <button
          onClick={onClear}
          disabled={disabled}
          className="absolute top-2 right-2 p-1 rounded-full bg-destructive/10 hover:bg-destructive/20 text-destructive transition-colors disabled:opacity-50"
        >
          <X className="w-4 h-4" />
        </button>
        
        <div className="flex items-center gap-4">
          <div className="w-24 h-24 rounded-lg overflow-hidden bg-secondary flex-shrink-0">
            <img 
              src={selectedImage.preview} 
              alt="Preview" 
              className="w-full h-full object-cover"
            />
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-muted-foreground" />
              <span className="font-medium text-card-foreground truncate">
                {selectedImage.file.name}
              </span>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              {formatFileSize(selectedImage.file.size)}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
      onDragLeave={() => setIsDragOver(false)}
      onDrop={handleDrop}
      className={cn(
        "relative rounded-lg border-2 border-dashed p-8 transition-all duration-200",
        "flex flex-col items-center justify-center text-center",
        isDragOver && !disabled
          ? "border-primary bg-primary/5"
          : "border-border hover:border-primary/50 hover:bg-secondary/30",
        disabled && "opacity-50 cursor-not-allowed"
      )}
    >
      <input
        type="file"
        accept="image/jpeg,image/png"
        onChange={handleFileSelect}
        disabled={disabled}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
      />
      
      <div className={cn(
        "w-12 h-12 rounded-full flex items-center justify-center mb-4",
        isDragOver ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"
      )}>
        <Upload className="w-6 h-6" />
      </div>
      
      <p className="font-medium text-card-foreground">
        Arrossega una imatge aquí
      </p>
      <p className="text-sm text-muted-foreground mt-1">
        o fes clic per seleccionar un fitxer
      </p>
      <p className="text-xs text-muted-foreground mt-3">
        Formats admesos: JPG, PNG · Màx. 10 MB
      </p>
    </div>
  );
}
