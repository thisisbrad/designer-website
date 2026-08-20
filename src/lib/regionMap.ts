import { locations, type Location } from "@/data/locations";

/**
 * Shared geometry for the Florida service-area map (docs/area-service-selection.md).
 *
 * Everything here derives from the same coordinates the location pages publish
 * in their schema, plus real shoreline and highway waypoints — no invented
 * geography. The projection is a simple equirectangular fit of the markets'
 * bounding box into a 0–100 plot space, with the east–west axis corrected for
 * latitude so distances read true.
 */

/** Padding around the markets' bounding box, in degrees. Longitude gets
    extra room — open Atlantic to the east, I-4 running off toward Tampa to
    the west — so the sheet reads landscape and fills a wide panel without
    stretching the geography. */
const PAD_LAT = 0.24;
const PAD_LNG_W = 0.3;
const PAD_LNG_E = 0.85;
const KM_PER_DEG = 111.32;
const GRID_STEP = 0.5;

const lats = locations.map((l) => l.geo.latitude);
const lngs = locations.map((l) => l.geo.longitude);
const MIN_LAT = Math.min(...lats) - PAD_LAT;
const MAX_LAT = Math.max(...lats) + PAD_LAT;
const MIN_LNG = Math.min(...lngs) - PAD_LNG_W;
const MAX_LNG = Math.max(...lngs) + PAD_LNG_E;
const LAT_SPAN = MAX_LAT - MIN_LAT;
const LNG_SPAN = MAX_LNG - MIN_LNG;

/** Longitude → 0–100 plot x. */
export const px = (lng: number) => ((lng - MIN_LNG) / LNG_SPAN) * 100;
/** Latitude → 0–100 plot y (north up). */
export const py = (lat: number) => ((MAX_LAT - lat) / LAT_SPAN) * 100;

/* East–west degrees shrink with latitude; without this correction the
   sheet would stretch Florida sideways. */
const COS_MID_LAT = Math.cos(((MIN_LAT + MAX_LAT) / 2) * (Math.PI / 180));
export const PLOT_ASPECT = (LNG_SPAN * COS_MID_LAT) / LAT_SPAN;

/** Width of `km` measured east–west on the sheet, as % of plot width —
    keeps the scale bar as honest as the radius rings. */
export const kmToPlotWidth = (km: number) =>
  (km / (LNG_SPAN * COS_MID_LAT * KM_PER_DEG)) * 100;

export const pointOf = (loc: Location) => ({
  x: px(loc.geo.longitude),
  y: py(loc.geo.latitude),
});

/** Ring diameter as % of plot height — the honest service radius, drawn. */
export const ringSize = (loc: Location) =>
  ((2 * loc.radiusKm) / KM_PER_DEG / LAT_SPAN) * 100;

const gridValues = (min: number, max: number) => {
  const out: number[] = [];
  for (let v = Math.ceil(min / GRID_STEP) * GRID_STEP; v < max; v += GRID_STEP) {
    out.push(Math.round(v * 2) / 2);
  }
  return out;
};

export const LAT_LINES = gridValues(MIN_LAT, MAX_LAT);
export const LNG_LINES = gridValues(MIN_LNG, MAX_LNG);

export const fmtCoord = (lat: number, lng: number) =>
  `${lat.toFixed(4)}°N · ${Math.abs(lng).toFixed(4)}°W`;

/** Airport-style idents — the real FAA code where the market has one. */
export const MARKET_CODES: Record<string, string> = {
  orlando: "ORL",
  melbourne: "MLB",
  "lake-mary": "LKM",
  lakeland: "LAL",
  "daytona-beach": "DAB",
  "vero-beach": "VRB",
};

/* ------------------------------------------------------------------ */
/* Engraved linework — real waypoints, overshooting the sheet edges   */
/* so lines bleed off rather than stopping mid-plot.                  */
/* ------------------------------------------------------------------ */

type Waypoint = [lat: number, lng: number];

/** Atlantic shoreline, Matanzas Inlet down to Hutchinson Island, with the
    Ponce and Sebastian inlets as small jogs and Cape Canaveral's point. */
const COAST: Waypoint[] = [
  [29.71, -81.23],
  [29.47, -81.12],
  [29.29, -81.05],
  [29.21, -81.0],
  [29.07, -80.91],
  [29.055, -80.945], // Ponce Inlet
  [29.02, -80.9],
  [28.93, -80.85],
  [28.8, -80.74],
  [28.65, -80.63],
  [28.59, -80.57],
  [28.455, -80.527], // Cape Canaveral
  [28.32, -80.6],
  [28.23, -80.6],
  [28.17, -80.59],
  [28.08, -80.56],
  [27.95, -80.51],
  [27.87, -80.44],
  [27.855, -80.475], // Sebastian Inlet
  [27.83, -80.43],
  [27.76, -80.4],
  [27.66, -80.36],
  [27.47, -80.29],
  [27.3, -80.22],
];

/** The I-4 corridor — the spine that actually connects these markets,
    Daytona through Orlando to Lakeland and off toward Tampa. */
const I4: Waypoint[] = [
  [29.11, -81.08],
  [28.93, -81.24],
  [28.77, -81.33],
  [28.62, -81.39],
  [28.53, -81.4],
  [28.47, -81.47],
  [28.33, -81.58],
  [28.25, -81.62],
  [28.14, -81.64],
  [28.09, -81.9],
  [28.02, -82.12],
  [27.99, -82.25],
];

const toPath = (waypoints: Waypoint[]) =>
  waypoints
    .map(
      ([lat, lng], i) =>
        `${i === 0 ? "M" : "L"}${px(lng).toFixed(1)} ${py(lat).toFixed(1)}`
    )
    .join(" ");

export const COAST_PATH = toPath(COAST);
export const I4_PATH = toPath(I4);

/* Unit vector pointing seaward (perpendicular to the coast's overall run),
   used to march the engraved water lines offshore and land bands inland. */
const coastDx = px(COAST[COAST.length - 1][1]) - px(COAST[0][1]);
const coastDy = py(COAST[COAST.length - 1][0]) - py(COAST[0][0]);
const coastLen = Math.hypot(coastDx, coastDy);
export const SEAWARD = { x: coastDy / coastLen, y: -coastDx / coastLen };

/** Visual angle of the coast in degrees, aspect-corrected — for running
    a label parallel to the shore. */
export const COAST_ANGLE_DEG =
  (Math.atan2(coastDy / PLOT_ASPECT, coastDx) * 180) / Math.PI;

/** Where the tiny I-4 tag sits, just off the highway's Orlando–Lakeland leg. */
export const I4_LABEL = { x: px(-81.575), y: py(28.355) };

/* ------------------------------------------------------------------ */
/* Marker layout                                                       */
/* ------------------------------------------------------------------ */

export type MarkerLayout = {
  loc: Location;
  x: number;
  y: number;
  /** Which side of the dot the ident label sits on. */
  side: "left" | "right";
  /** Label centre y, nudged apart when near-neighbours would collide. */
  labelY: number;
};

const MIN_LABEL_GAP = 5; // % of plot height
const H_OVERLAP = 20; // % of plot width within which same-side labels can collide

export const MARKERS: MarkerLayout[] = (() => {
  const base: MarkerLayout[] = locations.map((loc) => {
    const { x, y } = pointOf(loc);
    return { loc, x, y, side: x > 66 ? "left" : "right", labelY: y };
  });
  for (const side of ["left", "right"] as const) {
    const group = base
      .filter((m) => m.side === side)
      .sort((a, b) => a.labelY - b.labelY);
    for (let i = 1; i < group.length; i++) {
      const prev = group[i - 1];
      const curr = group[i];
      if (
        Math.abs(curr.x - prev.x) < H_OVERLAP &&
        curr.labelY - prev.labelY < MIN_LABEL_GAP
      ) {
        curr.labelY = prev.labelY + MIN_LABEL_GAP;
      }
    }
  }
  return base;
})();
