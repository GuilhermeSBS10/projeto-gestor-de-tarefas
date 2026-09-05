import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowRight,
  BarChart3,
  CalendarCheck2,
  CheckCircle2,
  Clock3,
  FileCheck2,
  Layers3,
  ListChecks,
  LockKeyhole,
  MessageSquareText,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Users
} from "lucide-react";
import { Link } from "react-router-dom";

const desktopVideoSrc = "/landing/hero-video-desktop.mp4";
const mobileVideoSrc = "/landing/hero-video-mobile.mp4";
const posterSrc = "/landing/hero-poster.jpg";
const firstVisibleSecond = 0.35;

const benefits = [
  { icon: CheckCircle2, title: "Tarefas com dono e prazo", copy: "Cada atividade fica clara: responsavel, prioridade, vencimento e historico de atualizacoes." },
  { icon: Users, title: "Gestao por equipe", copy: "Gestores acompanham o time sem perder tempo perguntando o que ja foi feito." },
  { icon: CalendarCheck2, title: "Rotinas recorrentes", copy: "Processos diarios, semanais e mensais viram rotina acompanhavel dentro do sistema." },
  { icon: BarChart3, title: "Visao do operacional", copy: "Pendencias, atrasos e entregas aparecem em uma tela feita para tomada de decisao." }
];

const productModules = [
  { icon: ListChecks, title: "Painel de tarefas", copy: "Filtre por status, prioridade, responsavel e vencimento para encontrar rapidamente onde atuar." },
  { icon: MessageSquareText, title: "Comentarios e historico", copy: "As conversas ficam dentro da tarefa, preservando contexto e evitando perda de informacao." },
  { icon: Layers3, title: "Organizacao por rotina", copy: "Transforme processos recorrentes em fluxos acompanhaveis, sem depender de memoria ou planilhas." },
  { icon: LockKeyhole, title: "Permissoes por perfil", copy: "Admin, gestor, distribuidor e usuario trabalham com acessos adequados ao papel de cada um." },
  { icon: FileCheck2, title: "Registro de entregas", copy: "Cada movimentacao importante fica documentada para auditoria, cobranca e melhoria operacional." },
  { icon: TrendingUp, title: "Indicadores objetivos", copy: "Acompanhe atraso, volume e conclusao para priorizar o que realmente muda o resultado." }
];

const stats = [
  ["100%", "das tarefas com responsavel definido"],
  ["4 perfis", "de acesso prontos para operacao"],
  ["24/7", "visao do fluxo de trabalho"],
  ["0 planilhas", "para controlar rotina critica"]
];

const testimonials = [
  {
    name: "Mariana Alves",
    role: "Gestora operacional",
    rating: "5.0",
    comment: "O TaskFlow deixou claro quem faz cada demanda e quais prazos precisam de atencao. A cobranca ficou mais objetiva e menos desgastante."
  },
  {
    name: "Rafael Martins",
    role: "Coordenador administrativo",
    rating: "4.9",
    comment: "Antes muita coisa ficava em conversa solta. Agora o historico das tarefas ajuda a entender o que foi combinado e o que ja foi entregue."
  },
  {
    name: "Camila Rocha",
    role: "Supervisora de equipe",
    rating: "5.0",
    comment: "As rotinas recorrentes foram o maior ganho. O time sabe o que precisa acontecer todos os dias sem depender de lembrete manual."
  }
];

export function LandingPage() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const stageRef = useRef<HTMLElement | null>(null);
  const videoSrc = useMemo(() => {
    if (typeof window === "undefined") return desktopVideoSrc;
    return window.innerWidth < 768 ? mobileVideoSrc : desktopVideoSrc;
  }, []);
  const [videoReady, setVideoReady] = useState(false);
  const [videoFailed, setVideoFailed] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    const stage = stageRef.current;
    if (!video || !stage || videoFailed) return;

    let frame = 0;
    let targetTime = 0;
    let displayedTime = 0;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const getTargetTime = () => {
      if (!video.duration || Number.isNaN(video.duration)) return;
      const rect = stage.getBoundingClientRect();
      if (rect.bottom < 0 || rect.top > window.innerHeight) return;
      const scrollable = Math.max(1, stage.offsetHeight - window.innerHeight);
      const progress = Math.min(1, Math.max(0, -rect.top / scrollable));
      targetTime = firstVisibleSecond + progress * Math.max(0, video.duration - firstVisibleSecond);
    };

    const updateVideoTime = () => {
      getTargetTime();

      if (reduceMotion) {
        video.currentTime = targetTime;
        return;
      }

      displayedTime += (targetTime - displayedTime) * 0.16;

      if (Math.abs(video.currentTime - displayedTime) > 0.085) {
        if ("fastSeek" in video && typeof video.fastSeek === "function") {
          video.fastSeek(displayedTime);
        } else {
          video.currentTime = displayedTime;
        }
      }

      if (Math.abs(targetTime - displayedTime) > 0.04) {
        frame = requestAnimationFrame(updateVideoTime);
      } else {
        frame = 0;
      }
    };

    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(updateVideoTime);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    video.pause();
    video.currentTime = firstVisibleSecond;
    displayedTime = video.currentTime;
    updateVideoTime();

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [videoReady, videoFailed]);

  return (
    <main className="min-h-screen bg-[#f3f7f8] text-slate-950">
      <header className="fixed inset-x-0 top-0 z-30 border-b border-white/15 bg-[#08111c]/55 backdrop-blur-2xl">
        <div className="mx-auto flex h-[72px] max-w-[1440px] items-center justify-between px-4 py-3 sm:px-7">
          <Link to="/" className="flex items-center gap-3">
            <img src="/brand/logo-symbol-transparent.png" alt="TaskFlow" className="h-11 w-11 object-contain" />
            <span className="text-sm font-black uppercase tracking-[0.2em] text-white">TaskFlow</span>
          </Link>
          <div className="flex items-center gap-2">
            <Link to="/login" className="rounded-full border border-white/25 px-4 py-2 text-sm font-bold text-white transition hover:border-white/50 hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/70">
              Login
            </Link>
            <Link to="/login" className="hidden rounded-full bg-white px-4 py-2 text-sm font-black text-slate-950 transition hover:bg-[#d9f99d] focus:outline-none focus:ring-2 focus:ring-white/70 sm:inline-flex">
              Comecar agora
            </Link>
          </div>
        </div>
      </header>

      <section ref={stageRef} className="relative h-[300vh] bg-slate-950">
        <div className="sticky top-0 h-screen min-h-[100svh] overflow-hidden">
          {videoFailed ? <div className="absolute inset-0 bg-slate-950" /> : (
            <video
              ref={videoRef}
              className="absolute inset-0 h-full w-full scale-[1.04] object-cover object-center sm:scale-100"
              muted
              playsInline
              preload="auto"
              poster={posterSrc}
              src={videoSrc}
              onLoadedMetadata={() => setVideoReady(true)}
              onError={() => setVideoFailed(true)}
            />
          )}
          <div className="absolute inset-0 bg-[#06101d]/30" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_72%_42%,transparent_0,rgba(3,7,18,0.1)_28%,rgba(3,7,18,0.76)_78%)]" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/88 via-black/42 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/68 via-transparent to-black/90" />
          <div className="relative z-10 mx-auto flex h-screen min-h-[100svh] max-w-[1440px] flex-col justify-end px-4 pb-5 pt-24 sm:px-7 lg:pb-8">
            <div className="max-w-[900px]">
              <p className="mb-5 inline-flex max-w-full items-center gap-2 border-l-4 border-[#d9f99d] bg-black/28 px-4 py-2 text-[11px] font-black uppercase tracking-[0.18em] text-[#d9f99d] backdrop-blur-md sm:text-xs">
                <Sparkles size={15} />
                Gestao de tarefas para equipes que precisam entregar
              </p>
              <h1 className="max-w-[980px] text-5xl font-black leading-[0.95] text-white drop-shadow-[0_12px_42px_rgba(0,0,0,0.72)] sm:text-7xl lg:text-[104px]">
                Controle a rotina do time sem perder o ritmo da operacao.
              </h1>
              <p className="mt-6 max-w-2xl text-base font-semibold leading-8 text-slate-100 drop-shadow-[0_8px_28px_rgba(0,0,0,0.68)] sm:text-xl">
                O TaskFlow transforma atividades soltas em uma operacao acompanhavel, com tarefas, responsaveis, prazos, rotinas e permissoes.
              </p>
              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <Link to="/login" className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-[#d9f99d] px-6 text-sm font-black text-slate-950 shadow-[0_18px_50px_rgba(217,249,157,0.24)] transition hover:bg-white focus:outline-none focus:ring-2 focus:ring-[#d9f99d] focus:ring-offset-2 focus:ring-offset-slate-950">
                  Fazer login
                  <ArrowRight size={18} />
                </Link>
                <a href="#venda" className="inline-flex h-12 items-center justify-center rounded-full border border-white/35 px-6 text-sm font-bold text-white transition hover:border-white/70 hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/70">
                  Ver solucao
                </a>
              </div>
            </div>
            <div className="mt-8 grid gap-2 border-t border-white/18 pt-4 sm:grid-cols-3 lg:max-w-5xl">
              {[
                ["Prazos", "Responsaveis e vencimentos no mesmo fluxo"],
                ["Rotina", "Atividades recorrentes acompanhadas sem planilha"],
                ["Controle", "Visao clara para cobrar, ajustar e entregar"]
              ].map(([title, copy]) => (
                <div key={title} className="border-l border-white/25 px-3 py-2 text-white/95 backdrop-blur-[2px]">
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-[#d9f99d]">{title}</p>
                  <p className="mt-1 text-sm font-semibold leading-6 text-slate-100">{copy}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="venda" className="bg-white px-4 py-24 sm:px-7">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.16em] text-cyan-800">Por que vender isso</p>
            <h2 className="mt-3 text-3xl font-black sm:text-5xl">Menos cobranca manual. Mais visibilidade sobre o que importa.</h2>
            <p className="mt-5 text-lg leading-8 text-slate-600">
              A proposta e simples: qualquer empresa que depende de pessoas executando tarefas recorrentes precisa enxergar prazos, atrasos e responsabilidades em tempo real.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {benefits.map((item) => (
              <article key={item.title} className="rounded-lg border border-slate-200 bg-[#f7fbfb] p-5 transition hover:-translate-y-1 hover:border-cyan-200 hover:shadow-xl hover:shadow-cyan-950/5">
                <item.icon className="mb-5 text-cyan-800" size={28} />
                <h3 className="text-lg font-black">{item.title}</h3>
                <p className="mt-3 leading-7 text-slate-600">{item.copy}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#f3f7f8] px-4 py-24 sm:px-7">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-end">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.16em] text-cyan-800">Produto completo</p>
              <h2 className="mt-3 text-3xl font-black text-slate-950 sm:text-5xl">Tudo que a operacao precisa para sair do improviso.</h2>
            </div>
            <p className="max-w-3xl text-lg leading-8 text-slate-600 lg:justify-self-end">
              A landing agora apresenta o TaskFlow como uma solucao de gestao operacional: clara para vender, direta para demonstrar e conectada ao uso real do sistema.
            </p>
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {productModules.map((item) => (
              <article key={item.title} className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/70 transition hover:-translate-y-1 hover:border-cyan-200 hover:shadow-xl hover:shadow-cyan-950/5">
                <div className="mb-5 grid h-11 w-11 place-items-center rounded-lg bg-cyan-50 text-cyan-800">
                  <item.icon size={23} />
                </div>
                <h3 className="text-xl font-black text-slate-950">{item.title}</h3>
                <p className="mt-3 leading-7 text-slate-600">{item.copy}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white px-4 py-24 sm:px-7">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.16em] text-cyan-800">Como fica na pratica</p>
            <h2 className="mt-3 text-3xl font-black text-slate-950 sm:text-5xl">Uma rotina mais facil de acompanhar, cobrar e melhorar.</h2>
            <p className="mt-5 text-lg leading-8 text-slate-600">
              O gestor enxerga gargalos antes que eles virem atraso, o time sabe exatamente o que precisa entregar e a empresa ganha previsibilidade no dia a dia.
            </p>
            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              {["Prioridades visiveis", "Prazos acompanhados", "Responsaveis claros", "Historico centralizado"].map((item) => (
                <div key={item} className="flex items-center gap-3 rounded-lg border border-slate-200 bg-[#f7fbfb] px-4 py-3">
                  <CheckCircle2 className="shrink-0 text-cyan-800" size={20} />
                  <span className="font-bold text-slate-800">{item}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-lg border border-slate-800 bg-[#08111c] p-5 text-white shadow-2xl shadow-slate-300/70">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <p className="text-xs font-black uppercase text-cyan-200">Resumo operacional</p>
                <h3 className="mt-1 text-2xl font-black">Hoje</h3>
              </div>
              <BarChart3 className="text-cyan-200" />
            </div>
            <div className="mt-5 grid gap-3">
              {[
                ["Entregas no prazo", "78%", "bg-cyan-300"],
                ["Tarefas em andamento", "34", "bg-emerald-300"],
                ["Demandas atrasadas", "7", "bg-amber-300"],
                ["Rotinas executadas", "18", "bg-cyan-300"]
              ].map(([label, value, color]) => (
                <div key={label} className="rounded-lg bg-white/8 p-4">
                  <div className="flex items-center justify-between gap-4">
                    <span className="font-bold text-slate-100">{label}</span>
                    <span className="text-xl font-black">{value}</span>
                  </div>
                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
                    <div className={`h-full rounded-full ${color}`} style={{ width: label === "Demandas atrasadas" ? "28%" : label === "Tarefas em andamento" ? "58%" : "78%" }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#08111c] px-4 py-24 text-white sm:px-7">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-3">
          {[
            ["01", "Equipe cria e recebe tarefas", "O gestor distribui demandas com prioridade, prazo e responsavel."],
            ["02", "Acompanhamento vira rotina", "Comentarios e historico mantem o contexto dentro da propria tarefa."],
            ["03", "Decisao fica clara", "O painel mostra atrasos, entregas e gargalos para agir rapido."]
          ].map(([step, title, copy]) => (
            <div key={step} className="border-t border-white/15 pt-6">
              <span className="text-sm font-black text-[#d9f99d]">{step}</span>
              <h3 className="mt-4 text-2xl font-black">{title}</h3>
              <p className="mt-3 leading-7 text-slate-300">{copy}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-[#f3f7f8] px-4 py-16 sm:px-7">
        <div className="mx-auto grid max-w-7xl gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map(([value, label]) => (
            <div key={value} className="rounded-lg border border-slate-200 bg-white p-6">
              <p className="text-3xl font-black text-cyan-950">{value}</p>
              <p className="mt-2 font-semibold leading-7 text-slate-600">{label}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-white px-4 py-24 sm:px-7">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.16em] text-cyan-800">Comentarios e avaliacoes</p>
              <h2 className="mt-3 text-3xl font-black text-slate-950 sm:text-5xl">Quem precisa controlar rotina percebe valor rapido.</h2>
            </div>
            <div className="rounded-lg border border-cyan-100 bg-cyan-50 p-5 lg:justify-self-end lg:w-[360px]">
              <p className="text-sm font-black uppercase tracking-[0.16em] text-cyan-900">Avaliacao media</p>
              <div className="mt-2 flex items-end gap-3">
                <span className="text-5xl font-black text-cyan-950">4.9</span>
                <span className="pb-2 text-sm font-bold text-slate-600">de 5.0</span>
              </div>
              <p className="mt-3 text-sm font-semibold leading-6 text-slate-600">Baseada em comentarios de equipes que usam o sistema para organizar tarefas, prazos e rotinas internas.</p>
            </div>
          </div>

          <div className="mt-10 grid gap-4 lg:grid-cols-3">
            {testimonials.map((item) => (
              <article key={item.name} className="rounded-lg border border-slate-200 bg-slate-50 p-6">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h3 className="font-black text-slate-950">{item.name}</h3>
                    <p className="mt-1 text-sm font-semibold text-slate-500">{item.role}</p>
                  </div>
                  <div className="rounded-full bg-[#08111c] px-3 py-1 text-sm font-black text-white">{item.rating}</div>
                </div>
                <p className="mt-5 leading-8 text-slate-700">"{item.comment}"</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#e8f2f3] px-4 py-24 sm:px-7">
        <div className="mx-auto flex max-w-7xl flex-col gap-8 rounded-lg bg-white p-6 shadow-xl shadow-slate-200/80 sm:p-10 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl">
            <div className="mb-4 flex gap-3 text-cyan-800">
              <Clock3 />
              <ShieldCheck />
            </div>
            <h2 className="text-3xl font-black sm:text-4xl">Pronto para apresentar como produto.</h2>
            <p className="mt-4 leading-8 text-slate-600">A landing abre com impacto visual, explica a dor operacional e leva o visitante direto para o login do sistema.</p>
          </div>
          <Link to="/login" className="inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-full bg-[#08111c] px-6 text-sm font-black text-white transition hover:bg-cyan-900 focus:outline-none focus:ring-2 focus:ring-cyan-700 focus:ring-offset-2">
            Entrar no TaskFlow
            <ArrowRight size={18} />
          </Link>
        </div>
      </section>
    </main>
  );
}
