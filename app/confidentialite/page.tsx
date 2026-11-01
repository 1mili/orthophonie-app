import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Shield } from "lucide-react";
import { WaveDivider } from "@/components/Waveform";
import { site } from "@/data/content";

export const metadata: Metadata = {
  title: `Politique de confidentialité — ${site.name}`,
  description:
    "Comment nous collectons, utilisons et protégeons vos données personnelles conformément au RGPD.",
};

export default function ConfidentialitePage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-sm font-medium text-ink/60 hover:text-coral"
      >
        <ArrowLeft className="h-4 w-4 rtl:rotate-180" /> Retour à l&apos;accueil
      </Link>

      <div className="mt-8 flex items-center gap-3">
        <Shield className="h-6 w-6 text-coral" />
        <span className="text-xs font-semibold uppercase tracking-wider text-coral">
          RGPD & Confidentialité
        </span>
      </div>
      <h1 className="mt-2 font-display text-4xl font-semibold tracking-tight">
        Politique de confidentialité
      </h1>
      <p className="mt-3 text-sm text-ink/60">
        Dernière mise à jour : {new Date().toLocaleDateString("fr-FR", { year: "numeric", month: "long", day: "numeric" })}
      </p>
      <WaveDivider className="mt-8 max-w-xs" />

      <div className="prose-sm mt-10 space-y-10 text-ink/75 leading-relaxed">

        <section>
          <h2 className="font-display text-xl font-semibold text-ink">
            1. Responsable du traitement
          </h2>
          <p className="mt-3">
            {site.name} est responsable du traitement de vos données personnelles.
            Pour toute question relative à la protection de vos données, vous pouvez
            nous contacter à l&apos;adresse : <strong>{site.email}</strong>.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl font-semibold text-ink">
            2. Données collectées
          </h2>
          <p className="mt-3">Nous collectons uniquement les données nécessaires au fonctionnement de nos services :</p>
          <ul className="mt-3 ms-4 space-y-1 list-disc">
            <li><strong>Données d&apos;identification :</strong> nom complet, adresse e-mail, numéro de téléphone.</li>
            <li><strong>Données des enfants :</strong> prénom, âge, notes descriptives (saisies par le parent).</li>
            <li><strong>Données de rendez-vous :</strong> date, heure, service, mode (cabinet/téléconsultation).</li>
            <li><strong>Données de paiement :</strong> traitées exclusivement par Stripe — nous ne stockons aucune information bancaire.</li>
            <li><strong>Données de session :</strong> cookie JWT sécurisé (httpOnly) pour l&apos;authentification.</li>
            <li><strong>Données de téléconsultation :</strong> messages de chat, documents partagés, notes de séance.</li>
          </ul>
        </section>

        <section>
          <h2 className="font-display text-xl font-semibold text-ink">
            3. Finalités du traitement
          </h2>
          <p className="mt-3">Vos données sont utilisées pour :</p>
          <ul className="mt-3 ms-4 space-y-1 list-disc">
            <li>Gérer vos rendez-vous et téléconsultations.</li>
            <li>Vous envoyer des confirmations et rappels par e-mail ou SMS.</li>
            <li>Vous permettre d&apos;accéder à votre espace personnel et aux contenus premium.</li>
            <li>Traiter vos commandes et paiements.</li>
            <li>Améliorer nos services et assurer la sécurité de la plateforme.</li>
          </ul>
        </section>

        <section>
          <h2 className="font-display text-xl font-semibold text-ink">
            4. Base légale du traitement
          </h2>
          <p className="mt-3">
            Le traitement de vos données repose sur : l&apos;<strong>exécution du contrat</strong> (prise de rendez-vous,
            téléconsultation), votre <strong>consentement</strong> (cookies, contenu premium), et
            l&apos;<strong>intérêt légitime</strong> pour la sécurité de la plateforme.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl font-semibold text-ink">
            5. Durée de conservation
          </h2>
          <ul className="mt-3 ms-4 space-y-1 list-disc">
            <li>Données de compte : conservées pendant toute la durée de l&apos;abonnement + 3 ans après fermeture.</li>
            <li>Données médicales (bilans, notes de séance) : 5 ans conformément à la réglementation sanitaire.</li>
            <li>Données de paiement : conservées par Stripe selon leurs conditions.</li>
            <li>Cookies de session : 30 jours (supprimés à la déconnexion).</li>
          </ul>
        </section>

        <section>
          <h2 className="font-display text-xl font-semibold text-ink">
            6. Partage des données
          </h2>
          <p className="mt-3">
            Nous ne vendons ni ne partageons vos données personnelles à des tiers à des fins commerciales.
            Certains prestataires techniques peuvent avoir accès à vos données dans le cadre strict de la
            fourniture de leurs services :
          </p>
          <ul className="mt-3 ms-4 space-y-1 list-disc">
            <li><strong>Stripe</strong> — traitement des paiements.</li>
            <li><strong>Twilio</strong> — envoi de SMS de rappel.</li>
            <li><strong>Nodemailer / SMTP</strong> — envoi d&apos;e-mails de confirmation.</li>
            <li><strong>Vercel / AWS</strong> — hébergement sécurisé de l&apos;application.</li>
          </ul>
        </section>

        <section>
          <h2 className="font-display text-xl font-semibold text-ink">
            7. Sécurité des données
          </h2>
          <p className="mt-3">
            Nous appliquons des mesures techniques et organisationnelles pour protéger vos données :
            chiffrement des mots de passe (bcrypt), authentification par JWT signé, communication HTTPS,
            accès aux données médicales réservé aux praticiens autorisés (RBAC).
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl font-semibold text-ink">
            8. Vos droits
          </h2>
          <p className="mt-3">
            Conformément au RGPD, vous disposez des droits suivants :
          </p>
          <ul className="mt-3 ms-4 space-y-1 list-disc">
            <li><strong>Droit d&apos;accès</strong> : obtenir une copie de vos données (disponible dans l&apos;espace parent).</li>
            <li><strong>Droit de rectification</strong> : corriger vos données dans votre profil.</li>
            <li><strong>Droit à l&apos;effacement</strong> : supprimer votre compte et vos données (disponible dans votre profil).</li>
            <li><strong>Droit d&apos;opposition</strong> : vous opposer à certains traitements.</li>
            <li><strong>Droit à la portabilité</strong> : exporter vos données (format JSON, disponible dans votre profil).</li>
          </ul>
          <p className="mt-3">
            Pour exercer ces droits, rendez-vous dans{" "}
            <Link href="/espace-parent/profil" className="font-semibold text-coral hover:underline">
              votre profil
            </Link>{" "}
            ou contactez-nous à <strong>{site.email}</strong>.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl font-semibold text-ink">
            9. Cookies
          </h2>
          <p className="mt-3">
            Nous utilisons exclusivement des cookies essentiels au fonctionnement de la plateforme :
            session d&apos;authentification, préférence de langue et consentement aux cookies.
            Aucun cookie publicitaire ou de suivi tiers n&apos;est utilisé.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl font-semibold text-ink">
            10. Contact
          </h2>
          <p className="mt-3">
            Pour toute question relative à la protection de vos données personnelles :{" "}
            <a href={`mailto:${site.email}`} className="font-semibold text-coral hover:underline">
              {site.email}
            </a>
          </p>
        </section>
      </div>

      <div className="mt-12 border-t border-line pt-6">
        <Link href="/cgu" className="text-sm font-semibold text-coral hover:underline">
          Voir les Conditions Générales d&apos;Utilisation →
        </Link>
      </div>
    </div>
  );
}
