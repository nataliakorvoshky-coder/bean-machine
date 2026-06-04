interface Props {
  status?: string;
}

export default function StatusBadge({
  status,
}: Props) {

  const normalized =
    status?.toLowerCase();

  const styles = {

    approved: `
      bg-emerald-100
      text-emerald-700
      border-emerald-200
    `,

    denied: `
      bg-red-100
      text-red-700
      border-red-200
    `,

    pending: `
      bg-amber-100
      text-amber-700
      border-amber-200
    `,

    "in progress": `
      bg-blue-100
      text-blue-700
      border-blue-200
    `,

    escalated: `
      bg-purple-100
      text-purple-700
      border-purple-200
    `,

    completed: `
  bg-blue-100
  text-blue-700
  border-blue-200
`,

  };

  return (

    <div
className={`
  inline-flex
  items-center
  justify-center

  leading-none

  px-3
  py-1.5

  rounded-full

  border

  text-xs
  font-semibold
  
        ${styles[
          normalized as keyof typeof styles
        ] || `
          bg-gray-100
          text-gray-700
          border-gray-200
        `}
      `}
    >

      {status || "Unknown"}

    </div>

  );
}