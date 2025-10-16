'use client';

import { useState, useRef, useEffect } from 'react';
import ReactCrop, { Crop, PixelCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, RotateCw, ZoomIn, ZoomOut, Maximize2, Loader2, MapPin, Calendar, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Image from 'next/image';

interface ImageCropModalProps {
  imageUrl: string;
  isOpen: boolean;
  onClose: () => void;
  onCropComplete: (croppedImageBlob: Blob, croppedImageUrl: string) => void;
  aspectRatio?: number;
  variant?: 'indoor_6x6' | 'beach_2x2';
}

export function ImageCropModal({
  imageUrl,
  isOpen,
  onClose,
  onCropComplete,
  aspectRatio = 16 / 9, // Ratio par défaut pour les cartes de tournoi
  variant = 'indoor_6x6',
}: ImageCropModalProps) {
  const [crop, setCrop] = useState<Crop>({
    unit: '%',
    width: 90,
    height: 90,
    x: 5,
    y: 5,
  });
  const [completedCrop, setCompletedCrop] = useState<PixelCrop | null>(null);
  const [scale, setScale] = useState(1);
  const [rotate, setRotate] = useState(0);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);
  const hiddenCanvasRef = useRef<HTMLCanvasElement>(null);

  // Réinitialiser quand l'image change
  useEffect(() => {
    if (isOpen) {
      console.log('🖼️ Modal ouvert avec imageUrl:', imageUrl);
      setImageLoaded(false);
      setImageError(false);
      setCrop({
        unit: '%',
        width: 90,
        height: 90,
        x: 5,
        y: 5,
      });
      setScale(1);
      setRotate(0);
    }
  }, [isOpen, imageUrl]);

  // Générer l'aperçu du crop en temps réel
  useEffect(() => {
    if (!completedCrop || !imgRef.current || !previewCanvasRef.current) {
      console.log('⏸️ Preview: En attente...', { 
        crop: !!completedCrop, 
        img: !!imgRef.current, 
        canvas: !!previewCanvasRef.current 
      });
      return;
    }

    const image = imgRef.current;
    const canvas = previewCanvasRef.current;
    const crop = completedCrop;

    console.log('🎨 Génération de l\'aperçu...', crop);

    // Utiliser une taille fixe pour l'aperçu (ratio 16:9)
    const previewWidth = 400;
    const previewHeight = previewWidth / (16 / 9);

    canvas.width = previewWidth;
    canvas.height = previewHeight;

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      console.error('❌ Impossible d\'obtenir le contexte 2D du canvas');
      return;
    }

    ctx.imageSmoothingQuality = 'high';

    // Calculer les dimensions réelles du crop
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;

    const cropX = crop.x * scaleX;
    const cropY = crop.y * scaleY;
    const cropWidth = crop.width * scaleX;
    const cropHeight = crop.height * scaleY;

    // Dessiner l'image cropée dans le canvas de preview
    ctx.clearRect(0, 0, previewWidth, previewHeight);
    ctx.drawImage(
      image,
      cropX,
      cropY,
      cropWidth,
      cropHeight,
      0,
      0,
      previewWidth,
      previewHeight
    );

    console.log('✅ Aperçu généré avec succès', {
      canvasSize: `${previewWidth}x${previewHeight}`,
      cropArea: `${Math.round(cropX)},${Math.round(cropY)} - ${Math.round(cropWidth)}x${Math.round(cropHeight)}`
    });
  }, [completedCrop]);

  const handleCropConfirm = async () => {
    if (!completedCrop || !imgRef.current || !hiddenCanvasRef.current) {
      return;
    }

    const canvas = hiddenCanvasRef.current;
    const image = imgRef.current;
    const crop = completedCrop;

    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    const ctx = canvas.getContext('2d');

    if (!ctx) return;

    const pixelRatio = window.devicePixelRatio || 1;

    canvas.width = crop.width * pixelRatio * scaleX;
    canvas.height = crop.height * pixelRatio * scaleY;

    ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    ctx.imageSmoothingQuality = 'high';

    ctx.drawImage(
      image,
      crop.x * scaleX,
      crop.y * scaleY,
      crop.width * scaleX,
      crop.height * scaleY,
      0,
      0,
      crop.width * scaleX,
      crop.height * scaleY
    );

    canvas.toBlob(
      (blob) => {
        if (!blob) {
          console.error('Failed to create blob');
          return;
        }

        const croppedImageUrl = URL.createObjectURL(blob);
        onCropComplete(blob, croppedImageUrl);
        onClose();
      },
      'image/jpeg',
      0.95
    );
  };

  const handleRotate = () => {
    setRotate((prev) => (prev + 90) % 360);
  };

  const handleZoomIn = () => {
    setScale((prev) => Math.min(prev + 0.1, 3));
  };

  const handleZoomOut = () => {
    setScale((prev) => Math.max(prev - 0.1, 0.5));
  };

  const handleResetCrop = () => {
    setCrop({
      unit: '%',
      width: 90,
      height: 90,
      x: 5,
      y: 5,
    });
    setScale(1);
    setRotate(0);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 z-50 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal Container - Centrage garanti */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="w-full max-w-6xl bg-white rounded-2xl shadow-2xl flex flex-col pointer-events-auto"
              style={{
                maxHeight: '95vh',
              }}
              onClick={(e) => e.stopPropagation()}
            >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b bg-gradient-to-r from-blue-50 to-cyan-50">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">
                  Recadrer l'image
                </h2>
                <p className="text-sm text-slate-600 mt-1">
                  Ajustez le cadrage pour obtenir le résultat parfait
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white rounded-lg transition-colors"
              >
                <X className="h-6 w-6 text-slate-600" />
              </button>
            </div>

            {/* Toolbar */}
            <div className="flex items-center justify-between gap-4 p-4 bg-slate-50 border-b flex-wrap">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-slate-700">Outils :</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRotate}
                  className="gap-2"
                >
                  <RotateCw className="h-4 w-4" />
                  Rotation
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleZoomIn}
                  className="gap-2"
                >
                  <ZoomIn className="h-4 w-4" />
                  Zoom +
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleZoomOut}
                  className="gap-2"
                >
                  <ZoomOut className="h-4 w-4" />
                  Zoom -
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleResetCrop}
                  className="gap-2"
                >
                  <Maximize2 className="h-4 w-4" />
                  Réinitialiser
                </Button>
              </div>

              <div className="flex items-center gap-2 text-sm text-slate-600">
                <span>Zoom: {Math.round(scale * 100)}%</span>
                <span className="mx-2">•</span>
                <span>Rotation: {rotate}°</span>
              </div>
            </div>

            {/* Crop Area & Preview */}
            <div className="flex-1 overflow-auto bg-slate-100" style={{ minHeight: '400px', maxHeight: 'calc(95vh - 280px)' }}>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6 h-full">
                {/* Zone de recadrage */}
                <div className="flex flex-col gap-3">
                  <h3 className="text-sm font-semibold text-slate-700">Ajustez le cadrage</h3>
                  <div className="flex items-center justify-center flex-1 bg-white rounded-xl p-4">
                    {imageError ? (
                      <div className="text-center space-y-3">
                        <X className="h-12 w-12 text-red-400 mx-auto" />
                        <p className="text-slate-600">Erreur lors du chargement de l'image</p>
                        <p className="text-sm text-slate-400">Veuillez réessayer</p>
                      </div>
                    ) : !imageLoaded ? (
                      <div className="text-center space-y-3">
                        <Loader2 className="h-12 w-12 text-blue-600 animate-spin mx-auto" />
                        <p className="text-slate-600">Chargement de l'image...</p>
                      </div>
                    ) : null}
                    
                    {imageUrl && (
                      <ReactCrop
                        crop={crop}
                        onChange={(c) => setCrop(c)}
                        onComplete={(c) => setCompletedCrop(c)}
                        aspect={aspectRatio}
                        className="max-w-full"
                        style={{ display: imageLoaded && !imageError ? 'block' : 'none' }}
                      >
                        <img
                          ref={imgRef}
                          src={imageUrl}
                          alt="Image à recadrer"
                          crossOrigin="anonymous"
                          style={{
                            transform: `scale(${scale}) rotate(${rotate}deg)`,
                            maxHeight: '500px',
                            maxWidth: '100%',
                            height: 'auto',
                            width: 'auto',
                            display: 'block',
                          }}
                          onLoad={(e) => {
                            console.log('✅ Image chargée avec succès');
                            setImageLoaded(true);
                            setImageError(false);
                            
                            const { width, height } = e.currentTarget;
                            const cropWidth = Math.min(90, (width * 90) / 100);
                            const cropHeight = cropWidth / aspectRatio;
                            
                            setCrop({
                              unit: '%',
                              width: (cropWidth / width) * 100,
                              height: (cropHeight / height) * 100,
                              x: 5,
                              y: 5,
                            });
                          }}
                          onError={(e) => {
                            console.error('❌ Erreur de chargement d\'image:', e);
                            setImageError(true);
                            setImageLoaded(false);
                          }}
                        />
                      </ReactCrop>
                    )}
                  </div>
                </div>

                {/* Aperçu de la carte de tournoi */}
                <div className="flex flex-col gap-3">
                  <h3 className="text-sm font-semibold text-slate-700">Aperçu de la carte</h3>
                  <div className="flex-1 flex items-center justify-center">
                    <div className="w-full max-w-md">
                      {/* Carte de tournoi preview */}
                      <div className="relative rounded-2xl overflow-hidden shadow-xl bg-white transition-all duration-200">
                        {/* Image de fond */}
                        <div className="relative aspect-video overflow-hidden bg-slate-200">
                          {/* Canvas preview */}
                          {imageLoaded && completedCrop && (
                            <canvas
                              ref={previewCanvasRef}
                              className="absolute top-0 left-0 w-full h-full"
                            />
                          )}
                          
                          {/* Message si pas encore de crop */}
                          {(!imageLoaded || !completedCrop) && (
                            <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center">
                              <p className="text-slate-500 text-sm">
                                {imageLoaded ? 'Ajustez le cadrage...' : 'Chargement...'}
                              </p>
                            </div>
                          )}
                          
                          {/* Overlay gradient (toujours visible si image chargée) */}
                          {imageLoaded && completedCrop && (
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent pointer-events-none" />
                          )}
                          
                          {/* Badges */}
                          <div className="absolute top-3 left-3 flex gap-2 flex-wrap">
                            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/90 text-white backdrop-blur-sm">
                              {variant === 'beach_2x2' ? '🏖️ Beach 2x2' : '🏐 Indoor 6x6'}
                            </span>
                            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-500/90 text-white backdrop-blur-sm">
                              Débutant
                            </span>
                          </div>
                        </div>

                        {/* Contenu de la carte */}
                        <div className="p-4 space-y-3">
                          <h3 className="text-xl font-bold text-slate-900">Tournoi d'Exemple</h3>
                          
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-slate-600">
                              <Calendar className="h-4 w-4 flex-shrink-0" />
                              <span className="text-sm">15 Nov 2025 • 14h00</span>
                            </div>
                            <div className="flex items-center gap-2 text-slate-600">
                              <MapPin className="h-4 w-4 flex-shrink-0" />
                              <span className="text-sm">Paris, France</span>
                            </div>
                            <div className="flex items-center gap-2 text-slate-600">
                              <Users className="h-4 w-4 flex-shrink-0" />
                              <span className="text-sm">12 / 16 places</span>
                            </div>
                          </div>

                          <div className="pt-3 border-t">
                            <p className="text-xs text-slate-500">Organisé par John Doe</p>
                          </div>
                        </div>
                      </div>
                      <p className="text-xs text-slate-500 text-center mt-3">
                        👆 Voilà à quoi ressemblera votre carte de tournoi
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Hidden Canvas for final export */}
            <canvas
              ref={hiddenCanvasRef}
              style={{ display: 'none' }}
            />

            {/* Footer */}
            <div className="flex items-center justify-between gap-4 p-6 border-t bg-white">
              <div className="text-sm text-slate-600">
                💡 Glissez les coins pour ajuster le cadrage
              </div>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={onClose}
                  className="px-6"
                >
                  Annuler
                </Button>
                <Button
                  onClick={handleCropConfirm}
                  disabled={!completedCrop}
                  className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 px-6 gap-2"
                >
                  <Check className="h-4 w-4" />
                  Valider le recadrage
                </Button>
              </div>
            </div>
          </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}

