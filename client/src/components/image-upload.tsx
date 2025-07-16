import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Upload, X, Image } from "lucide-react";

interface ImageUploadProps {
  onImageUpload: (imageUrl: string) => void;
  currentImage?: string;
  label: string;
  placeholder?: string;
}

export default function ImageUpload({ onImageUpload, currentImage, label, placeholder }: ImageUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    setUploading(true);
    
    // Convert to base64 for display (in a real app, you'd upload to a service)
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      onImageUpload(result);
      setUploading(false);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const removeImage = () => {
    onImageUpload('');
  };

  return (
    <div>
      <label className="text-lg font-semibold text-darkgray mb-3 block">
        {label}
      </label>
      
      <Card 
        className={`cursor-pointer transition-all duration-300 ${
          isDragging ? 'border-coral border-2 bg-coral/10' : 'border-gray-200 hover:border-coral/50'
        }`}
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        onDragEnter={() => setIsDragging(true)}
        onDragLeave={() => setIsDragging(false)}
        onClick={() => fileInputRef.current?.click()}
      >
        <CardContent className="p-8">
          {currentImage ? (
            <div className="relative">
              <img 
                src={currentImage} 
                alt="Uploaded" 
                className="w-full h-40 object-cover rounded-lg mb-4"
              />
              <Button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  removeImage();
                }}
                className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white p-2 rounded-full"
                size="sm"
              >
                <X className="w-4 h-4" />
              </Button>
              <p className="text-center text-sm text-gray-600">
                Click to change image
              </p>
            </div>
          ) : (
            <div className="text-center">
              {uploading ? (
                <div className="flex flex-col items-center">
                  <Upload className="w-12 h-12 text-coral animate-pulse mb-4" />
                  <p className="text-coral font-semibold">Uploading...</p>
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <Image className="w-12 h-12 text-gray-400 mb-4" />
                  <p className="text-darkgray font-semibold mb-2">
                    {placeholder || "Upload an image"}
                  </p>
                  <p className="text-gray-600 text-sm">
                    Click here or drag and drop an image
                  </p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
      
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileInputChange}
        className="hidden"
      />
    </div>
  );
}