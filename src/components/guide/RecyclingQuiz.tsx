import { useMemo, useState } from 'react';
import { CheckCircle2, RotateCcw, Trophy, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import { AccountNotice } from '@/components/auth/AccountNotice';
import { ALL_CATEGORY_KEYS, CATEGORIES } from '@/data/categories';
import { QUIZ_BANK } from '@/data/quizBank';
import { useQuizStore } from '@/store';
import { useAuthStore } from '@/store/authStore';
import type { WasteCategoryKey } from '@/types/domain';

const QUESTIONS_PER_GAME = 5;
function createGame() { return [...QUIZ_BANK].sort(() => Math.random() - 0.5).slice(0, QUESTIONS_PER_GAME); }

export function RecyclingQuiz() {
  const [questions, setQuestions] = useState(createGame);
  const [answers, setAnswers] = useState<(WasteCategoryKey | null)[]>([]);
  const [finished, setFinished] = useState(false);
  const { result, recordAttempt } = useQuizStore();
  const user = useAuthStore((state) => state.user);
  const currentQuestion = questions[answers.length];
  const score = useMemo(() => answers.reduce((total, answer, index) => total + (answer === questions[index]?.category ? 1 : 0), 0), [answers, questions]);
  const percentage = Math.round((score / QUESTIONS_PER_GAME) * 100);

  function answerQuestion(category: WasteCategoryKey) {
    if (finished || !currentQuestion) return;
    const nextAnswers = [...answers, category];
    setAnswers(nextAnswers);
    if (nextAnswers.length === QUESTIONS_PER_GAME) {
      setFinished(true);
      const correct = nextAnswers.filter((answer, index) => answer === questions[index].category).length;
      if (user?.emailVerifiedAt) {
        void recordAttempt(correct).catch((error: unknown) => {
          toast.error(error instanceof Error ? error.message : 'No pudimos guardar tu resultado.');
        });
      }
    }
  }

  function restart() { setQuestions(createGame()); setAnswers([]); setFinished(false); }

  return (
    <div className="rounded-bento border border-border bg-surface p-5 shadow-soft sm:p-7">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3"><p className="text-sm text-muted">5 preguntas · Elegí la categoría correcta</p>{user?.emailVerifiedAt ? <p className="text-xs text-muted">Récord: <strong className="text-foreground">{result.best}%</strong> · {result.attempts} {result.attempts === 1 ? 'intento' : 'intentos'}</p> : <p className="text-xs text-muted">Iniciá sesión para guardar tu récord.</p>}</div>
      {!user?.emailVerifiedAt && <div className="mb-5"><AccountNotice description="Iniciá sesión y confirmá tu correo para guardar tus resultados." /></div>}
      {!finished && currentQuestion ? <>
        <div className="mb-5 flex gap-1.5" aria-label={`Pregunta ${answers.length + 1} de ${QUESTIONS_PER_GAME}`}>{questions.map((question, index) => <span key={question.question} className={`h-1.5 flex-1 rounded-full ${index < answers.length ? 'bg-primary' : 'bg-border'}`} />)}</div>
        <p className="text-xs font-semibold uppercase tracking-widest text-primary">Pregunta {answers.length + 1} de {QUESTIONS_PER_GAME}</p><h3 className="mt-2 font-display text-xl font-semibold sm:text-2xl">{currentQuestion.question}</h3>
        <div className="mt-5 grid gap-2 sm:grid-cols-2">{ALL_CATEGORY_KEYS.map((key) => <button type="button" key={key} onClick={() => answerQuestion(key)} className="min-h-12 rounded-xl border border-border bg-background px-4 py-3 text-left text-sm font-medium transition hover:border-primary hover:bg-primary-soft focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary">{CATEGORIES[key].label}</button>)}</div>
      </> : <div aria-live="polite" className="text-center"><span className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-accent-soft text-accent-foreground"><Trophy className="size-7" aria-hidden="true" /></span><h3 className="mt-4 font-display text-2xl font-bold">{percentage >= 80 ? '¡Excelente trabajo!' : percentage >= 60 ? '¡Buen intento!' : 'A seguir practicando'}</h3><p className="mt-2 text-muted">Acertaste {score} de {QUESTIONS_PER_GAME} preguntas ({percentage}%).</p><div className="mx-auto mt-5 max-w-lg space-y-2 text-left">{questions.map((question, index) => <div key={question.question} className="rounded-xl border border-border bg-background p-3"><div className="flex items-start gap-2 text-sm font-medium">{answers[index] === question.category ? <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" /> : <XCircle className="mt-0.5 size-4 shrink-0 text-danger" />}{question.question}</div><p className="mt-1 pl-6 text-xs text-muted">{CATEGORIES[question.category].label}: {question.explanation}</p></div>)}</div><button type="button" onClick={restart} className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground transition hover:bg-primary-hover"><RotateCcw className="size-4" /> Jugar de nuevo</button></div>}
    </div>
  );
}
