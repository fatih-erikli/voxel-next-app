import { useEffect, useRef } from "react";

export default function Prompt({
  value,
  onClose,
  onChange,
}: {
  value: string;
  onClose: () => void;
  onChange: (value: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    inputRef.current!.focus();
  }, []);
  return (
    <dialog open>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          onClose();
        }}
      >
        <input ref={inputRef} type={"text"} value={value} onChange={(e) => onChange(e.target.value)} />
      </form>
    </dialog>
  );
}
