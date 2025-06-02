interface Props {
  utcIso?: string;
  options?: Intl.DateTimeFormatOptions;
  dateOnly?: boolean;
}

export function UtcDateTimeDisplay({
  utcIso,
  options = { dateStyle: "medium", timeStyle: "short" },
  dateOnly = false,
}: Props) {
  if (!utcIso) return <span>—</span>;

  const dt = new Date(utcIso);
  const formatOptions = dateOnly ? ({ dateStyle: "medium" } as Intl.DateTimeFormatOptions) : options;

  const formatted = new Intl.DateTimeFormat(navigator.language, formatOptions).format(dt);

  return <span>{formatted}</span>;
}
