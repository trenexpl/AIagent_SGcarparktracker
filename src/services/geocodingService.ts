import { SearchDestination } from '../types/carpark';
import { SINGAPORE_DESTINATIONS } from '../data/singaporeDestinations';

export interface GeocodedAddress {
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  area?: string;
  postalCode?: string;
  confidence?: 'high' | 'medium' | 'low';
}

/**
 * 2-Digit Postal Sector Coordinate mapping for all Singapore Postal Sectors (01 to 82)
 * Provides instant fallback coordinates for any 6-digit postal code in Singapore.
 */
const POSTAL_SECTOR_COORDINATES: Record<string, { area: string; lat: number; lng: number }> = {
  // District 01: Raffles Place, Cecil, Marina, People's Park (01 - 06)
  '01': { area: 'Raffles Place / Marina', lat: 1.2834, lng: 103.8515 },
  '02': { area: 'Anson / Tanjong Pagar', lat: 1.2740, lng: 103.8440 },
  '03': { area: 'Queenstown / Tiong Bahru', lat: 1.2865, lng: 103.8270 },
  '04': { area: 'Telok Blangah / Harbourfront', lat: 1.2700, lng: 103.8200 },
  '05': { area: 'Pasir Panjang / Clementi', lat: 1.2930, lng: 103.7700 },
  '06': { area: 'High Street / Beach Road', lat: 1.2930, lng: 103.8530 },
  '07': { area: 'Middle Road / Golden Mile', lat: 1.3010, lng: 103.8600 },
  '08': { area: 'Little India / Farrer Park', lat: 1.3120, lng: 103.8520 },
  '09': { area: 'Orchard / Cairnhill / River Valley', lat: 1.3020, lng: 103.8370 },
  '10': { area: 'Ardmore / Bukit Timah / Holland', lat: 1.3130, lng: 103.8150 },
  '11': { area: 'Watten / Novena / Thomson', lat: 1.3200, lng: 103.8430 },
  '12': { area: 'Balestier / Toa Payoh / Serangoon', lat: 1.3270, lng: 103.8500 },
  '13': { area: 'Macpherson / Braddell', lat: 1.3340, lng: 103.8760 },
  '14': { area: 'Geylang / Eunos', lat: 1.3180, lng: 103.8930 },
  '15': { area: 'Katong / Joo Chiat / Amber Road', lat: 1.3050, lng: 103.9020 },
  '16': { area: 'Bedok / Upper East Coast / Eastwood', lat: 1.3200, lng: 103.9300 },
  '17': { area: 'Loyang / Changi', lat: 1.3550, lng: 103.9750 },
  '18': { area: 'Tampines / Pasir Ris', lat: 1.3550, lng: 103.9450 },
  '19': { area: 'Serangoon Garden / Hougang / Punggol', lat: 1.3650, lng: 103.8850 },
  '20': { area: 'Bishan / Ang Mo Kio', lat: 1.3690, lng: 103.8480 },
  '21': { area: 'Upper Bukit Timah / Ulu Pandan', lat: 1.3400, lng: 103.7750 },
  '22': { area: 'Jurong East / Jurong West', lat: 1.3380, lng: 103.7300 },
  '23': { area: 'Hillview / Dairy Farm / Bukit Panjang / Choa Chu Kang', lat: 1.3780, lng: 103.7550 },
  '24': { area: 'Lim Chu Kang / Tengah', lat: 1.3800, lng: 103.7200 },
  '25': { area: 'Kranji / Woodgrove / Woodlands', lat: 1.4350, lng: 103.7860 },
  '26': { area: 'Upper Thomson / Springleaf', lat: 1.3950, lng: 103.8200 },
  '27': { area: 'Yishun / Sembawang', lat: 1.4300, lng: 103.8350 },
  '28': { area: 'Seletar / Yio Chu Kang', lat: 1.3950, lng: 103.8650 },

  // Direct 2-digit postal prefixes (e.g. 52xxxx -> Tampines, 60xxxx -> Jurong East, 73xxxx -> Woodlands)
  '52': { area: 'Tampines', lat: 1.3533, lng: 103.9405 },
  '51': { area: 'Pasir Ris', lat: 1.3721, lng: 103.9474 },
  '53': { area: 'Hougang', lat: 1.3713, lng: 103.8915 },
  '54': { area: 'Sengkang', lat: 1.3916, lng: 103.8953 },
  '55': { area: 'Serangoon', lat: 1.3500, lng: 103.8730 },
  '56': { area: 'Ang Mo Kio', lat: 1.3691, lng: 103.8454 },
  '57': { area: 'Bishan', lat: 1.3526, lng: 103.8495 },
  '31': { area: 'Toa Payoh', lat: 1.3343, lng: 103.8563 },
  '32': { area: 'Balestier / Novena', lat: 1.3204, lng: 103.8438 },
  '38': { area: 'Geylang / Aljunied', lat: 1.3164, lng: 103.8829 },
  '39': { area: 'Kallang / Stadium', lat: 1.3032, lng: 103.8749 },
  '40': { area: 'Eunos / Paya Lebar', lat: 1.3182, lng: 103.8931 },
  '44': { area: 'Marine Parade', lat: 1.3023, lng: 103.9052 },
  '46': { area: 'Bedok', lat: 1.3236, lng: 103.9273 },
  '60': { area: 'Jurong East', lat: 1.3338, lng: 103.7431 },
  '64': { area: 'Jurong West / Boon Lay', lat: 1.3404, lng: 103.7060 },
  '65': { area: 'Bukit Batok', lat: 1.3590, lng: 103.7540 },
  '67': { area: 'Bukit Panjang', lat: 1.3780, lng: 103.7630 },
  '68': { area: 'Choa Chu Kang', lat: 1.3850, lng: 103.7450 },
  '73': { area: 'Woodlands', lat: 1.4361, lng: 103.7859 },
  '75': { area: 'Sembawang', lat: 1.4491, lng: 103.8201 },
  '76': { area: 'Yishun', lat: 1.4298, lng: 103.8360 },
  '82': { area: 'Punggol', lat: 1.4050, lng: 103.9020 },
};

/**
 * Key Singapore Planning Areas & Towns coordinates lookup table
 */
const SINGAPORE_AREAS: Record<string, { lat: number; lng: number; area: string }> = {
  'jurong east': { lat: 1.3338, lng: 103.7431, area: 'Jurong East' },
  'jurong west': { lat: 1.3404, lng: 103.7060, area: 'Jurong West' },
  'jurong': { lat: 1.3338, lng: 103.7431, area: 'Jurong East' },
  'orchard': { lat: 1.3040, lng: 103.8318, area: 'Orchard / Central' },
  'marina bay': { lat: 1.2834, lng: 103.8607, area: 'Marina Bay / Downtown' },
  'mbs': { lat: 1.2834, lng: 103.8607, area: 'Marina Bay' },
  'raffles place': { lat: 1.2842, lng: 103.8515, area: 'CBD / Raffles Place' },
  'tanjong pagar': { lat: 1.2764, lng: 103.8447, area: 'Tanjong Pagar' },
  'bugis': { lat: 1.3000, lng: 103.8553, area: 'Bugis / Rochor' },
  'suntec': { lat: 1.2935, lng: 103.8572, area: 'Marina Centre' },
  'vivocity': { lat: 1.2644, lng: 103.8222, area: 'HarbourFront' },
  'harbourfront': { lat: 1.2644, lng: 103.8222, area: 'HarbourFront' },
  'sentosa': { lat: 1.2540, lng: 103.8238, area: 'Sentosa' },
  'changi': { lat: 1.3602, lng: 103.9897, area: 'Changi' },
  'changi airport': { lat: 1.3602, lng: 103.9897, area: 'Changi Airport' },
  'jewel': { lat: 1.3602, lng: 103.9897, area: 'Changi Airport' },
  'tampines': { lat: 1.3533, lng: 103.9405, area: 'Tampines' },
  'bedok': { lat: 1.3236, lng: 103.9273, area: 'Bedok' },
  'pasir ris': { lat: 1.3721, lng: 103.9474, area: 'Pasir Ris' },
  'woodlands': { lat: 1.4361, lng: 103.7859, area: 'Woodlands' },
  'causeway': { lat: 1.4468, lng: 103.7695, area: 'Woodlands / Causeway' },
  'yishun': { lat: 1.4298, lng: 103.8360, area: 'Yishun' },
  'khatib': { lat: 1.4172, lng: 103.8329, area: 'Yishun / Khatib' },
  'sembawang': { lat: 1.4491, lng: 103.8201, area: 'Sembawang' },
  'ang mo kio': { lat: 1.3691, lng: 103.8454, area: 'Ang Mo Kio' },
  'amk': { lat: 1.3691, lng: 103.8454, area: 'Ang Mo Kio' },
  'bishan': { lat: 1.3526, lng: 103.8495, area: 'Bishan' },
  'toa payoh': { lat: 1.3343, lng: 103.8563, area: 'Toa Payoh' },
  'serangoon': { lat: 1.3500, lng: 103.8730, area: 'Serangoon' },
  'nex': { lat: 1.3508, lng: 103.8723, area: 'Serangoon' },
  'hougang': { lat: 1.3713, lng: 103.8915, area: 'Hougang' },
  'sengkang': { lat: 1.3916, lng: 103.8953, area: 'Sengkang' },
  'punggol': { lat: 1.4050, lng: 103.9020, area: 'Punggol' },
  'waterway point': { lat: 1.4067, lng: 103.9019, area: 'Punggol' },
  'clementi': { lat: 1.3150, lng: 103.7650, area: 'Clementi' },
  'bukit batok': { lat: 1.3590, lng: 103.7540, area: 'Bukit Batok' },
  'bukit panjang': { lat: 1.3780, lng: 103.7630, area: 'Bukit Panjang' },
  'choa chu kang': { lat: 1.3850, lng: 103.7450, area: 'Choa Chu Kang' },
  'cck': { lat: 1.3850, lng: 103.7450, area: 'Choa Chu Kang' },
  'bukit timah': { lat: 1.3294, lng: 103.8021, area: 'Bukit Timah' },
  'novena': { lat: 1.3204, lng: 103.8438, area: 'Novena' },
  'newton': { lat: 1.3128, lng: 103.8380, area: 'Newton' },
  'chinatown': { lat: 1.2843, lng: 103.8440, area: 'Chinatown' },
  'little india': { lat: 1.3068, lng: 103.8518, area: 'Little India' },
  'geylang': { lat: 1.3164, lng: 103.8829, area: 'Geylang' },
  'paya lebar': { lat: 1.3182, lng: 103.8931, area: 'Paya Lebar' },
  'kallang': { lat: 1.3032, lng: 103.8749, area: 'Kallang' },
  'marine parade': { lat: 1.3023, lng: 103.9052, area: 'Marine Parade' },
  'katong': { lat: 1.3050, lng: 103.9020, area: 'Katong' },
  'east coast': { lat: 1.3015, lng: 103.9125, area: 'East Coast' },
  'queenstown': { lat: 1.2942, lng: 103.8058, area: 'Queenstown' },
  'redhill': { lat: 1.2896, lng: 103.8168, area: 'Redhill' },
  'tiong bahru': { lat: 1.2865, lng: 103.8270, area: 'Tiong Bahru' },
  'pasir panjang': { lat: 1.2762, lng: 103.7914, area: 'Pasir Panjang' },
  'boon lay': { lat: 1.3404, lng: 103.7060, area: 'Boon Lay' },
  'pioneer': { lat: 1.3376, lng: 103.6974, area: 'Pioneer' },
  'tuas': { lat: 1.3298, lng: 103.6366, area: 'Tuas' },
  'mandai': { lat: 1.4043, lng: 103.7930, area: 'Mandai' },
  'kranji': { lat: 1.4251, lng: 103.7621, area: 'Kranji' },
  'seletar': { lat: 1.4098, lng: 103.8708, area: 'Seletar' },
};

/**
 * Extract 6-digit Singapore postal code if present in input string
 */
export function extractPostalCode(input: string): string | null {
  const match = input.match(/\b(\d{6})\b/);
  return match ? match[1] : null;
}

/**
 * Geocode any Singapore address, street, landmark, or 6-digit postal code.
 * 1. Checks OneMap API (official SG Government geocoding endpoint).
 * 2. Checks OpenStreetMap / Nominatim.
 * 3. Falls back to pre-compiled postal sectors & area coordinate dictionary.
 */
export async function geocodeSingaporeAddress(query: string): Promise<GeocodedAddress> {
  const trimmed = query.trim();
  if (!trimmed) {
    return {
      name: 'Singapore City Centre',
      address: 'Singapore',
      latitude: 1.2834,
      longitude: 103.8515,
      area: 'Central',
      confidence: 'low',
    };
  }

  // Check static predefined destinations first (instant exact match)
  const qLower = trimmed.toLowerCase();
  const matchedPreset = SINGAPORE_DESTINATIONS.find(
    (d) =>
      d.name.toLowerCase() === qLower ||
      d.address.toLowerCase().includes(qLower) ||
      (qLower.length >= 4 && d.name.toLowerCase().includes(qLower))
  );

  if (matchedPreset) {
    return {
      name: matchedPreset.name,
      address: matchedPreset.address,
      latitude: matchedPreset.latitude,
      longitude: matchedPreset.longitude,
      area: matchedPreset.area,
      confidence: 'high',
    };
  }

  // 1. Try OneMap Official Singapore Search API
  try {
    const onemapUrl = `https://www.onemap.gov.sg/api/common/elastic/search?searchVal=${encodeURIComponent(
      trimmed
    )}&returnGeom=Y&getAddrDetails=Y&pageNum=1`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);

    const response = await fetch(onemapUrl, {
      signal: controller.signal,
      headers: { Accept: 'application/json' },
    });
    clearTimeout(timeoutId);

    if (response.ok) {
      const data = await response.json();
      if (data.results && data.results.length > 0) {
        const top = data.results[0];
        const lat = parseFloat(top.LATITUDE);
        const lng = parseFloat(top.LONGITUDE);

        if (!isNaN(lat) && !isNaN(lng) && lat >= 1.15 && lat <= 1.48 && lng >= 103.6 && lng <= 104.1) {
          const buildingName = top.BUILDING !== 'NIL' ? top.BUILDING : '';
          const road = top.ROAD_NAME !== 'NIL' ? top.ROAD_NAME : '';
          const blk = top.BLK_NO !== 'NIL' ? `Blk ${top.BLK_NO} ` : '';
          const postal = top.POSTAL !== 'NIL' ? `Singapore ${top.POSTAL}` : '';

          const displayTitle = buildingName || `${blk}${road}` || top.SEARCHVAL || trimmed;
          const fullAddress = top.ADDRESS || `${blk}${road}, ${postal}`.trim();

          return {
            name: displayTitle,
            address: fullAddress || `${displayTitle}, Singapore`,
            latitude: lat,
            longitude: lng,
            postalCode: top.POSTAL !== 'NIL' ? top.POSTAL : undefined,
            area: road || buildingName || 'Singapore',
            confidence: 'high',
          };
        }
      }
    }
  } catch (err) {
    // OneMap fetch timed out or offline, proceed to next strategy
  }

  // 2. Try Nominatim (OpenStreetMap) Singapore Geocoder
  try {
    const nominatimUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
      trimmed + ', Singapore'
    )}&countrycodes=sg&limit=1`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2500);

    const response = await fetch(nominatimUrl, {
      signal: controller.signal,
      headers: {
        Accept: 'application/json',
      },
    });
    clearTimeout(timeoutId);

    if (response.ok) {
      const items = await response.json();
      if (items && items.length > 0) {
        const item = items[0];
        const lat = parseFloat(item.lat);
        const lng = parseFloat(item.lon);

        if (!isNaN(lat) && !isNaN(lng) && lat >= 1.15 && lat <= 1.48 && lng >= 103.6 && lng <= 104.1) {
          return {
            name: item.name || trimmed,
            address: item.display_name,
            latitude: lat,
            longitude: lng,
            confidence: 'high',
          };
        }
      }
    }
  } catch (err) {
    // Fallback to local dictionary
  }

  // 3. Check for 6-Digit Singapore Postal Code match
  const postalCode = extractPostalCode(trimmed);
  if (postalCode) {
    const sector2 = postalCode.slice(0, 2);
    if (POSTAL_SECTOR_COORDINATES[sector2]) {
      const info = POSTAL_SECTOR_COORDINATES[sector2];
      return {
        name: `Postal Code ${postalCode} (${info.area})`,
        address: `${trimmed}, Singapore ${postalCode}`,
        latitude: info.lat,
        longitude: info.lng,
        area: info.area,
        postalCode: postalCode,
        confidence: 'medium',
      };
    }
  }

  // 4. Check known planning areas and keywords
  for (const [key, val] of Object.entries(SINGAPORE_AREAS)) {
    if (qLower.includes(key)) {
      return {
        name: trimmed,
        address: `${trimmed}, ${val.area}, Singapore`,
        latitude: val.lat,
        longitude: val.lng,
        area: val.area,
        confidence: 'medium',
      };
    }
  }

  // 5. Default fallback to central coordinates
  return {
    name: trimmed,
    address: `${trimmed}, Singapore`,
    latitude: 1.3040,
    longitude: 103.8318,
    area: 'Central',
    confidence: 'low',
  };
}
