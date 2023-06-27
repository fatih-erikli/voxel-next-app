import { useEffect, useRef, useState } from "react";

export default function Prompt({
  value,
  onClose,
  onChange,
}: {
  value: string;
  onClose: () => void;
  onChange: (value: string) => void;
}) {
  const [text, setText] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    inputRef.current!.focus();
  }, []);
  const dialogRef = useRef<HTMLDialogElement>(null);
  return (
    <div
      className="prompt-overlay"
      onClick={(event) => {
        if ((event.target as HTMLElement).matches(".prompt-overlay")) {
          onClose()
        }
      }}
    >
      <dialog ref={dialogRef} open className="prompt-dialog">
        <form
          onSubmit={(event) => {
            event.preventDefault();
            onClose();
          }}
          className="prompt-form"
        >
          <label htmlFor="promptText">Scene title</label>
          <input
            id="promptText"
            min={5}
            max={20}
            required
            ref={inputRef}
            type={"text"}
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <input type="submit" value="Save" onClick={() => {
            onChange(text)
            onClose();
          }} />
        </form>
      </dialog>
    </div>
  );
}
