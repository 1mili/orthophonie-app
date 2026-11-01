"use client";

import React, { useState } from "react";
import {
  RabbitMascot,
  BearMascot,
  BirdMascot,
  SmilingChildMascot,
  ExerciseBoxMascot,
} from "./CuteIllustrations";
import { Sparkles, Play, X, Star, Clock, Heart, Award } from "lucide-react";

export type ExerciseItem = {
  id: string;
  titleFr: string;
  titleAr: string;
  mascot: "bird" | "rabbit" | "bear" | "child" | "box";
  categoryFr: string;
  categoryAr: string;
  age: string;
  duration: string;
  bgPastel: string;
  borderPastel: string;
  badgeBg: string;
  badgeText: string;
  descriptionFr: string;
  descriptionAr: string;
  instructionsFr: string[];
  instructionsAr: string[];
  funTipFr: string;
  funTipAr: string;
};

const EXERCISES: ExerciseItem[] = [
  {
    id: "souffle-magique",
    titleFr: "Le Souffle Magique du Petit Oiseau",
    titleAr: "النفخ السحري للعصفور الصغير",
    mascot: "bird",
    categoryFr: "Souffle & Débit",
    categoryAr: "التنفس ونبرة الصوت",
    age: "3 – 6 ans",
    duration: "5 min",
    bgPastel: "bg-[#e0f2fe]/80 hover:bg-[#e0f2fe]",
    borderPastel: "border-[#bae6fd]",
    badgeBg: "bg-[#e0f2fe]",
    badgeText: "text-[#0284c7]",
    descriptionFr:
      "Aide le petit oiseau à faire voler sa plume magique tout en douceur grâce à une respiration calme et profonde.",
    descriptionAr:
      "ساعد العصفور الصغير على إبقاء ريشته السحرية طافية في الهواء بلطف من خلال تنفس هادئ وعميق.",
    instructionsFr: [
      "Inspire doucement par le nez comme pour sentir une jolie fleur.",
      "Maintiens l'air 2 secondes dans tes poumons.",
      "Souffle doucement par la bouche comme pour refroidir une soupe tiède, en faisant un petit 'ffff'.",
      "Répète 5 fois en observant la plume qui danse !",
    ],
    instructionsAr: [
      "تنفس بهدوء عبر الأنف وكأنك تشم وردة جميلة.",
      "احبس الهواء ثانيتين في رئتيك.",
      "انفخ بلطف من فمك ببطء مع إصدار صوت 'فففف'.",
      "كرر التمرين 5 مرات وشاهد الريشة وهي ترقص في الهواء !",
    ],
    funTipFr: "Idéal pour calmer l'enfant avant la séance et travailler la fluence !",
    funTipAr: "تمرين رائع للاسترخاء وضبط إيقاع التحدث !",
  },
  {
    id: "sons-lapin",
    titleFr: "L'Aventure des Sons du Lapin",
    titleAr: "مغامرة أصوات الأرنب الشقي",
    mascot: "rabbit",
    categoryFr: "Articulation & Sons",
    categoryAr: "مخارج الحروف والنطق",
    age: "4 – 8 ans",
    duration: "7 min",
    bgPastel: "bg-[#fff3f0] hover:bg-[#fcd5ce]/50",
    borderPastel: "border-[#fcd5ce]",
    badgeBg: "bg-[#fcd5ce]",
    badgeText: "text-[#e0684b]",
    descriptionFr:
      "Imite les bruits de la forêt avec le lapin : le serpent qui siffle (Sss), le vent qui souffle (Chhh) et la fusée (Rrr).",
    descriptionAr:
      "قلّد أصوات الطبيعة مع الأرنب : فحيح الأفعى (سسس)، صوت الرياح (ششش) وصوت المحرك (ررر).",
    instructionsFr: [
      "Place ta langue derrière les dents du bas et souffle : 'Sssss' (le serpent).",
      "Avance tes lèvres en petit rond et dis : 'Chhhh' (le vent dans les arbres).",
      "Fais vibrer le bout de ta langue : 'Rrrrr' (la voiture de course).",
      "Répète chaque son 3 fois avec le sourire !",
    ],
    instructionsAr: [
      "ضع لسانك خلف أسنانك السفلية وانفخ : 'سسسس' (صوت الأفعى).",
      "شكّل فمك على شكل دائرة وقل : 'شششش' (صوت الرياح).",
      "حرّك طرف لسانك مع اهتزاز لطيف : 'رررر' (صوت السيارة).",
      "كرر كل صوت 3 مرات بابتسامة مشرقة !",
    ],
    funTipFr: "Utilisez un miroir pour que l'enfant voie la position de ses lèvres et de sa langue.",
    funTipAr: "استخدم المرآة ليرى الطفل وضعية شفتيه ولسانه بكل وضوح.",
  },
  {
    id: "chasse-mots",
    titleFr: "La Chasse aux Mots de l'Ourson",
    titleAr: "صيد الكلمات مع الدب اللطيف",
    mascot: "bear",
    categoryFr: "Vocabulaire",
    categoryAr: "تنمية الرصيد اللغوي",
    age: "3 – 7 ans",
    duration: "8 min",
    bgPastel: "bg-[#fef9c3]/70 hover:bg-[#fef9c3]",
    borderPastel: "border-[#fef08a]",
    badgeBg: "bg-[#fef08a]",
    badgeText: "text-[#713f12]",
    descriptionFr:
      "Retrouve et nomme tous les trésors cachés par l'ourson dans la chambre : animaux, fruits, couleurs et habits !",
    descriptionAr:
      "ابحث عن الكنوز وسمّها مع الدب : حيوانات، فواكه، ألوان وملابس مخبأة بعناية !",
    instructionsFr: [
      "Trouve 3 choses rouges autour de toi et nomme-les à voix haute.",
      "Nomme 3 animaux qui savent voler ou nager.",
      "Formule une phrase complète pour chaque mot : 'L'ourson voit un...'",
      "Félicite ton enfant à chaque mot trouvé avec un grand câlin !",
    ],
    instructionsAr: [
      "ابحث عن 3 أشياء حمراء حولك في الغرفة وانطق اسمها بصوت واضح.",
      "اذكر 3 حيوانات تطير أو تسبح.",
      "ركّب جملة كاملة لكل كلمة : 'يرى الدب الصغير...'",
      "شجع طفلك بعناق دافئ بعد كل إجابة موفقة !",
    ],
    funTipFr: "Encouragez l'enfant à enrichir sa phrase avec un adjectif (couleur, taille).",
    funTipAr: "شجع الطفل على إضافة صفة للكلمة (اللون، الحجم، الشكل).",
  },
  {
    id: "fabrique-histoires",
    titleFr: "La Fabrique à Histoires",
    titleAr: "مصنع الحكايات والقصص",
    mascot: "child",
    categoryFr: "Narration & Syntaxe",
    categoryAr: "السرد وتراكيب الجمل",
    age: "5 – 10 ans",
    duration: "10 min",
    bgPastel: "bg-[#f4faf2] hover:bg-[#e8f5e5]",
    borderPastel: "border-[#d4ebd0]",
    badgeBg: "bg-[#d4ebd0]",
    badgeText: "text-[#2d6a4f]",
    descriptionFr:
      "Choisis un héros, un lieu secret et un pouvoir magique pour inventer ensemble une histoire rigolote.",
    descriptionAr:
      "اختر بطلاً، مكاناً سرياً وقوة خارقة لتأليف حكاية شيقة وممتعة معاً.",
    instructionsFr: [
      "Qui est le héros ? (Un lapin explorateur, un petit robot...)",
      "Où va-t-il ? (Dans un nuage en barbe à papa, au fond de l'océan...)",
      "Quel petit problème arrive-t-il au héros ?",
      "Comment réussit-il à le résoudre avec ses amis ?",
    ],
    instructionsAr: [
      "من هو البطل ؟ (أرنب شجاع، روبوت لطيف...)",
      "إلى أين يتوجه ؟ (إلى جزيرة الحلوى، إلى قاع المحيط...)",
      "ما هي المشكلة الطريفة التي واجهته ؟",
      "كيف استطاع حلها بمساعدة أصدقائه ؟",
    ],
    funTipFr: "Travaille la chronologie : 'D'abord...', 'Puis...', 'Enfin...'",
    funTipAr: "يساعد على تعلم التسلسل الزمني : 'في البداية'، 'ثم'، 'وفي النهاية'.",
  },
  {
    id: "detective-syllabes",
    titleFr: "Le Détective des Syllabes",
    titleAr: "مفتش المقاطع والحروف",
    mascot: "box",
    categoryFr: "Conscience Phonologique",
    categoryAr: "الوعي الصوتي والقراءة",
    age: "6 – 9 ans",
    duration: "6 min",
    bgPastel: "bg-[#e8f5e5] hover:bg-[#d4ebd0]/70",
    borderPastel: "border-[#d4ebd0]",
    badgeBg: "bg-[#d4ebd0]",
    badgeText: "text-[#2d6a4f]",
    descriptionFr:
      "Frappe dans tes mains pour compter les morceaux de mots et trouve la syllabe secrète !",
    descriptionAr:
      "صفّق بيديك لتقسيم الكلمات إلى مقاطع واكتشف الحرف السري المخبأ !",
    instructionsFr: [
      "Choisis un mot : 'CHO - CO - LAT'.",
      "Frappe dans tes mains pour chaque syllabe : 1, 2, 3 frappes !",
      "Quel son entends-tu au tout début du mot ?",
      "Trouve un autre mot qui commence par le même son !",
    ],
    instructionsAr: [
      "اختر كلمة : 'فَ - رَا - وَ - لَة'.",
      "صفّق بيديك مع كل مقطع صوتي : 1، 2، 3، 4 تصفيقات !",
      "ما هو الحرف أو الصوت الذي بدأنا به الكلمة ؟",
      "ابحث عن كلمة أخرى تبدأ بنفس الصوت !",
    ],
    funTipFr: "La base indispensable pour préparer et consolider l'apprentissage de la lecture.",
    funTipAr: "أساس جوهري لتقوية مهارات الاستعداد للقراءة والتهجئة السليمة.",
  },
];

export function ExerciseBoxClient({ isRtl = false }: { isRtl?: boolean }) {
  const [activeExercise, setActiveExercise] = useState<ExerciseItem | null>(null);
  const [completedExercises, setCompletedExercises] = useState<string[]>([]);
  const [stepIndex, setStepIndex] = useState(0);

  const handleOpenExercise = (ex: ExerciseItem) => {
    setActiveExercise(ex);
    setStepIndex(0);
  };

  const handleClose = () => {
    setActiveExercise(null);
    setStepIndex(0);
  };

  const handleFinishExercise = (id: string) => {
    if (!completedExercises.includes(id)) {
      setCompletedExercises((prev) => [...prev, id]);
    }
    handleClose();
  };

  const renderMascot = (type: ExerciseItem["mascot"], size = 80) => {
    switch (type) {
      case "bird":
        return <BirdMascot size={size} className="animate-float" />;
      case "rabbit":
        return <RabbitMascot size={size} className="animate-bounce-soft" />;
      case "bear":
        return <BearMascot size={size} className="animate-wiggle" />;
      case "child":
        return <SmilingChildMascot size={size} className="animate-float" />;
      case "box":
        return <ExerciseBoxMascot size={size} className="animate-bounce-soft" />;
    }
  };

  return (
    <div>
      {/* Exercise Grid */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {EXERCISES.map((ex) => {
          const isDone = completedExercises.includes(ex.id);
          const title = isRtl ? ex.titleAr : ex.titleFr;
          const category = isRtl ? ex.categoryAr : ex.categoryFr;
          const desc = isRtl ? ex.descriptionAr : ex.descriptionFr;

          return (
            <div
              key={ex.id}
              className={`group relative flex flex-col justify-between overflow-hidden rounded-3xl border-2 p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md ${ex.bgPastel} ${ex.borderPastel}`}
            >
              {/* Completed badge */}
              {isDone && (
                <div className="absolute top-4 end-4 flex items-center gap-1 rounded-full bg-emerald-500 px-3 py-1 text-xs font-bold text-white shadow-sm">
                  <Star className="h-3.5 w-3.5 fill-current" />
                  {isRtl ? "مكتمل !" : "Validé !"}
                </div>
              )}

              <div>
                {/* Mascot visual & category pill */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex h-20 w-20 shrink-0 items-center justify-center">
                    {renderMascot(ex.mascot, 72)}
                  </div>
                  <div className="flex flex-col items-end gap-1.5">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-bold tracking-wide ${ex.badgeBg} ${ex.badgeText}`}
                    >
                      {category}
                    </span>
                    <span className="flex items-center gap-1 text-[11px] font-semibold text-slate-500">
                      <Clock className="h-3 w-3" /> {ex.duration} · {ex.age}
                    </span>
                  </div>
                </div>

                {/* Title & Description */}
                <h3 className="mt-4 font-display text-lg font-bold text-slate-900 group-hover:text-coral transition-colors">
                  {title}
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-slate-600 line-clamp-3">
                  {desc}
                </p>
              </div>

              {/* Action Button */}
              <div className="mt-6 pt-4 border-t border-slate-200/60">
                <button
                  onClick={() => handleOpenExercise(ex)}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl bg-white border-2 border-[#d4ebd0] px-4 py-2.5 text-xs font-bold text-[#2d6a4f] shadow-xs transition-all hover:bg-[#f8a98c] hover:border-[#f8a98c] hover:text-white hover:shadow-md active:scale-95"
                >
                  <Play className="h-3.5 w-3.5 fill-current" />
                  {isRtl ? "ابدأ التمرين الآن" : "Commencer l'exercice"}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Interactive Modal when clicking an exercise */}
      {activeExercise && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div
            className={`relative max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-3xl border-2 bg-white p-6 md:p-8 shadow-2xl ${activeExercise.borderPastel}`}
          >
            {/* Close button */}
            <button
              onClick={handleClose}
              className="absolute top-5 end-5 flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-900 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>

            {/* Header with Mascot */}
            <div className="flex flex-col sm:flex-row items-center gap-5 pb-6 border-b border-slate-100">
              <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-3xl bg-slate-50 p-2 shadow-inner">
                {renderMascot(activeExercise.mascot, 84)}
              </div>
              <div className="text-center sm:text-start">
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-bold ${activeExercise.badgeBg} ${activeExercise.badgeText}`}
                  >
                    {isRtl ? activeExercise.categoryAr : activeExercise.categoryFr}
                  </span>
                  <span className="text-xs font-medium text-slate-500">
                    {activeExercise.age} · {activeExercise.duration}
                  </span>
                </div>
                <h3 className="mt-2 font-display text-2xl font-bold text-slate-900">
                  {isRtl ? activeExercise.titleAr : activeExercise.titleFr}
                </h3>
              </div>
            </div>

            {/* Interactive Steps Guide */}
            <div className="mt-6">
              <h4 className="flex items-center gap-2 text-sm font-bold text-slate-800">
                <Sparkles className="h-4 w-4 text-amber-500" />
                {isRtl ? "خطوات اللعبة والتطبيق :" : "Étapes du jeu :"}
              </h4>

              <div className="mt-4 space-y-3">
                {(isRtl ? activeExercise.instructionsAr : activeExercise.instructionsFr).map(
                  (step, idx) => (
                    <div
                      key={idx}
                      className={`flex items-start gap-3 rounded-2xl p-3.5 transition-all ${
                        idx === stepIndex
                          ? "bg-amber-50 border border-amber-200 shadow-sm"
                          : "bg-slate-50/70 border border-slate-100"
                      }`}
                    >
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-amber-400 text-xs font-bold text-slate-900 shadow-xs">
                        {idx + 1}
                      </span>
                      <p className="text-xs leading-relaxed text-slate-700 font-medium">
                        {step}
                      </p>
                    </div>
                  )
                )}
              </div>

              {/* Ortho Tip Note */}
              <div className="mt-5 rounded-2xl border border-sky-200 bg-sky-50/70 p-4">
                <div className="flex items-center gap-2 text-xs font-bold text-sky-900">
                  <Heart className="h-3.5 w-3.5 text-rose-500 fill-current" />
                  {isRtl ? "نصيحة أخصائي النطق :" : "Le conseil de l'orthophoniste :"}
                </div>
                <p className="mt-1 text-xs text-sky-800">
                  {isRtl ? activeExercise.funTipAr : activeExercise.funTipFr}
                </p>
              </div>
            </div>

            {/* Modal Bottom Actions */}
            <div className="mt-8 flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-100">
              <button
                onClick={handleClose}
                className="rounded-full px-5 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors"
              >
                {isRtl ? "إلغاء" : "Fermer"}
              </button>

              <button
                onClick={() => handleFinishExercise(activeExercise.id)}
                className="flex items-center gap-2 rounded-full bg-[#f8a98c] px-6 py-2.5 text-xs font-bold text-white shadow-md shadow-[#f8a98c]/30 hover:bg-[#e0684b] active:scale-95 transition-all"
              >
                <Award className="h-4 w-4" />
                {isRtl ? "تم إنجاز النشاط بنجاح ! ⭐" : "Valider et gagner mon étoile ! ⭐"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
