'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from '@/components/ui/use-toast';
import { createClient } from '@/lib/supabase/client';
import { 
  UserPlus, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Users, 
  Loader2,
  LogIn,
  UserCheck
} from 'lucide-react';
import { GENDERS, TOURNAMENT_LEVELS, POSITIONS } from '@/lib/constants';

const baseSchema = z.object({
  firstName: z.string().min(2, 'Le prénom est requis'),
  lastName: z.string().min(2, 'Le nom est requis'),
  email: z.string().email('Email invalide'),
  phone: z.string().min(10, 'Le téléphone est requis'),
  gender: z.enum(['male', 'female', 'other']),
  level: z.enum(['beginner', 'intermediate', 'advanced']),
});

interface TournamentRegistrationPanelProps {
  tournament: any;
  user: any;
  userRegistration: any;
  currentUserProfile?: any;
  isOrganizer: boolean;
  onRegistrationSuccess?: () => void;
}

export function TournamentRegistrationPanel({
  tournament,
  user,
  userRegistration,
  currentUserProfile,
  isOrganizer,
  onRegistrationSuccess,
}: TournamentRegistrationPanelProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [selectedPosition, setSelectedPosition] = useState('');

  // Build schema based on registration mode
  let registrationSchema: any = baseSchema;

  if (tournament.registration_mode === 'team') {
    registrationSchema = baseSchema.extend({
      teamName: z.string().min(2, 'Le nom d\'équipe est requis'),
      ...(tournament.variant === 'beach_2x2' && {
        teammateFirstName: z.string().min(2, 'Le prénom du coéquipier est requis'),
        teammateLastName: z.string().min(2, 'Le nom du coéquipier est requis'),
      }),
    });
  } else if (tournament.registration_mode === 'solo_positional') {
    registrationSchema = baseSchema.extend({
      position: z.enum(['setter', 'middle', 'outside', 'opposite', 'libero']),
    });
  }

  type FormData = z.infer<typeof registrationSchema>;

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(registrationSchema as any),
    defaultValues: {
      firstName: currentUserProfile?.first_name || '',
      lastName: currentUserProfile?.last_name || '',
      email: currentUserProfile?.email || '',
      phone: currentUserProfile?.phone || '',
      gender: currentUserProfile?.gender,
      level: currentUserProfile?.level,
      position: selectedPosition as any,
    },
  });

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    const supabase = createClient();

    try {
      const { error } = await supabase.from('registrations').insert({
        tournament_id: tournament.id,
        user_id: user.id,
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
        title: '✓ Inscription envoyée !',
        description: 'Votre inscription sera examinée par l\'organisateur.',
      });

      setShowForm(false);
      if (onRegistrationSuccess) {
        onRegistrationSuccess();
      } else {
        window.location.reload();
      }
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

  const canRegister =
    user &&
    !isOrganizer &&
    !userRegistration &&
    tournament.status === 'published' &&
    new Date(tournament.registration_deadline) > new Date();

  const shouldShowAuthPrompt =
    !user &&
    tournament.status === 'published' &&
    new Date(tournament.registration_deadline) > new Date();

  // État: Non connecté
  if (shouldShowAuthPrompt) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.25 }}
      >
        <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-cyan-50 shadow-lg">
          <CardHeader className="text-center pb-4">
            <div className="mx-auto h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center mb-4">
              <UserPlus className="h-8 w-8 text-blue-600" />
            </div>
            <CardTitle className="text-2xl">Rejoignez-nous !</CardTitle>
            <CardDescription className="text-base text-slate-600">
              Connectez-vous ou créez un compte pour vous inscrire à ce tournoi
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link href="/auth/connexion" className="block">
              <Button size="lg" className="w-full h-12 text-base font-semibold bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-md">
                <LogIn className="mr-2 h-5 w-5" />
                Se connecter
              </Button>
            </Link>
            <Link href="/auth/inscription" className="block">
              <Button
                size="lg"
                variant="outline"
                className="w-full h-12 text-base font-semibold border-2 border-blue-300 hover:bg-blue-50 hover:border-blue-400"
              >
                <UserCheck className="mr-2 h-5 w-5" />
                Créer un compte
              </Button>
            </Link>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  // État: Organizer
  if (isOrganizer) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.25 }}
      >
        <Alert className="border-slate-300 bg-slate-50">
          <Users className="h-5 w-5" />
          <AlertTitle className="text-lg font-semibold mb-2">Vous êtes l'organisateur</AlertTitle>
          <AlertDescription className="text-slate-600">
            Gérez les inscriptions depuis la section ci-dessous.
          </AlertDescription>
        </Alert>
      </motion.div>
    );
  }

  // État: Déjà inscrit
  if (userRegistration) {
    const statusConfig = {
      pending: {
        icon: Clock,
        title: 'Inscription en attente',
        description: 'Votre inscription est en cours d\'examen par l\'organisateur.',
        variant: 'default' as const,
        bgClass: 'bg-yellow-50 border-yellow-200',
        iconClass: 'text-yellow-600',
      },
      waitlisted: {
        icon: AlertCircle,
        title: 'Liste d\'attente',
        description: 'Vous êtes sur liste d\'attente. Nous vous contacterons si une place se libère.',
        variant: 'default' as const,
        bgClass: 'bg-orange-50 border-orange-200',
        iconClass: 'text-orange-600',
      },
      approved: {
        icon: CheckCircle2,
        title: 'Inscription acceptée !',
        description: 'Votre inscription a été approuvée. À bientôt sur le terrain !',
        variant: 'default' as const,
        bgClass: 'bg-green-50 border-green-200',
        iconClass: 'text-green-600',
      },
      rejected: {
        icon: AlertCircle,
        title: 'Inscription refusée',
        description: 'Votre inscription n\'a pas été retenue pour ce tournoi.',
        variant: 'destructive' as const,
        bgClass: 'bg-red-50 border-red-200',
        iconClass: 'text-red-600',
      },
    };

    const config = statusConfig[userRegistration.status as keyof typeof statusConfig] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.25 }}
      >
        <Card className={`${config.bgClass} shadow-lg`}>
          <CardHeader className="text-center pb-4">
            <div className="mx-auto h-16 w-16 rounded-full bg-white flex items-center justify-center mb-4 shadow-md">
              <Icon className={`h-8 w-8 ${config.iconClass}`} />
            </div>
            <CardTitle className="text-2xl">{config.title}</CardTitle>
            <CardDescription className="text-base text-slate-700">
              {config.description}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-white rounded-xl p-4 space-y-2 shadow-sm">
              {userRegistration.team_name && (
                <div className="flex justify-between items-center py-2 border-b border-slate-100 last:border-0">
                  <span className="text-sm font-semibold text-slate-600">Équipe</span>
                  <span className="text-sm text-slate-900 font-medium">{userRegistration.team_name}</span>
                </div>
              )}
              {userRegistration.position && (
                <div className="flex justify-between items-center py-2 border-b border-slate-100 last:border-0">
                  <span className="text-sm font-semibold text-slate-600">Poste</span>
                  <span className="text-sm text-slate-900 font-medium">
                    {POSITIONS[userRegistration.position as keyof typeof POSITIONS]}
                  </span>
                </div>
              )}
              <div className="flex justify-between items-center py-2">
                <span className="text-sm font-semibold text-slate-600">Statut</span>
                <span className={`text-sm font-bold ${config.iconClass}`}>
                  {config.title}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  // État: Peut s'inscrire
  if (canRegister) {
    if (!showForm) {
      return (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.25 }}
        >
          <Card className="border-blue-200 bg-gradient-to-br from-white to-blue-50 shadow-lg">
            <CardHeader className="text-center">
              <div className="mx-auto h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center mb-4">
                <UserPlus className="h-8 w-8 text-blue-600" />
              </div>
              <CardTitle className="text-2xl">S'inscrire au tournoi</CardTitle>
              <CardDescription className="text-base">
                {tournament.registration_mode === 'solo_positional' && 'Inscription solo avec choix du poste'}
                {tournament.registration_mode === 'team' && 'Inscription en équipe'}
                {tournament.registration_mode === 'solo' && 'Inscription solo'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={() => setShowForm(true)}
                size="lg"
                className="w-full h-12 text-base font-semibold bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-md"
              >
                <UserPlus className="mr-2 h-5 w-5" />
                Je m'inscris
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      );
    }

    // Formulaire d'inscription
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.25 }}
      >
        <Card className="shadow-lg">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-cyan-50 border-b">
            <CardTitle className="text-xl">Formulaire d'inscription</CardTitle>
            <CardDescription>Complétez les informations ci-dessous</CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              {/* Nom et Prénom */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName" className="text-sm font-semibold">
                    Prénom <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="firstName"
                    {...register('firstName')}
                    disabled={isLoading}
                    className="h-11"
                  />
                  {errors.firstName && (
                    <p className="text-sm text-red-600">{String(errors.firstName.message)}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName" className="text-sm font-semibold">
                    Nom <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="lastName"
                    {...register('lastName')}
                    disabled={isLoading}
                    className="h-11"
                  />
                  {errors.lastName && (
                    <p className="text-sm text-red-600">{String(errors.lastName.message)}</p>
                  )}
                </div>
              </div>

              {/* Email et Téléphone */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-semibold">
                    Email <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    {...register('email')}
                    disabled={isLoading}
                    className="h-11"
                  />
                  {errors.email && (
                    <p className="text-sm text-red-600">{String(errors.email.message)}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-sm font-semibold">
                    Téléphone <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    {...register('phone')}
                    disabled={isLoading}
                    className="h-11"
                  />
                  {errors.phone && (
                    <p className="text-sm text-red-600">{String(errors.phone.message)}</p>
                  )}
                </div>
              </div>

              {/* Genre et Niveau */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">
                    Sexe <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    onValueChange={(value) => setValue('gender', value as any)}
                    disabled={isLoading}
                    defaultValue={currentUserProfile?.gender}
                  >
                    <SelectTrigger className="h-11">
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
                    <p className="text-sm text-red-600">{String(errors.gender.message)}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-semibold">
                    Niveau <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    onValueChange={(value) => setValue('level', value as any)}
                    disabled={isLoading}
                    defaultValue={currentUserProfile?.level}
                  >
                    <SelectTrigger className="h-11">
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
                    <p className="text-sm text-red-600">{String(errors.level.message)}</p>
                  )}
                </div>
              </div>

              {/* Poste (solo_positional) */}
              {tournament.registration_mode === 'solo_positional' && (
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">
                    Poste <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    onValueChange={(value) => {
                      setValue('position' as any, value as any);
                      setSelectedPosition(value);
                    }}
                    disabled={isLoading}
                    value={selectedPosition}
                  >
                    <SelectTrigger className="h-11">
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
                  <p className="text-xs text-slate-500 mt-1">
                    💡 La sélection finale sera effectuée par l'organisateur
                  </p>
                  {errors.position && (
                    <p className="text-sm text-red-600">{(errors as any).position.message}</p>
                  )}
                </div>
              )}

              {/* Équipe (team) */}
              {tournament.registration_mode === 'team' && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="teamName" className="text-sm font-semibold">
                      Nom d'équipe <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="teamName"
                      {...register('teamName' as any)}
                      disabled={isLoading}
                      placeholder="Les champions"
                      className="h-11"
                    />
                    {(errors as any).teamName && (
                      <p className="text-sm text-red-600">{(errors as any).teamName.message}</p>
                    )}
                  </div>

                  {tournament.variant === 'beach_2x2' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="teammateFirstName" className="text-sm font-semibold">
                          Prénom coéquipier <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="teammateFirstName"
                          {...register('teammateFirstName' as any)}
                          disabled={isLoading}
                          className="h-11"
                        />
                        {(errors as any).teammateFirstName && (
                          <p className="text-sm text-red-600">
                            {(errors as any).teammateFirstName.message}
                          </p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="teammateLastName" className="text-sm font-semibold">
                          Nom coéquipier <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="teammateLastName"
                          {...register('teammateLastName' as any)}
                          disabled={isLoading}
                          className="h-11"
                        />
                        {(errors as any).teammateLastName && (
                          <p className="text-sm text-red-600">
                            {(errors as any).teammateLastName.message}
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* Boutons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowForm(false)}
                  disabled={isLoading}
                  className="h-11 flex-1 border-2"
                >
                  Annuler
                </Button>
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="h-11 flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Inscription en cours...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="mr-2 h-4 w-4" />
                      Confirmer l'inscription
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  // État: Ne peut pas s'inscrire (deadline passée, etc.)
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.25 }}
    >
      <Alert className="border-slate-300 bg-slate-50">
        <AlertCircle className="h-5 w-5" />
        <AlertTitle className="text-lg font-semibold mb-2">Inscriptions fermées</AlertTitle>
        <AlertDescription className="text-slate-600">
          La période d'inscription pour ce tournoi est terminée.
        </AlertDescription>
      </Alert>
    </motion.div>
  );
}

