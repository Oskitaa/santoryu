import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Sparkles, ArrowRight, ArrowLeft, CheckCircle2, Lightbulb } from 'lucide-react';
import { cn } from '../../lib/utils';

interface GuideSection {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  content: {
    heading: string;
    description: string;
    examples?: { title: string; jp: string; romaji: string; es: string; note?: string }[];
    tip?: string;
  }[];
}

const guideSections: GuideSection[] = [
  {
    id: 'intro_writing',
    title: 'Los 3 Sistemas de Escritura',
    subtitle: '¿Por qué el japonés usa tres alfabetos a la vez?',
    icon: '🎌',
    content: [
      {
        heading: '1. Los Tres Pilares de la Escritura',
        description:
          'A diferencia del español, el japonés no utiliza un solo abecedario, sino tres sistemas complementarios que trabajan juntos en una misma frase:',
        examples: [
          {
            title: '1. Hiragana (ひらがな)',
            jp: 'あ、い、う、え、お',
            romaji: 'a, i, u, e, o',
            es: '46 caracteres curvilíneos usados para la gramática, partículas y palabras nativas japonesas.',
          },
          {
            title: '2. Katakana (カタカナ)',
            jp: 'ア、イ、ウ、エ、オ',
            romaji: 'a, i, u, e, o',
            es: '46 caracteres angulosos y rectos usados para palabras extranjeras, nombres de otros países y onomatopeyas (ej. パン = pan, コーヒー = café).',
          },
          {
            title: '3. Kanji (漢字)',
            jp: '日、月、木、人',
            romaji: 'sol/día, luna/mes, árbol, persona',
            es: 'Ideogramas de origen chino que representan conceptos completos, raíces de verbos y sustantivos principales.',
          },
        ],
      },
      {
        heading: 'Ejemplo Real en una Frase',
        description: 'Mira cómo se combinan armónicamente en una sola oración cotidiana:',
        examples: [
          {
            title: 'Desglose de una frase japonesa:',
            jp: '私はパンを食べます。',
            romaji: 'Watashi wa pan o tabemasu.',
            es: 'Yo como pan.',
            note: '私 (Kanji: Yo) + は (Hiragana: partícula) + パン (Katakana: pan) + を (Hiragana: objeto) + 食 (Kanji: comer) + べます (Hiragana: terminación verbal)',
          },
        ],
        tip: 'No intentes aprender todo a la vez: el primer paso siempre es dominar Hiragana, luego Katakana, y después los primeros Kanji y palabras básicas.',
      },
    ],
  },
  {
    id: 'pronunciation',
    title: 'Pronunciación y Fonética',
    subtitle: '¡Buenas noticias para los hispanohablantes!',
    icon: '🗣️',
    content: [
      {
        heading: 'Las 5 Vocales Mágicas',
        description:
          '¡El japonés tiene exactamente las mismas 5 vocales puras que el español! (A, I, U, E, O). Se pronuncian de forma limpia y directa:',
        examples: [
          { title: 'A', jp: 'あ / ア', romaji: 'a', es: 'Como la "a" de "agua"' },
          { title: 'I', jp: 'い / イ', romaji: 'i', es: 'Como la "i" de "isla"' },
          { title: 'U', jp: 'う / ウ', romaji: 'u', es: 'Como la "u" de "uva" (labios ligeramente relajados)' },
          { title: 'E', jp: 'え / エ', romaji: 'e', es: 'Como la "e" de "estrella"' },
          { title: 'O', jp: 'お / オ', romaji: 'o', es: 'Como la "o" de "oso"' },
        ],
      },
      {
        heading: 'Consonantes y la "R" Japonesa',
        description:
          'Todas las sílabas son combinaciones de una consonante + vocal (ka, ki, ku, ke, ko). El sonido de la "R" japonesa (ra, ri, ru, re, ro) es suave, entre la "r" suave de "cara" y una "l" ligera, nunca fuerte como "perro".',
        tip: 'El único sonido que puede ir solo sin vocal es la N (ん / ン).',
      },
    ],
  },
  {
    id: 'grammar_basics',
    title: 'Estructura Gramatical',
    subtitle: 'El verbo siempre va al final de la frase',
    icon: '📐',
    content: [
      {
        heading: 'Orden SOV (Sujeto - Objeto - Verbo)',
        description:
          'En español decimos: "Sujeto + Verbo + Objeto" (Yo como pizza). En japonés el orden es "Sujeto + Objeto + Verbo" (Yo pizza como). El verbo principal SIEMPRE cierra la oración.',
        examples: [
          {
            title: 'Comparativa de orden:',
            jp: '田中さんは水 (mizu) を飲みます (nomimasu)。',
            romaji: 'Tanaka-san wa mizu o nomimasu.',
            es: 'El Sr. Tanaka [Sujeto] agua [Objeto] bebe [Verbo].',
          },
        ],
      },
      {
        heading: '¿Qué son las Partículas?',
        description:
          'Son pequeñas palabras en Hiragana (como は, を, に, で) que actúan como "etiquetas" pegadas a las palabras para indicar qué papel cumplen:',
        examples: [
          { title: 'は (wa)', jp: '私は...', romaji: 'Watashi wa...', es: 'Marca de qué o quién estamos hablando ("En cuanto a mí...")' },
          { title: 'を (o)', jp: '本を読む', romaji: 'Hon o yomu', es: 'Marca qué cosa recibe la acción ("Leer un libro")' },
          { title: 'です (desu)', jp: '学生です', romaji: 'Gakusei desu', es: 'Significa "es / soy / somos" en tono educado' },
        ],
      },
    ],
  },
  {
    id: 'jlpt_guide',
    title: 'Niveles Oficiales (JLPT)',
    subtitle: 'Entendiendo la escala de aprendizaje',
    icon: '🏯',
    content: [
      {
        heading: '¿Cómo funcionan los niveles JLPT?',
        description:
          'El examen oficial de japonés (JLPT - Japanese Language Proficiency Test) tiene 5 niveles numerados de forma inversa:',
        examples: [
          {
            title: 'Nivel N5 (Principiante Básico)',
            jp: '入門 / 初級',
            romaji: 'Nivel Inicial',
            es: 'El punto de partida: dominar Hiragana, Katakana, ~100 Kanji elementales y ~800 palabras para desenvolverse en situaciones cotidianas.',
          },
          {
            title: 'Nivel N4 (Elemental)',
            jp: '初級後半',
            romaji: 'Nivel Elemental',
            es: '~300 Kanji y ~1.500 palabras. Conversaciones diarias sencillas.',
          },
          {
            title: 'Nivel N3 (Intermedio)',
            jp: '中級',
            romaji: 'Nivel Puente',
            es: '~650 Kanji y comprensión de artículos y anime con soltura.',
          },
          {
            title: 'Nivel N2 y N1 (Avanzado / Experto)',
            jp: '上級 / 最上級',
            romaji: 'Nivel Experto',
            es: 'Lectura fluida de periódicos, novelas y nivel nativo/profesional.',
          },
        ],
        tip: 'Santoryu está diseñado para guiarte paso a paso empezando desde el Nivel 1 de tu aprendizaje (N5), asegurando bases sólidas e intuitivas.',
      },
    ],
  },
];

interface BeginnerGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BeginnerGuideModal: React.FC<BeginnerGuideModalProps> = ({ isOpen, onClose }) => {
  const [activeSectionIndex, setActiveSectionIndex] = useState(0);

  if (!isOpen) return null;

  const currentSection = guideSections[activeSectionIndex];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="w-full max-w-lg bg-[var(--color-bg-surface)] border border-white/10 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh]"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Modal Header */}
          <div className="p-4 border-b border-white/5 flex items-center justify-between bg-[var(--color-bg-elevated)]/50">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{currentSection.icon}</span>
              <div>
                <h2 className="font-bold text-base leading-tight">{currentSection.title}</h2>
                <p className="text-[11px] text-[var(--color-text-secondary)]">{currentSection.subtitle}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full bg-[var(--color-bg-surface)] text-[var(--color-text-secondary)] hover:text-white tap-highlight"
            >
              <X size={18} />
            </button>
          </div>

          {/* Section Indicators */}
          <div className="flex px-4 pt-3 gap-1.5">
            {guideSections.map((sec, idx) => (
              <button
                key={sec.id}
                onClick={() => setActiveSectionIndex(idx)}
                className={cn(
                  'flex-1 h-1.5 rounded-full transition-all',
                  idx === activeSectionIndex
                    ? 'bg-[var(--color-accent)]'
                    : idx < activeSectionIndex
                    ? 'bg-[var(--color-accent)]/40'
                    : 'bg-white/10'
                )}
              />
            ))}
          </div>

          {/* Scrollable Content */}
          <div className="p-5 overflow-y-auto space-y-5 flex-1 text-sm leading-relaxed">
            {currentSection.content.map((item, idx) => (
              <div key={idx} className="space-y-3">
                <h3 className="font-bold text-[var(--color-accent-gold)] text-sm flex items-center gap-2">
                  <Sparkles size={14} />
                  {item.heading}
                </h3>
                <p className="text-[var(--color-text-primary)] text-xs sm:text-sm">
                  {item.description}
                </p>

                {item.examples && (
                  <div className="space-y-2 pt-1">
                    {item.examples.map((ex, i) => (
                      <div key={i} className="card-elevated p-3 rounded-2xl border border-white/5 space-y-1">
                        <span className="text-xs font-bold text-[var(--color-accent)] block">
                          {ex.title}
                        </span>
                        <div className="flex items-baseline gap-2">
                          <span className="font-jp text-base font-bold">{ex.jp}</span>
                          <span className="text-xs text-[var(--color-text-secondary)] font-mono">
                            {ex.romaji}
                          </span>
                        </div>
                        <p className="text-xs text-[var(--color-text-muted)]">{ex.es}</p>
                        {ex.note && (
                          <p className="text-[11px] text-[var(--color-accent-gold)]/90 pt-1 border-t border-white/5 mt-1 italic">
                            💡 {ex.note}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {item.tip && (
                  <div className="p-3 rounded-2xl bg-[var(--color-accent)]/10 border border-[var(--color-accent)]/20 flex gap-2.5 items-start">
                    <Lightbulb className="w-4 h-4 text-[var(--color-accent)] flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-[var(--color-text-primary)] leading-snug">
                      <b>Consejo clave:</b> {item.tip}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Navigation Footer */}
          <div className="p-4 border-t border-white/5 bg-[var(--color-bg-elevated)]/30 flex justify-between items-center gap-3">
            <button
              onClick={() => setActiveSectionIndex((prev) => Math.max(0, prev - 1))}
              disabled={activeSectionIndex === 0}
              className="py-2.5 px-4 rounded-xl bg-[var(--color-bg-elevated)] text-xs font-bold flex items-center gap-1.5 disabled:opacity-30 tap-highlight"
            >
              <ArrowLeft size={14} /> Anterior
            </button>

            <span className="text-xs text-[var(--color-text-secondary)] font-mono">
              {activeSectionIndex + 1} / {guideSections.length}
            </span>

            {activeSectionIndex < guideSections.length - 1 ? (
              <button
                onClick={() => setActiveSectionIndex((prev) => prev + 1)}
                className="py-2.5 px-4 rounded-xl bg-[var(--color-accent)] text-white text-xs font-bold flex items-center gap-1.5 shadow-lg tap-highlight"
              >
                Siguiente <ArrowRight size={14} />
              </button>
            ) : (
              <button
                onClick={onClose}
                className="py-2.5 px-4 rounded-xl bg-[var(--color-success)] text-white text-xs font-bold flex items-center gap-1.5 shadow-lg tap-highlight"
              >
                ¡Entendido! <CheckCircle2 size={14} />
              </button>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
