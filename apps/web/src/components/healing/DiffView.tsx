interface DiffViewProps {
  diff: string;
}

export function DiffView({ diff }: DiffViewProps) {
  const lines = diff.split("\n").filter((line, i, arr) => !(i === arr.length - 1 && line === ""));

  return (
    <pre className="font-mono-tech text-[11px] leading-[1.7] overflow-x-auto rounded-[2px] border border-[#282823] bg-[#0C0C09] px-4 py-3">
      {lines.map((line, i) => {
        let color = "text-[#66655E]";
        let bg = "";
        if (line.startsWith("+") && !line.startsWith("+++")) {
          color = "text-[#9AA68A]";
          bg = "bg-[#9AA68A0D]";
        } else if (line.startsWith("-") && !line.startsWith("---")) {
          color = "text-[#B84A3A]";
          bg = "bg-[#B84A3A0D]";
        } else if (line.startsWith("@@")) {
          color = "text-[#D8663D]";
        } else if (line.startsWith("---") || line.startsWith("+++")) {
          color = "text-[#8C887B]";
        }
        return (
          <div key={i} className={`${color} ${bg} px-1 -mx-1 whitespace-pre`}>
            {line || " "}
          </div>
        );
      })}
    </pre>
  );
}