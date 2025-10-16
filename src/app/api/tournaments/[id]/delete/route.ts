import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    // Vérifier que le tournoi existe et appartient à l'utilisateur
    const { data: tournament, error: fetchError } = await supabase
      .from('tournaments')
      .select('organizer_id')
      .eq('id', params.id)
      .single();

    if (fetchError || !tournament) {
      return NextResponse.json({ error: 'Tournoi non trouvé' }, { status: 404 });
    }

    if (tournament.organizer_id !== user.id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
    }

    // Supprimer le tournoi (les inscriptions seront supprimées en cascade si configuré dans la DB)
    const { error: deleteError } = await supabase
      .from('tournaments')
      .delete()
      .eq('id', params.id);

    if (deleteError) {
      throw deleteError;
    }

    return NextResponse.json({ success: true, message: 'Tournoi supprimé avec succès' });
  } catch (error: any) {
    console.error('Erreur lors de la suppression du tournoi:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la suppression du tournoi', details: error.message },
      { status: 500 }
    );
  }
}

