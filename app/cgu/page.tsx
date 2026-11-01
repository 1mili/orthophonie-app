import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ScrollText } from "lucide-react";
import { WaveDivider } from "@/components/Waveform";
import { site } from "@/data/content";

export const metadata: Metadata = {
  title: `Conditions générales d'utilisation — ${site.name}`,
  description:
    "Conditions d'utilisation de la plateforme de rendez-vous, téléconsultation et boutique pédagogique.",
};

export default function CguPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-sm font-medium text-ink/60 hover:text-coral"
      >
        <ArrowLeft className="h-4 w-4 rtl:rotate-180" /> Retour à l&apos;accueil
      </Link>

      <div className="mt-8 flex items-center gap-3">
        <ScrollText className="h-6 w-6 text-coral" />
        <span className="text-xs font-semibold uppercase tracking-wider text-coral">
          Mentions légales
        </span>
      </div>
      <h1 className="mt-2 font-display text-4xl font-semibold tracking-tight">
        Conditions générales d&apos;utilisation
      </h1>
      <p className="mt-3 text-sm text-ink/60">
        Dernière mise à jour :{" "}
        {new Date().toLocaleDateString("fr-FR", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })}
      </p>
      <WaveDivider className="mt-8 max-w-xs" />

      <div className="prose-sm mt-10 space-y-10 leading-relaxed text-ink/75">
        <section>
          <h2 className="font-display text-xl font-semibold text-ink">
            1. Objet
          </h2>
          <p className="mt-3">
            Les présentes conditions régissent l&apos;accès et l&apos;utilisation du
            site {site.name} : prise de rendez-vous, espace parent, téléconsultation,
            blog éducatif et boutique pédagogique.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl font-semibold text-ink">
            2. Accès au service
          </h2>
          <p className="mt-3">
            La consultation du site est libre. La prise de rendez-vous, l&apos;espace
            parent, la téléconsultation et le contenu premium nécessitent la création
            d&apos;un compte et l&apos;acceptation de ces conditions.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl font-semibold text-ink">
            3. Compte utilisateur
          </h2>
          <p className="mt-3">
            Vous êtes responsable de la confidentialité de vos identifiants et des
            informations que vous communiquez (notamment celles concernant votre
            enfant). Toute utilisation frauduleuse doit être signalée à{" "}
            <strong>{site.email}</strong>.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl font-semibold text-ink">
            4. Rendez-vous et téléconsultation
          </h2>
          <ul className="mt-3 ms-4 list-disc space-y-1">
            <li>
              Un rendez-vous confirmé constitue un engagement. En cas d&apos;empêchement,
              merci de prévenir le cabinet dans les meilleurs délais.
            </li>
            <li>
              La téléconsultation nécessite une connexion internet stable, un
              navigateur récent et l&apos;autorisation d&apos;accès à la caméra et au
              microphone.
            </li>
            <li>
              Les notes de séance et documents partagés sont destinés au suivi
              thérapeutique et ne remplacent pas un dossier médical hospitalier.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="font-display text-xl font-semibold text-ink">
            5. Boutique
          </h2>
          <p className="mt-3">
            Les commandes de la boutique pédagogique sont payées via Stripe. Les
            prix sont indiqués en dinars tunisiens. Les délais de livraison sont
            communiqués lors de la confirmation de commande.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl font-semibold text-ink">
            6. Contenu éditorial
          </h2>
          <p className="mt-3">
            Les articles du blog et le quiz d&apos;évaluation ont une visée
            informative. Ils ne constituent pas un diagnostic et ne remplacent pas
            un bilan orthophonique.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl font-semibold text-ink">
            7. Données personnelles
          </h2>
          <p className="mt-3">
            Le traitement des données est décrit dans la{" "}
            <Link href="/confidentialite" className="font-semibold text-coral hover:underline">
              politique de confidentialité
            </Link>
            . Vous pouvez exercer vos droits d&apos;accès, de rectification, de
            portabilité et d&apos;effacement depuis votre profil.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl font-semibold text-ink">
            8. Responsabilité
          </h2>
          <p className="mt-3">
            {site.name} s&apos;efforce d&apos;assurer la disponibilité du service. La
            qualité d&apos;une téléconsultation dépend aussi de votre matériel et de
            votre réseau. En cas d&apos;interruption technique, une reconnexion
            automatique est proposée ; un nouveau créneau peut être convenu si
            besoin.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl font-semibold text-ink">
            9. Contact
          </h2>
          <p className="mt-3">
            {site.name} — {site.ville}
            <br />
            <a href={`mailto:${site.email}`} className="font-semibold text-coral hover:underline">
              {site.email}
            </a>{" "}
            · {site.phone}
          </p>
        </section>
      </div>

      <div className="mt-12 border-t border-line pt-6">
        <Link href="/confidentialite" className="text-sm font-semibold text-coral hover:underline">
          Voir la politique de confidentialité →
        </Link>
      </div>
    </div>
  );
}
