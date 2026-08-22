/**
 * OrbitX General Public Safety & Preparedness Guidelines (§4)
 * Factual reference guidance mapped by disaster category
 */

export const DISASTER_PRECAUTIONS = {
  Wildfire: [
    'Know your evacuation routes and establish an emergency family meetup point.',
    'Keep an emergency go-bag ready with essential medications, N95 masks, and documents.',
    'Monitor local air quality index (AQI) and keep windows and doors closed if downwind.',
    'Follow official evacuation orders immediately when issued by local fire authorities.',
  ],
  Seismic: [
    'Drop, Cover, and Hold On under a sturdy desk or table during ground shaking.',
    'Identify safe spots in advance within each room away from windows and heavy furniture.',
    'Be prepared for potential aftershocks following the primary seismic event.',
    'Check gas lines and electrical wiring for damage before relighting utilities.',
  ],
  Storm: [
    'Secure loose outdoor objects and outdoor furniture ahead of forecast high winds.',
    'Know your local storm shelter location and storm surge evacuation zone.',
    'Keep communication devices and portable power banks fully charged.',
    'Avoid driving through flooded roadways or standing water during the storm.',
  ],
  Flood: [
    'Never walk or drive through moving floodwaters ("Turn Around, Don\'t Drown").',
    'Move to higher ground early if flood warnings are issued for your zone.',
    'Avoid contact with floodwaters which may contain chemical contaminants or electrical hazards.',
    'Keep essential papers and electronics in sealed waterproof containers.',
  ],
  Volcano: [
    'Follow official ashfall and evacuation advisories from volcanic observatories.',
    'Wear an N95 respirator mask and goggles outdoors during volcanic ashfall.',
    'Avoid low-lying river valleys downstream of the volcano due to lahar (mudflow) risks.',
    'Keep building ventilation intakes closed and filter indoor air.',
  ],
  Other: [
    'Stay tuned to local emergency broadcast channels for real-time updates.',
    'Maintain a 72-hour emergency supply kit with clean water and non-perishable food.',
    'Keep a battery-powered or hand-crank emergency radio on hand.',
  ],
};

export function getPrecautionsForCategory(categoryStr = '') {
  const cat = categoryStr.toLowerCase();
  if (cat.includes('fire')) return DISASTER_PRECAUTIONS.Wildfire;
  if (cat.includes('quake') || cat.includes('seismic')) return DISASTER_PRECAUTIONS.Seismic;
  if (cat.includes('storm') || cat.includes('cyclone') || cat.includes('hurricane')) return DISASTER_PRECAUTIONS.Storm;
  if (cat.includes('flood')) return DISASTER_PRECAUTIONS.Flood;
  if (cat.includes('volcano')) return DISASTER_PRECAUTIONS.Volcano;
  return DISASTER_PRECAUTIONS.Other;
}
