'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { createClient } from '@/lib/supabase/client';
import { GENDERS, TOURNAMENT_LEVELS, POSITIONS } from '@/lib/constants';

const baseRegistrationSchema = z.object({
  firstName: z.string().min(2, 'Le prénom est requis'),
  lastName: z.string().min(2, 'Le nom est requis'),
  email: z.string().email('Email invalide'),
  phone: z.string().min(10, 'Le téléphone est requis'),
  gender: z.enum(['male', 'female', 'other']),
  level: z.enum(['beginner', 'intermediate', 'advanced']),
});

interface RegistrationFormProps {
  tournament: any;
  userId: string;
  userProfile?: any;
  onSuccess: () => void;
  onCancel: () => void;
}

export function RegistrationForm({
  tournament,
  userId,
  userProfile,
  onSuccess,
  onCancel,
}: RegistrationFormProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  // Build schema based on registration mode
  let registrationSchema = baseRegistrationSchema;

  if (tournament.registration_mode === 'team') {
    registrationSchema = baseRegistrationSchema.extend({
      teamName: z.string().min(2, 'Le nom d\'équipe est requis'),
      ...(tournament.variant === 'beach_2x2' && {
        teammateFirstName: z.string().min(2, 'Le prénom du coéquipier est requis'),
        teammateLastName: z.string().min(2, 'Le nom du coéquipier est requis'),
      }),
    });
  } else if (tournament.registration_mode === 'solo_positional') {
    registrationSchema = baseRegistrationSchema.extend({
      position: z.enum(['setter', 'middle', 'outside', 'opposite', 'libero']),
    });
  } else if (tournament.registration_mode === 'team_or_solo') {
    registrationSchema = baseRegistrationSchema.extend({
      teamName: z.string().optional(),
      teammateFirstName: z.string().optional(),
      teammateLastName: z.string().optional(),
    }).refine(
      (data) => {
        // If team name is provided, teammate names should also be provided
        if (data.teamName) {
          return data.teammateFirstName && data.teammateLastName;
        }
        return true;
      },
      {
        message: 'Les noms des coéquipiers sont requis si vous formez une équipe',
        path: ['teammateFirstName'],
      }
    );
  }

  type RegistrationFormData = z.infer<typeof registrationSchema>;

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<RegistrationFormData>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      firstName: userProfile?.first_name || '',
      lastName: userProfile?.last_name || '',
      email: userProfile?.email || '',
      phone: userProfile?.phone || '',
      gender: userProfile?.gender,
      level: userProfile?.level,
    },
  });

  const onSubmit = async (data: RegistrationFormData) => {
    setIsLoading(true);
    const supabase = createClient();

    try {
      const { error } = await supabase.from('registrations').insert({
        tournament_id: tournament.id,
        user_id: userId,
        first_name: data.firstName,
        last_name: data.lastName,
        email: data.email,
        phone: data.phone,
        gender: data.gender,
        level: data.level,
        position: ('position' in data ? data.position : null) as any,
        team_name: ('teamName' in data ? data.teamName : null) as any,
        teammate_first_name: ('teammateFirstName' in data ? data.teammateFirstName : null) as any,
        teammate_last_name: ('teammateLastName' in data ? data.teammateLastName : null) as any,
      });

      if (error) throw error;

      toast({
        title: 'Inscription envoyée !',
        description: 'Votre inscription sera examinée par l\'organisateur.',
      });

      onSuccess();
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: error.message || 'Une erreur est survenue lors de l\'inscription',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="firstName">Prénom *</Label>
          <Input id="firstName" {...register('firstName')} disabled={isLoading} />
          {errors.firstName && (
            <p className="text-sm text-destructive">{errors.firstName.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="lastName">Nom *</Label>
          <Input id="lastName" {...register('lastName')} disabled={isLoading} />
          {errors.lastName && (
            <p className="text-sm text-destructive">{errors.lastName.message}</p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email *</Label>
        <Input id="email" type="email" {...register('email')} disabled={isLoading} />
        {errors.email && (
          <p className="text-sm text-destructive">{errors.email.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone">Téléphone *</Label>
        <Input id="phone" type="tel" {...register('phone')} disabled={isLoading} />
        {errors.phone && (
          <p className="text-sm text-destructive">{errors.phone.message}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Sexe *</Label>
          <Select
            onValueChange={(value) => setValue('gender', value as any)}
            disabled={isLoading}
          >
            <SelectTrigger>
              <SelectValue placeholder="Sélectionner" />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(GENDERS).map(([key, label]) => (
                <SelectItem key={key} value={key}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.gender && (
            <p className="text-sm text-destructive">{errors.gender.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label>Niveau *</Label>
          <Select
            onValueChange={(value) => setValue('level', value as any)}
            disabled={isLoading}
          >
            <SelectTrigger>
              <SelectValue placeholder="Sélectionner" />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(TOURNAMENT_LEVELS).map(([key, label]) => (
                <SelectItem key={key} value={key}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.level && (
            <p className="text-sm text-destructive">{errors.level.message}</p>
          )}
        </div>
      </div>

      {tournament.registration_mode === 'solo_positional' && (
        <div className="space-y-2">
          <Label>Poste *</Label>
          <Select
            onValueChange={(value) => setValue('position' as any, value as any)}
            disabled={isLoading}
          >
            <SelectTrigger>
              <SelectValue placeholder="Sélectionner votre poste" />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(POSITIONS).map(([key, label]) => (
                <SelectItem key={key} value={key}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.position && (
            <p className="text-sm text-destructive">{(errors as any).position.message}</p>
          )}
        </div>
      )}

      {(tournament.registration_mode === 'team' ||
        tournament.registration_mode === 'team_or_solo') && (
        <>
          <div className="space-y-2">
            <Label htmlFor="teamName">
              Nom d&apos;équipe {tournament.registration_mode === 'team' ? '*' : '(optionnel)'}
            </Label>
            <Input
              id="teamName"
              {...register('teamName' as any)}
              disabled={isLoading}
              placeholder="Les champions"
            />
            {(errors as any).teamName && (
              <p className="text-sm text-destructive">{(errors as any).teamName.message}</p>
            )}
          </div>

          {tournament.variant === 'beach_2x2' && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="teammateFirstName">
                  Prénom coéquipier {tournament.registration_mode === 'team' ? '*' : ''}
                </Label>
                <Input
                  id="teammateFirstName"
                  {...register('teammateFirstName' as any)}
                  disabled={isLoading}
                />
                {(errors as any).teammateFirstName && (
                  <p className="text-sm text-destructive">
                    {(errors as any).teammateFirstName.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="teammateLastName">
                  Nom coéquipier {tournament.registration_mode === 'team' ? '*' : ''}
                </Label>
                <Input
                  id="teammateLastName"
                  {...register('teammateLastName' as any)}
                  disabled={isLoading}
                />
                {(errors as any).teammateLastName && (
                  <p className="text-sm text-destructive">
                    {(errors as any).teammateLastName.message}
                  </p>
                )}
              </div>
            </div>
          )}
        </>
      )}

      <div className="flex gap-4 pt-4">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
          Annuler
        </Button>
        <Button type="submit" disabled={isLoading} className="flex-1">
          {isLoading ? 'Inscription en cours...' : 'Confirmer l\'inscription'}
        </Button>
      </div>
    </form>
  );
}





