'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/components/ui/use-toast';
import { createClient } from '@/lib/supabase/client';
import { Trash2, AlertTriangle } from 'lucide-react';
import {
  TOURNAMENT_CATEGORIES,
  TOURNAMENT_LEVELS,
  TOURNAMENT_STATUS,
} from '@/lib/constants';

const tournamentSchema = z.object({
  title: z.string().min(3, 'Le titre doit contenir au moins 3 caractères'),
  description: z.string().optional(),
  category: z.enum(['mixed', 'men', 'women']),
  level: z.enum(['beginner', 'intermediate', 'advanced']),
  maxTeams: z.string().optional(),
  startDate: z.string().min(1, 'La date de début est requise'),
  endDate: z.string().min(1, 'La date de fin est requise'),
  registrationDeadline: z.string().min(1, 'La date limite d\'inscription est requise'),
  address: z.string().min(5, 'L\'adresse est requise'),
  city: z.string().min(2, 'La ville est requise'),
  postalCode: z.string().optional(),
  country: z.string().default('France'),
  isPublic: z.boolean().default(true),
  status: z.enum(['draft', 'published', 'ongoing', 'completed', 'cancelled']),
});

type TournamentFormData = z.infer<typeof tournamentSchema>;

interface EditTournamentFormProps {
  tournament: any;
}

export function EditTournamentForm({ tournament }: EditTournamentFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<TournamentFormData>({
    resolver: zodResolver(tournamentSchema),
    defaultValues: {
      title: tournament.title,
      description: tournament.description || '',
      category: tournament.category,
      level: tournament.level,
      maxTeams: tournament.max_teams?.toString() || '',
      startDate: tournament.start_date.slice(0, 16),
      endDate: tournament.end_date.slice(0, 16),
      registrationDeadline: tournament.registration_deadline.slice(0, 16),
      address: tournament.address,
      city: tournament.city,
      postalCode: tournament.postal_code || '',
      country: tournament.country,
      isPublic: tournament.is_public,
      status: tournament.status,
    },
  });

  const isPublic = watch('isPublic');

  const onSubmit = async (data: TournamentFormData) => {
    setIsLoading(true);
    const supabase = createClient();

    try {
      const { error } = await supabase
        .from('tournaments')
        .update({
          title: data.title,
          description: data.description || null,
          category: data.category,
          level: data.level,
          max_teams: data.maxTeams ? parseInt(data.maxTeams) : null,
          start_date: data.startDate,
          end_date: data.endDate,
          registration_deadline: data.registrationDeadline,
          address: data.address,
          city: data.city,
          postal_code: data.postalCode || null,
          country: data.country,
          is_public: data.isPublic,
          status: data.status,
        })
        .eq('id', tournament.id);

      if (error) throw error;

      toast({
        title: 'Tournoi mis à jour',
        description: 'Les modifications ont été enregistrées avec succès.',
      });

      router.push(`/tournois/${tournament.id}`);
      router.refresh();
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: error.message || 'Une erreur est survenue',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);

    try {
      const response = await fetch(`/api/tournaments/${tournament.id}/delete`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erreur lors de la suppression');
      }

      toast({
        title: 'Tournoi supprimé',
        description: 'Le tournoi a été supprimé avec succès.',
      });

      router.push('/mes-tournois');
      router.refresh();
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: error.message || 'Une erreur est survenue lors de la suppression',
      });
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Informations générales</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Titre du tournoi *</Label>
            <Input
              id="title"
              {...register('title')}
              disabled={isLoading}
            />
            {errors.title && (
              <p className="text-sm text-destructive">{errors.title.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              rows={4}
              {...register('description')}
              disabled={isLoading}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Catégorie *</Label>
              <Select
                onValueChange={(value) => setValue('category', value as any)}
                defaultValue={tournament.category}
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(TOURNAMENT_CATEGORIES).map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Niveau *</Label>
              <Select
                onValueChange={(value) => setValue('level', value as any)}
                defaultValue={tournament.level}
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(TOURNAMENT_LEVELS).map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Statut *</Label>
              <Select
                onValueChange={(value) => setValue('status', value as any)}
                defaultValue={tournament.status}
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(TOURNAMENT_STATUS).map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="maxTeams">Nombre maximum d&apos;équipes</Label>
            <Input
              id="maxTeams"
              type="number"
              min="2"
              {...register('maxTeams')}
              disabled={isLoading}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Dates</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Date de début *</Label>
              <Input
                id="startDate"
                type="datetime-local"
                {...register('startDate')}
                disabled={isLoading}
              />
              {errors.startDate && (
                <p className="text-sm text-destructive">{errors.startDate.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="endDate">Date de fin *</Label>
              <Input
                id="endDate"
                type="datetime-local"
                {...register('endDate')}
                disabled={isLoading}
              />
              {errors.endDate && (
                <p className="text-sm text-destructive">{errors.endDate.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="registrationDeadline">Date limite d&apos;inscription *</Label>
            <Input
              id="registrationDeadline"
              type="datetime-local"
              {...register('registrationDeadline')}
              disabled={isLoading}
            />
            {errors.registrationDeadline && (
              <p className="text-sm text-destructive">
                {errors.registrationDeadline.message}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Localisation</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="address">Adresse *</Label>
            <Input
              id="address"
              {...register('address')}
              disabled={isLoading}
            />
            {errors.address && (
              <p className="text-sm text-destructive">{errors.address.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="city">Ville *</Label>
              <Input
                id="city"
                {...register('city')}
                disabled={isLoading}
              />
              {errors.city && (
                <p className="text-sm text-destructive">{errors.city.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="postalCode">Code postal</Label>
              <Input
                id="postalCode"
                {...register('postalCode')}
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="country">Pays *</Label>
            <Input
              id="country"
              {...register('country')}
              disabled={isLoading}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Visibilité</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="isPublic"
              checked={isPublic}
              onCheckedChange={(checked) => setValue('isPublic', checked as boolean)}
              disabled={isLoading}
            />
            <Label htmlFor="isPublic" className="font-normal cursor-pointer">
              Tournoi public
            </Label>
          </div>
          {!isPublic && (
            <p className="text-sm text-muted-foreground bg-muted p-3 rounded">
              ℹ️ Lien privé: {window.location.origin}/tournois/{tournament.id}?token={tournament.access_token}
            </p>
          )}
        </CardContent>
      </Card>

      <div className="flex gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={isLoading}
        >
          Annuler
        </Button>
        <Button type="submit" disabled={isLoading} className="flex-1">
          {isLoading ? 'Enregistrement...' : 'Enregistrer les modifications'}
        </Button>
      </div>

      {/* Bouton de suppression */}
      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="text-destructive">Zone dangereuse</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold">Supprimer ce tournoi</p>
              <p className="text-sm text-muted-foreground">
                Cette action est irréversible. Toutes les inscriptions seront également supprimées.
              </p>
            </div>
            <Button
              type="button"
              variant="destructive"
              onClick={() => setShowDeleteConfirm(true)}
              disabled={isLoading || isDeleting}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Supprimer
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Modal de confirmation */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-6 w-6 text-destructive" />
                <CardTitle>Confirmer la suppression</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Êtes-vous sûr de vouloir supprimer le tournoi <strong>&quot;{tournament.title}&quot;</strong> ?
              </p>
              <p className="text-sm text-destructive font-semibold">
                Cette action est irréversible et supprimera également toutes les inscriptions associées.
              </p>
              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={isDeleting}
                  className="flex-1"
                >
                  Annuler
                </Button>
                <Button
                  type="button"
                  variant="destructive"
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="flex-1"
                >
                  {isDeleting ? 'Suppression...' : 'Supprimer définitivement'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </form>
  );
}





