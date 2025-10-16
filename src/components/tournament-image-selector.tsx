'use client';

import { useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, Check, ImageIcon, X, Loader2, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TOURNAMENT_IMAGES, getImagesByCategory, type TournamentImage } from '@/lib/tournament-images';
import { createClient } from '@/lib/supabase/client';
import { ImageCropModal } from '@/components/image-crop-modal';

interface TournamentImageSelectorProps {
  value?: string;
  onChange: (imageUrl: string) => void;
  tournamentId?: string;
  variant?: 'indoor_6x6' | 'beach_2x2';
}

export function TournamentImageSelector({
  value,
  onChange,
  tournamentId,
  variant,
}: TournamentImageSelectorProps) {
  const [selectedImage, setSelectedImage] = useState<string>(value || '');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [imageToCrop, setImageToCrop] = useState<string | null>(null);
  const [croppedBlob, setCroppedBlob] = useState<Blob | null>(null);

  // Filtrer les images selon le variant
  const suggestedImages = variant
    ? variant === 'beach_2x2'
      ? getImagesByCategory('beach')
      : getImagesByCategory('indoor')
    : TOURNAMENT_IMAGES;

  const handleImageSelect = (imageUrl: string) => {
    // Ouvrir le modal de crop au lieu de sélectionner directement
    setImageToCrop(imageUrl);
    setCropModalOpen(true);
  };

  const handleRemoveImage = () => {
    setSelectedImage('');
    setPreviewUrl(null);
    setCroppedBlob(null);
    setUploadError(null);
    onChange('');
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validation du fichier
    const maxSize = 5 * 1024 * 1024; // 5MB
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/avif'];

    if (file.size > maxSize) {
      setUploadError('Le fichier est trop volumineux (max 5MB)');
      return;
    }

    if (!allowedTypes.includes(file.type)) {
      setUploadError('Format de fichier non supporté (JPEG, PNG, WebP, AVIF uniquement)');
      return;
    }

    setUploadError(null);

    // Créer une URL temporaire pour le crop
    const tempUrl = URL.createObjectURL(file);
    setImageToCrop(tempUrl);
    setCropModalOpen(true);
  };

  const handleCropComplete = async (blob: Blob, croppedUrl: string) => {
    // Vérifier si c'est une image de la galerie (Unsplash) ou un upload
    const isGalleryImage = imageToCrop && TOURNAMENT_IMAGES.some(img => img.url === imageToCrop);
    
    if (isGalleryImage) {
      // Pour les images de la galerie, on upload l'image croppée
      setIsUploading(true);
      setUploadError(null);

      try {
        const supabase = createClient();
        
        // Récupérer l'utilisateur courant
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          throw new Error('Vous devez être connecté pour uploader une image');
        }

        // Générer un nom de fichier unique
        const fileName = `${user.id}/${tournamentId || Date.now()}_${Math.random().toString(36).substring(7)}.jpg`;

        // Upload du blob croppé vers Supabase Storage
        const { data, error } = await supabase.storage
          .from('tournament-images')
          .upload(fileName, blob, {
            cacheControl: '3600',
            upsert: false,
            contentType: 'image/jpeg',
          });

        if (error) throw error;

        // Obtenir l'URL publique
        const { data: { publicUrl } } = supabase.storage
          .from('tournament-images')
          .getPublicUrl(data.path);

        // Mettre à jour la sélection
        setSelectedImage(publicUrl);
        setPreviewUrl(croppedUrl);
        setCroppedBlob(blob);
        onChange(publicUrl);
      } catch (error: any) {
        console.error('Erreur upload:', error);
        setUploadError(error.message || 'Erreur lors de l\'upload de l\'image');
      } finally {
        setIsUploading(false);
      }
    } else {
      // Pour les images uploadées par l'utilisateur
      setIsUploading(true);
      setUploadError(null);

      try {
        const supabase = createClient();
        
        // Récupérer l'utilisateur courant
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          throw new Error('Vous devez être connecté pour uploader une image');
        }

        // Générer un nom de fichier unique
        const fileName = `${user.id}/${tournamentId || Date.now()}_${Math.random().toString(36).substring(7)}.jpg`;

        // Upload du blob croppé vers Supabase Storage
        const { data, error } = await supabase.storage
          .from('tournament-images')
          .upload(fileName, blob, {
            cacheControl: '3600',
            upsert: false,
            contentType: 'image/jpeg',
          });

        if (error) throw error;

        // Obtenir l'URL publique
        const { data: { publicUrl } } = supabase.storage
          .from('tournament-images')
          .getPublicUrl(data.path);

        // Mettre à jour la sélection
        setSelectedImage(publicUrl);
        setPreviewUrl(croppedUrl);
        setCroppedBlob(blob);
        onChange(publicUrl);
      } catch (error: any) {
        console.error('Erreur upload:', error);
        setUploadError(error.message || 'Erreur lors de l\'upload de l\'image');
      } finally {
        setIsUploading(false);
      }
    }
  };

  const isCustomImage = selectedImage && !TOURNAMENT_IMAGES.some(img => img.url === selectedImage);

  return (
    <div className="space-y-4">
      <Label className="text-base font-semibold">Image du tournoi</Label>
      
      <Tabs defaultValue="gallery" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="gallery" className="flex items-center gap-2">
            <ImageIcon className="h-4 w-4" />
            Galerie
          </TabsTrigger>
          <TabsTrigger value="upload" className="flex items-center gap-2">
            <Upload className="h-4 w-4" />
            Upload
          </TabsTrigger>
        </TabsList>

        {/* Onglet Galerie */}
        <TabsContent value="gallery" className="space-y-4">
          <p className="text-sm text-slate-600">
            Choisissez une image parmi notre sélection
            {variant && (
              <span className="font-medium text-blue-600">
                {' '}(images {variant === 'beach_2x2' ? 'beach' : 'indoor'} suggérées)
              </span>
            )}
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 max-h-96 overflow-y-auto p-2">
            {suggestedImages.map((image) => (
              <motion.button
                key={image.id}
                type="button"
                onClick={() => handleImageSelect(image.url)}
                className={`relative aspect-video rounded-xl overflow-hidden border-2 transition-all ${
                  selectedImage === image.url
                    ? 'border-blue-600 shadow-lg scale-105'
                    : 'border-slate-200 hover:border-blue-400 hover:scale-102'
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
              >
                <Image
                  src={image.thumbnail}
                  alt={image.description}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 20vw"
                />
                {selectedImage === image.url && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="absolute inset-0 bg-blue-600/20 backdrop-blur-[2px] flex items-center justify-center"
                  >
                    <div className="bg-blue-600 rounded-full p-2">
                      <Check className="h-5 w-5 text-white" />
                    </div>
                  </motion.div>
                )}
              </motion.button>
            ))}
          </div>

          {/* Afficher toutes les images si filtrées */}
          {variant && (
            <details className="mt-4">
              <summary className="text-sm text-slate-600 cursor-pointer hover:text-blue-600 font-medium">
                Voir toutes les images ({TOURNAMENT_IMAGES.length})
              </summary>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 mt-4 max-h-64 overflow-y-auto p-2">
                {TOURNAMENT_IMAGES.map((image) => (
                  <motion.button
                    key={image.id}
                    type="button"
                    onClick={() => handleImageSelect(image.url)}
                    className={`relative aspect-video rounded-xl overflow-hidden border-2 transition-all ${
                      selectedImage === image.url
                        ? 'border-blue-600 shadow-lg'
                        : 'border-slate-200 hover:border-blue-400'
                    }`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Image
                      src={image.thumbnail}
                      alt={image.description}
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 20vw"
                    />
                    {selectedImage === image.url && (
                      <div className="absolute inset-0 bg-blue-600/20 backdrop-blur-[2px] flex items-center justify-center">
                        <div className="bg-blue-600 rounded-full p-2">
                          <Check className="h-5 w-5 text-white" />
                        </div>
                      </div>
                    )}
                  </motion.button>
                ))}
              </div>
            </details>
          )}
        </TabsContent>

        {/* Onglet Upload */}
        <TabsContent value="upload" className="space-y-4">
          <p className="text-sm text-slate-600">
            Uploadez votre propre image (max 5MB, formats: JPEG, PNG, WebP, AVIF)
          </p>

          <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center hover:border-blue-400 transition-colors">
            <input
              type="file"
              id="image-upload"
              accept="image/jpeg,image/jpg,image/png,image/webp,image/avif"
              onChange={handleFileUpload}
              disabled={isUploading}
              className="hidden"
            />
            <label
              htmlFor="image-upload"
              className={`cursor-pointer flex flex-col items-center gap-3 ${
                isUploading ? 'opacity-50 pointer-events-none' : ''
              }`}
            >
              {isUploading ? (
                <Loader2 className="h-12 w-12 text-blue-600 animate-spin" />
              ) : (
                <Upload className="h-12 w-12 text-slate-400" />
              )}
              <div>
                <p className="text-base font-semibold text-slate-700">
                  {isUploading ? 'Upload en cours...' : 'Cliquez pour choisir une image'}
                </p>
                <p className="text-sm text-slate-500 mt-1">
                  ou glissez-déposez votre fichier ici
                </p>
              </div>
            </label>
          </div>

          {uploadError && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2"
            >
              <X className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{uploadError}</p>
            </motion.div>
          )}

          {isCustomImage && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-green-50 border border-green-200 rounded-lg p-4"
            >
              <div className="flex items-center gap-3 mb-2">
                <Check className="h-5 w-5 text-green-600" />
                <p className="text-sm font-semibold text-green-700">
                  Image uploadée avec succès !
                </p>
              </div>
              <div className="relative aspect-video w-full max-w-sm rounded-lg overflow-hidden">
                <Image
                  src={previewUrl || selectedImage}
                  alt="Aperçu de l'image uploadée"
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 100vw, 400px"
                />
              </div>
            </motion.div>
          )}
        </TabsContent>
      </Tabs>

      {/* Aperçu de l'image sélectionnée */}
      {selectedImage && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 p-4 bg-slate-50 rounded-xl"
        >
          <div className="flex items-center justify-between mb-2">
            <Label className="text-sm font-medium text-slate-700">
              Aperçu de votre sélection (recadrée)
            </Label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleRemoveImage}
              className="gap-2 text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
            >
              <Trash2 className="h-4 w-4" />
              Supprimer
            </Button>
          </div>
          <div className="relative aspect-video w-full max-w-2xl mx-auto rounded-xl overflow-hidden border-2 border-slate-200">
            <Image
              src={previewUrl || selectedImage}
              alt="Aperçu de l'image sélectionnée"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>
          <div className="mt-3 text-center">
            <button
              type="button"
              onClick={() => {
                setImageToCrop(selectedImage);
                setCropModalOpen(true);
              }}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium underline"
            >
              ✂️ Recadrer à nouveau
            </button>
          </div>
        </motion.div>
      )}

      {/* Modal de recadrage */}
      {imageToCrop && (
        <ImageCropModal
          imageUrl={imageToCrop}
          isOpen={cropModalOpen}
          onClose={() => {
            setCropModalOpen(false);
            setImageToCrop(null);
          }}
          onCropComplete={handleCropComplete}
          aspectRatio={16 / 9}
          variant={variant}
        />
      )}
    </div>
  );
}

