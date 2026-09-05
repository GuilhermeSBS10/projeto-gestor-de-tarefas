const rules = [
  {
    name: "Administrador",
    people: "Guilherme",
    text: "Acesso total: cria, edita, conclui, exclui e atribui tarefas para qualquer pessoa, inclusive Thayce."
  },
  {
    name: "Gerencia geral",
    people: "Thayce",
    text: "Pode criar tarefas e rotinas para qualquer pessoa da equipe. Ninguem cria para Thayce, exceto administrador."
  },
  {
    name: "Analistas lideres",
    people: "Mateus Forti e Renata Calazans",
    text: "Podem criar tarefas e rotinas para Guilherme, Pedro e para si mesmos. Respondem a Thayce."
  },
  {
    name: "Apoio",
    people: "Guilherme e Pedro",
    text: "Respondem a Thayce, Mateus e Renata. Podem acompanhar e concluir as proprias tarefas."
  }
];

export function RolesPage() {
  return (
    <div className="space-y-4">
      <section>
        <h2 className="text-2xl font-black tracking-tight">Acesso e hierarquia</h2>
        <p className="text-sm font-medium text-slate-500">Permissoes baseadas em quem responde a quem no trabalho.</p>
      </section>
      <section className="grid gap-3 lg:grid-cols-2">
        {rules.map((rule) => (
          <article key={rule.name} className="rounded-[24px] border border-slate-200 bg-white p-4">
            <h3 className="font-black">{rule.name}</h3>
            <p className="mt-1 text-sm font-bold text-blue-700">{rule.people}</p>
            <p className="mt-3 text-sm leading-6 text-slate-600">{rule.text}</p>
          </article>
        ))}
      </section>
    </div>
  );
}
