import { CalendarDays } from "lucide-react";

type DeadlineFieldProps = {
  id: string;
  defaultValue?: string;
  minimum?: string;
  compact?: boolean;
};

export function DeadlineField({ id, defaultValue, minimum, compact = false }: DeadlineFieldProps) {
  const helpId = `${id}-help`;

  return <div className={`deadline-field ${compact ? "is-compact" : ""}`}>
    <label htmlFor={id}>
      <span><CalendarDays size={16} aria-hidden="true" />Prazo da tarefa</span>
      {!compact ? <small>Data limite para concluir esta entrega</small> : null}
    </label>
    <div className="deadline-input-wrap">
      <input
        id={id}
        name="dueDate"
        type="date"
        defaultValue={defaultValue}
        min={minimum}
        aria-describedby={helpId}
      />
    </div>
    <p id={helpId} className="deadline-field-help">Selecione o dia em que a tarefa deverá estar concluída.</p>
  </div>;
}
