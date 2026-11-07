"use client";

import { useId, useRef, useState } from "react";
import ProjectForm from "@/components/dashboard/ProjectForm";
import type { Project } from "@/types/project";

/*
  The Edit button, and the room its form opens into.

  The form is too big to open where the button sits: inside the last table cell
  it was squeezed to that column's width and stretched the whole row. So the
  button stays where it is and the form opens underneath, across the full width
  of the table or the phone card. The form comes straight after the button in
  the page, so Tab goes from one to the other, and closing it hands focus back
  rather than losing it with the Cancel button that just disappeared.

  Closing takes the form away, so Cancel discards what was typed and reopening
  starts from the project as saved.
*/

function useEditToggle() {
  const formId = useId();
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [editing, setEditing] = useState(false);

  return {
    editing,
    formId,
    buttonRef,
    toggle: () => setEditing((open) => !open),
    close: () => {
      setEditing(false);
      buttonRef.current?.focus();
    },
  };
}

function EditButton({
  buttonRef,
  editing,
  formId,
  onClick,
}: {
  buttonRef: React.Ref<HTMLButtonElement>;
  editing: boolean;
  formId: string;
  onClick: () => void;
}) {
  return (
    <button
      ref={buttonRef}
      type="button"
      onClick={onClick}
      aria-expanded={editing}
      aria-controls={editing ? formId : undefined}
      className="border-hairline text-ink-muted hover:text-ink hover:border-ink-faint focus-visible:ring-accent rounded-md border px-2.5 py-1 text-xs whitespace-nowrap transition-colors focus-visible:ring-2 focus-visible:outline-none"
    >
      Edit
    </button>
  );
}

/** A desktop table row: `children` are its cells, and the actions cell is added after them. */
export function EditableProjectRow({
  project,
  colSpan,
  actions,
  children,
}: {
  project: Project;
  colSpan: number;
  actions: React.ReactNode;
  children: React.ReactNode;
}) {
  const { editing, formId, buttonRef, toggle, close } = useEditToggle();

  return (
    <>
      <tr className="border-hairline hover:bg-raised/40 border-t transition-colors">
        {children}
        <td className="px-5 py-3.5">
          <div className="flex items-center justify-end gap-2">
            {actions}
            <EditButton
              buttonRef={buttonRef}
              editing={editing}
              formId={formId}
              onClick={toggle}
            />
          </div>
        </td>
      </tr>
      {editing && (
        <tr id={formId}>
          <td colSpan={colSpan} className="px-5 pt-1 pb-5">
            <ProjectForm project={project} onClose={close} />
          </td>
        </tr>
      )}
    </>
  );
}

/** The foot of a phone card: its action buttons, then the form across the card. */
export function EditableProjectCard({
  project,
  actions,
}: {
  project: Project;
  actions: React.ReactNode;
}) {
  const { editing, formId, buttonRef, toggle, close } = useEditToggle();

  return (
    <>
      <div className="flex justify-end gap-2">
        {actions}
        <EditButton
          buttonRef={buttonRef}
          editing={editing}
          formId={formId}
          onClick={toggle}
        />
      </div>
      {editing && (
        <div id={formId}>
          <ProjectForm project={project} onClose={close} />
        </div>
      )}
    </>
  );
}
