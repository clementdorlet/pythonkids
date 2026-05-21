import type { LessonConcept } from "@/lib/lessons";

interface Props {
  concepts: LessonConcept[];
  levelColor: string;
}

export default function LessonConceptCards({ concepts, levelColor }: Props) {
  return (
    <div className="space-y-3 mb-6">
      {concepts.map((c, i) => (
        <div
          key={i}
          className="rounded-2xl border border-purple-100 dark:border-slate-700 bg-white dark:bg-slate-800 overflow-hidden shadow-sm"
        >
          {/* En-tête */}
          <div className={`bg-gradient-to-r ${levelColor} px-4 py-3 flex items-center gap-2`}>
            <span className="text-2xl">{c.emoji}</span>
            <h3 className="font-extrabold text-white text-sm">{c.title}</h3>
          </div>

          <div className="px-4 py-3 space-y-2.5">
            {/* Explication principale */}
            <p className="text-sm text-gray-700 dark:text-slate-200 leading-relaxed">{c.explain}</p>

            {/* Analogie */}
            {c.analogy && (
              <div className="flex items-start gap-2 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-xl px-3 py-2">
                <span className="text-lg shrink-0 mt-0.5">🎒</span>
                <p className="text-xs text-amber-700 dark:text-amber-300 leading-relaxed">
                  <strong>Analogie :</strong> {c.analogy}
                </p>
              </div>
            )}

            {/* Points clés */}
            {c.points && c.points.length > 0 && (
              <ul className="space-y-1">
                {c.points.map((pt, j) => (
                  <li key={j} className="flex items-start gap-2 text-xs text-gray-600 dark:text-slate-300">
                    <span className="text-purple-400 dark:text-purple-500 font-bold shrink-0 mt-0.5">▸</span>
                    <span dangerouslySetInnerHTML={{ __html: pt.replace(/`([^`]+)`/g, '<code class="bg-gray-100 dark:bg-slate-700 text-purple-600 dark:text-purple-300 px-1 rounded font-mono text-[11px]">$1</code>') }} />
                  </li>
                ))}
              </ul>
            )}

            {/* Astuce */}
            {c.tip && (
              <div className="flex items-start gap-2 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-xl px-3 py-2">
                <span className="text-base shrink-0 mt-0.5">💡</span>
                <p className="text-xs text-green-700 dark:text-green-300 leading-relaxed">
                  <strong>Astuce :</strong> {c.tip}
                </p>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
