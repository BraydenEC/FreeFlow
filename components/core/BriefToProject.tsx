"use client";

import Link from "next/link";
import { useState } from "react";
import ProjectForm from "@/components/dashboard/ProjectForm";
import { extractionToProject, type ExtractedFields } from "@/lib/core/to-project";

/*
  Turns an extraction into a project on the dashboard.

  An extraction and a project are different records, and the money only counts
  once it is a project. So this opens the same form the dashboard uses, filled
  in from the brief: the read fields stay correctable, and anything the brief
  never said stays blank for the form to ask about, rather than being invented.
*/
export default function BriefToProject({
  fields,
  className = "",
}: {
  fields: ExtractedFields;
  className?: string;
}) {
  const [created, setCreated] = useState(false);

  return (
    <div className={className}>
      {created ? (
        <p role="status" className="text-ink-muted text-xs">
          Project added.{" "}
          <Link href="/dashboard" className="text-accent-soft hover:underline">
            Open dashboard →
          </Link>
        </p>
      ) : (
        <ProjectForm
          prefill={extractionToProject(fields)}
          createLabel="Create project"
          onCreated={() => setCreated(true)}
        />
      )}
    </div>
  );
}
