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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/components/ui/use-toast';
import { createClient } from '@/lib/supabase/client';
import {
  TOURNAMENT_VARIANTS,
  TOURNAMENT_CATEGORIES,
  TOURNAMENT_LEVELS,
  REGISTRATION_MODES,
} from '@/lib/constants';

const tournamentSchema = z.object({
  title: z.string().min(3, 'Le titre doit contenir au moins 3 caractères'),
  description: z.string().optional(),
  variant: z.enum(['indoor_6x6', 'beach_2x2']),
  category: z.enum(['mixed', 'men', 'women']),
  level: z.enum(['beginner', 'intermediate', 'advanced']),
  registrationMode: z.enum(['team', 'solo', 'solo_positional', 'team_or_solo']),
  maxTeams: z.string().optional(),
  startDate: z.string().min(1, 'La date de début est requise'),
  endDate: z.string().min(1, 'La date de fin est requise'),
  registrationDeadline: z.string().min(1, 'La date limite d\'inscription est requise'),
  address: z.string().min(5, 'L\'adresse est requise'),
  city: z.string().min(2, 'La ville est requise'),
  postalCode: z.string().optional(),
  country: z.string().default('France'),
  isPublic: z.boolean().default(true),
  status: z.enum(['draft', 'published']).default('draft'),
}).refine((data) => new Date(data.endDate) >= new Date(data.startDate), {
  message: 'La date de fin doit être après la date de début',
  path: ['endDate'],
}).refine((data) => new Date(data.registrationDeadline) <= new Date(data.startDate), {
  message: 'La date limite d\'inscription doit être avant la date de début',
  path: ['registrationDeadline'],
});

type TournamentFormData = z.infer<typeof tournamentSchema>;

interface CreateTournamentFormProps {
  userId: string;
}

export function CreateTournamentForm({ userId }: CreateTournamentFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [variant, setVariant] = useState<'indoor_6x6' | 'beach_2x2'>('indoor_6x6');

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<TournamentFormData>({
    resolver: zodResolver(tournamentSchema),
    defaultValues: {
      variant: 'indoor_6x6',
      category: 'mixed',
      level: 'intermediate',
      registrationMode: 'team',
      country: 'France',
      isPublic: true,
      status: 'draft',
    },
  });

  const selectedVariant = watch('variant');
  const isPublic = watch('isPublic');

  const onSubmit = async (data: TournamentFormData) => {
    setIsLoading(true);
    const supabase = createClient();

    try {
      // Generate access token for private tournaments
      const accessToken = !data.isPublic
        ? `${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`
        : null;

      const { data: tournament, error } = await supabase
        .from('tournaments')
        .insert({
          organizer_id: userId,
          title: data.title,
          description: data.description || null,
          variant: data.variant,
          category: data.category,
          level: data.level,
          registration_mode: data.registrationMode,
          max_teams: data.maxTeams ? parseInt(data.maxTeams) : null,
          start_date: data.startDate,
          end_date: data.endDate,
          registration_deadline: data.registrationDeadline,
          address: data.address,
          city: data.city,
          postal_code: data.postalCode || null,
          country: data.country,
          is_public: data.isPublic,
          access_token: accessToken,
          status: data.status,
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      toast({
        title: data.status === 'published' ? 'Tournoi publié !' : 'Brouillon enregistré',
        description: data.status === 'published'
          ? 'Votre tournoi est maintenant visible par tous.'
          : 'Vous pouvez le modifier avant de le publier.',
      });

      router.push(`/tournois/${tournament.id}`);
      router.refresh();
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: error.message || 'Une erreur est survenue lors de la création du tournoi',
      });
    } finally {
      setIsLoading(false);
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
              placeholder="Tournoi de beach volleyball d'été 2024"
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
              placeholder="Décrivez votre tournoi, les règles spécifiques, etc."
              rows={4}
              {...register('description')}
              disabled={isLoading}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Variant *</Label>
              <Select
                onValueChange={(value) => {
                  setValue('variant', value as 'indoor_6x6' | 'beach_2x2');
                  setVariant(value as 'indoor_6x6' | 'beach_2x2');
                  // Reset registration mode when changing variant
                  if (value === 'beach_2x2') {
                    setValue('registrationMode', 'team');
                  }
                }}
                defaultValue="indoor_6x6"
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(TOURNAMENT_VARIANTS).map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Catégorie *</Label>
              <Select
                onValueChange={(value) => setValue('category', value as 'mixed' | 'men' | 'women')}
                defaultValue="mixed"
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
                onValueChange={(value) => setValue('level', value as 'beginner' | 'intermediate' | 'advanced')}
                defaultValue="intermediate"
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
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Mode d&apos;inscription</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Type d&apos;inscription *</Label>
            <RadioGroup
              defaultValue="team"
              onValueChange={(value) => setValue('registrationMode', value as any)}
              disabled={isLoading}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="team" id="team" />
                <Label htmlFor="team" className="font-normal cursor-pointer">
                  Par équipe {selectedVariant === 'beach_2x2' && '(2 joueurs)'}
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="solo" id="solo" />
                <Label htmlFor="solo" className="font-normal cursor-pointer">
                  Solo (sans postes spécifiques)
                </Label>
              </div>
              {selectedVariant === 'indoor_6x6' && (
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="solo_positional" id="solo_positional" />
                  <Label htmlFor="solo_positional" className="font-normal cursor-pointer">
                    Solo avec postes (passeur, central, etc.)
                  </Label>
                </div>
              )}
              {selectedVariant === 'beach_2x2' && (
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="team_or_solo" id="team_or_solo" />
                  <Label htmlFor="team_or_solo" className="font-normal cursor-pointer">
                    Équipe ou solo (autoriser les deux)
                  </Label>
                </div>
              )}
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label htmlFor="maxTeams">Nombre maximum d&apos;équipes (optionnel)</Label>
            <Input
              id="maxTeams"
              type="number"
              min="2"
              placeholder="8"
              {...register('maxTeams')}
              disabled={isLoading}
            />
            <p className="text-sm text-muted-foreground">
              Laissez vide pour un nombre illimité
            </p>
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
              placeholder="123 Rue du Volley"
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
                placeholder="Paris"
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
                placeholder="75001"
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
              defaultChecked={true}
              onCheckedChange={(checked) => setValue('isPublic', checked as boolean)}
              disabled={isLoading}
            />
            <Label htmlFor="isPublic" className="font-normal cursor-pointer">
              Tournoi public (visible par tous)
            </Label>
          </div>
          {!isPublic && (
            <p className="text-sm text-muted-foreground bg-muted p-3 rounded">
              ℹ️ Ce tournoi sera privé. Un lien unique sera généré pour le partager.
            </p>
          )}
        </CardContent>
      </Card>

      <div className="flex gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            setValue('status', 'draft');
            handleSubmit(onSubmit)();
          }}
          disabled={isLoading}
          className="flex-1"
        >
          Enregistrer comme brouillon
        </Button>
        <Button
          type="button"
          onClick={() => {
            setValue('status', 'published');
            handleSubmit(onSubmit)();
          }}
          disabled={isLoading}
          className="flex-1"
        >
          Publier le tournoi
        </Button>
      </div>
    </form>
  );
}





