interface KeywordProps {
  keyword: string;
}

export default function KeywordBadge({ keyword }: KeywordProps) {
  return (
    <li className="list-none">
      <span className="inline-block text-[11px] font-semibold uppercase tracking-widest px-3 py-1 rounded-md bg-primary/10 text-orange-800">
        {keyword}
      </span>
    </li>
  );
}
