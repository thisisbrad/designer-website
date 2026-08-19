import Assistant from "./Assistant";
import { ASSISTANT_MODE } from "@/lib/assistant/mode";

/**
 * Queues clicks on the launcher that land before React hydrates. The button
 * is in the server HTML immediately, but its onClick doesn't exist until
 * hydration finishes — on a page this heavy that gap is long enough for a
 * visitor's first click to silently do nothing. This runs as soon as it's
 * parsed, flags the button, and Assistant replays the open on mount.
 */
const EARLY_CLICK_SCRIPT = `(function(){
  var handler = function(e){
    if (window.__beaconReady) { document.removeEventListener('click', handler, true); return; }
    var t = e.target && e.target.closest ? e.target.closest('[data-assistant-launcher]') : null;
    if (t) t.setAttribute('data-pending-open', '1');
  };
  document.addEventListener('click', handler, true);
})();`;

/** Mounts Beacon unless this build switched the assistant off. */
export default function AssistantMount() {
  if (ASSISTANT_MODE === "off") return null;
  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: EARLY_CLICK_SCRIPT }} />
      <Assistant />
    </>
  );
}
