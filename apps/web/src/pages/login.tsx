import { FormEvent, useState } from "react";
import { Eye, EyeOff, Star } from "lucide-react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { useStore } from "../lib/store";
import { TestimonialsStage, VerticalMarquee } from "../components/ui/3d-testimonials";

const commentTrack = [
  {
    name: "Mariana Alves",
    role: "Gestora operacional",
    rating: 5,
    comment: "Hoje eu sei exatamente quem esta com cada demanda e o que precisa de atencao antes do prazo estourar."
  },
  {
    name: "Rafael Martins",
    role: "Coordenador administrativo",
    rating: 4.5,
    comment: "As conversas sairam do improviso. O historico da tarefa mostra o combinado, o responsavel e a entrega."
  },
  {
    name: "Camila Rocha",
    role: "Supervisora de equipe",
    rating: 5,
    comment: "As rotinas recorrentes viraram um fluxo claro. O time abre o painel e ja sabe o que precisa executar."
  },
  {
    name: "Bruno Ferreira",
    role: "Lider de atendimento",
    rating: 4,
    comment: "A cobranca ficou mais leve porque os prazos, prioridades e pendencias aparecem sem precisar procurar."
  },
  {
    name: "Juliana Mendes",
    role: "Analista financeira",
    rating: 5,
    comment: "Consigo organizar os fechamentos do mes sem perder nenhuma etapa e ainda acompanhar o que depende de outras pessoas."
  },
  {
    name: "Lucas Nogueira",
    role: "Coordenador financeiro",
    rating: 4.5,
    comment: "O painel deixou as prioridades mais claras. Em poucos minutos consigo distribuir o trabalho e antecipar gargalos."
  },
  {
    name: "Fernanda Lima",
    role: "Assistente administrativa",
    rating: 5,
    comment: "Antes eu anotava tudo em lugares diferentes. Agora tenho prazos, comentarios e orientacoes reunidos na mesma tarefa."
  },
  {
    name: "Diego Barros",
    role: "Supervisor de operacoes",
    rating: 4.5,
    comment: "As entregas ficaram mais previsiveis e as reunioes mais objetivas porque o andamento ja esta registrado."
  },
  {
    name: "Patricia Gomes",
    role: "Gerente administrativa",
    rating: 5,
    comment: "A visao da carga da equipe ajuda a equilibrar as demandas antes que alguem fique sobrecarregado."
  },
  {
    name: "André Carvalho",
    role: "Analista de contas",
    rating: 4,
    comment: "As rotinas recorrentes reduziram os esquecimentos e deixaram o fechamento diario muito mais tranquilo."
  },
  {
    name: "Renata Silveira",
    role: "Coordenadora de projetos",
    rating: 5,
    comment: "Cada pessoa sabe o que precisa entregar e eu consigo acompanhar o progresso sem interromper o time."
  },
  {
    name: "Thiago Azevedo",
    role: "Responsavel pelo faturamento",
    rating: 4.5,
    comment: "Os alertas de prazo ajudam a agir cedo. Ficou muito mais facil separar o urgente do que pode esperar."
  },
  {
    name: "Beatriz Costa",
    role: "Assistente financeira",
    rating: 5,
    comment: "A minha fila mostra exatamente por onde comecar o dia. Isso trouxe foco e reduziu bastante o retrabalho."
  },
  {
    name: "Eduardo Ramos",
    role: "Gestor de processos",
    rating: 4.5,
    comment: "O historico deixou as responsabilidades transparentes e facilitou muito as revisoes com a equipe."
  },
  {
    name: "Larissa Freitas",
    role: "Analista administrativa",
    rating: 5,
    comment: "Mesmo com varias demandas simultaneas, encontro rapidamente o responsavel, o prazo e a proxima acao."
  },
  {
    name: "Marcelo Duarte",
    role: "Coordenador contabil",
    rating: 4,
    comment: "A equipe ganhou ritmo sem aumentar a quantidade de reunioes. O painel fala por si e mantem todos alinhados."
  },
  {
    name: "Aline Moreira",
    role: "Supervisora financeira",
    rating: 5,
    comment: "Agora consigo enxergar o andamento do setor inteiro sem depender de planilhas paralelas ou mensagens soltas."
  },
  {
    name: "Caio Peixoto",
    role: "Assistente contabil",
    rating: 4.5,
    comment: "As prioridades ficaram bem definidas e ficou mais simples pedir ajuda quando uma tarefa depende de outra area."
  },
  {
    name: "Natália Ribeiro",
    role: "Gerente de operacoes",
    rating: 5,
    comment: "O acompanhamento diario ficou leve e objetivo. Vejo o que avancou e onde preciso intervir sem microgerenciar."
  },
  {
    name: "Felipe Moraes",
    role: "Analista de tesouraria",
    rating: 4,
    comment: "Ter cada comprovante e observacao ligados a uma demanda reduziu bastante o tempo gasto procurando informacoes."
  },
  {
    name: "Sabrina Lopes",
    role: "Coordenadora administrativa",
    rating: 5,
    comment: "As tarefas recorrentes ajudam o time a manter o padrao mesmo nos dias mais corridos do fechamento."
  },
  {
    name: "Vinícius Prado",
    role: "Analista de controladoria",
    rating: 4.5,
    comment: "Ficou facil identificar atrasos e entender o contexto antes de cobrar uma atualizacao do responsavel."
  },
  {
    name: "Isabela Torres",
    role: "Lider de backoffice",
    rating: 5,
    comment: "O time adotou rapido porque a interface mostra apenas o que importa para executar o trabalho."
  },
  {
    name: "Rodrigo Farias",
    role: "Coordenador de cobranca",
    rating: 4.5,
    comment: "Com as responsabilidades registradas, as passagens de demanda entre as pessoas ficaram muito mais seguras."
  },
  {
    name: "Débora Martins",
    role: "Analista de pagamentos",
    rating: 5,
    comment: "Comeco o expediente sabendo quais pagamentos exigem atencao e quais etapas ja foram conferidas."
  },
  {
    name: "Gustavo Reis",
    role: "Gestor administrativo",
    rating: 4,
    comment: "A distribuicao de tarefas ficou mais justa e conseguimos redistribuir demandas antes de virar urgencia."
  },
  {
    name: "Carolina Pires",
    role: "Analista de processos",
    rating: 5,
    comment: "O historico ajuda a melhorar o processo porque mostra exatamente onde cada entrega ficou parada."
  },
  {
    name: "Henrique Neves",
    role: "Supervisor contabil",
    rating: 4.5,
    comment: "Prazos e pendencias ficaram visiveis para todos, sem precisar montar um relatorio novo a cada reuniao."
  }
];

export function LoginPage() {
  const { currentUser, login } = useStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("guisbs68@gmail.com");
  const [password, setPassword] = useState("G123456789");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  if (currentUser) return <Navigate to="/app" replace />;

  function submit(event: FormEvent) {
    event.preventDefault();
    if (!login(email, password)) {
      setError("Email ou senha invalidos");
      return;
    }
    const from = (location.state as { from?: { pathname?: string } } | null)?.from?.pathname ?? "/app";
    navigate(from, { replace: true });
  }

  return (
    <main className="login-dark-shell">
      <div className="login-dark-grid">
        <section className="login-photo-panel" aria-label="Ambiente de trabalho organizado">
          <img src="/login/login-workspace-blue.jpg" alt="Agenda, cartões de tarefas e caneta sobre uma mesa de trabalho azul-escura" />
          <div className="login-photo-shade" />
          <div className="login-photo-brand"><img src="/brand/logo-symbol-transparent.png" alt="" /><span>TaskFlow</span></div>
          <div className="login-photo-copy"><p>Clareza para o trabalho avançar.</p><span>Organize responsabilidades, acompanhe prazos e mantenha a equipe no mesmo ritmo.</span></div>
        </section>

        <section className="login-form-panel">

          <form
            onSubmit={submit}
            noValidate
            className="login-dark-form"
          >
            <div className="login-form-brand"><img src="/brand/logo-symbol-transparent.png" alt="" /><strong>TaskFlow</strong></div>
            <div className="login-form-heading"><h1>Bem-vindo de volta</h1><p>Entre para acompanhar as prioridades da sua equipe.</p></div>

            <label className="sr-only" htmlFor="email">E-mail Corporativo</label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) => {
                setEmail(event.target.value);
                setError("");
              }}
              className="login-dark-input"
              placeholder="E-mail Corporativo"
              aria-invalid={error ? "true" : "false"}
              aria-describedby={error ? "login-error" : undefined}
            />

            <div className="login-password-field">
              <label className="sr-only" htmlFor="password">Senha</label>
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                value={password}
                onChange={(event) => {
                  setPassword(event.target.value);
                  setError("");
                }}
                className="login-dark-input pr-12"
                placeholder="Senha"
                aria-invalid={error ? "true" : "false"}
                aria-describedby={error ? "login-error" : undefined}
              />
              <button
                type="button"
                onClick={() => setShowPassword((value) => !value)}
                className="login-password-toggle"
                aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {error ? <p id="login-error" className="mt-4 w-full rounded-2xl bg-rose-50 px-4 py-3 text-sm font-bold text-rose-700">{error}</p> : null}

            <button className="login-submit-button">
              Entrar
            </button>

            <a className="login-recover-link" href="#recuperar">
              Recuperar senha
            </a>

            <TestimonialsStage label="Comentários de equipes que usam o TaskFlow">
              {[false, true, false].map((reverse, column) => (
                <VerticalMarquee key={String(column)} reverse={reverse} className={`login-testimonial-column-${column + 1}`}>
                  {rotateComments(commentTrack, column * 9).map((comment) => <TestimonialCard key={`${column}-${comment.name}`} comment={comment} />)}
                </VerticalMarquee>
              ))}
            </TestimonialsStage>
          </form>
        </section>
      </div>
    </main>
  );
}

function TestimonialCard({ comment }: { comment: (typeof commentTrack)[number] }) {
  return <article className="login-testimonial-card">
    <div className="login-testimonial-avatar">{comment.name.split(" ").map((part) => part[0]).join("").slice(0, 2)}</div>
    <div className="min-w-0 flex-1">
      <div className="login-testimonial-author"><p>{comment.name}</p><Rating value={comment.rating} /></div>
      <span>{comment.role}</span>
      <blockquote>“{comment.comment}”</blockquote>
    </div>
  </article>;
}

function Rating({ value }: { value: number }) {
  return <div className="login-testimonial-rating" aria-label={`${value} de 5 estrelas`}>{Array.from({ length: 5 }, (_, index) => {
    const filled = index + 1 <= Math.floor(value);
    const half = value % 1 !== 0 && index === Math.floor(value);
    return <span key={index}><Star size={11} className="rating-empty" />{filled ? <Star size={11} className="rating-full" /> : null}{half ? <i><Star size={11} className="rating-full" /></i> : null}</span>;
  })}</div>;
}

function rotateComments<T>(items: T[], offset: number) {
  const normalized = offset % items.length;
  return [...items.slice(normalized), ...items.slice(0, normalized)];
}
