import Assistant from "./Assistant";
import ProjectHubWidget from "./ProjectHubWidget";
import { ASSISTANT_MODE } from "@/lib/assistant/mode";

/**
 * Mounts whichever assistant this build is configured for, and only one.
 *
 * Both pin themselves to the bottom-right corner, so running them together
 * stacks two chat panels. See src/lib/assistant/mode.ts for what each answers
 * questions about, and why the choice is made at build time.
 */
export default function AssistantMount() {
  if (ASSISTANT_MODE === "off") return null;
  if (ASSISTANT_MODE === "projecthub") return <ProjectHubWidget />;
  return <Assistant />;
}
