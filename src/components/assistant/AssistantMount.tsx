import Assistant from "./Assistant";
import { ASSISTANT_MODE } from "@/lib/assistant/mode";

/** Mounts Beacon unless this build switched the assistant off. */
export default function AssistantMount() {
  if (ASSISTANT_MODE === "off") return null;
  return <Assistant />;
}
