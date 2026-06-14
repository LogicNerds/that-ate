// ── Browser geolocation ──────────────────────────────────────────

export function getUserLocation() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("geolocation not supported"));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      pos => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      err => reject(err),
      { timeout: 8000 }
    );
  });
}

// ── Nominatim reverse geocode (free, no API key) ─────────────────
// Returns a human-readable city/region string from lat/lng

export async function reverseGeocode(lat, lng) {
  const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`;
  const res  = await fetch(url, { headers: { "Accept-Language": "en" } });
  const data = await res.json();
  const a    = data.address || {};
  // Build a short city label
  const city  = a.city || a.town || a.village || a.county || "";
  const state = a.state || "";
  return city && state ? `${city}, ${state}` : city || state || "";
}

// ── Nominatim address autocomplete ───────────────────────────────
// Returns up to 5 standardized address suggestions for a query string

export async function autocompleteAddress(query) {
  if (!query || query.length < 4) return [];
  const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&addressdetails=1&limit=5&countrycodes=us`;
  const res  = await fetch(url, { headers: { "Accept-Language": "en" } });
  const data = await res.json();
  return data.map(item => ({
    display: item.display_name,
    // Normalized short form for storage and dedup
    short:   buildShortAddress(item.address),
    lat:     parseFloat(item.lat),
    lng:     parseFloat(item.lon),
  }));
}

// Build a consistent short address string used as the addressKey for dedup
function buildShortAddress(a) {
  const parts = [
    a.house_number,
    a.road,
    a.city || a.town || a.village || a.county,
    a.state,
    a.postcode,
  ].filter(Boolean);
  return parts.join(", ").toLowerCase();
}
