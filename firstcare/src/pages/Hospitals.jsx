import { useState, useEffect, useRef } from 'react'
import { MapPin, Navigation, ExternalLink, Loader2, AlertCircle } from 'lucide-react'

const FILTERS = ['All', 'Hospitals', 'Clinics', 'Pharmacies']

// Query map for Nominatim
const QUERY_MAP = {
  All: 'hospital|clinic|pharmacy',
  Hospitals: 'hospital',
  Clinics: 'clinic|medical centre',
  Pharmacies: 'pharmacy|chemist',
}

function getDistance(lat1, lon1, lat2, lon2) {
  const R = 6371
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) ** 2
  return (R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))).toFixed(2)
}

export default function Hospitals() {
  const [filter, setFilter] = useState('All')
  const [places, setPlaces] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [coords, setCoords] = useState(null)
  const [selected, setSelected] = useState(null)
  const mapRef = useRef(null)
  const leafletMapRef = useRef(null)
  const markersRef = useRef([])

  // Load Leaflet dynamically
  useEffect(() => {
    if (!document.getElementById('leaflet-css')) {
      const link = document.createElement('link')
      link.id = 'leaflet-css'
      link.rel = 'stylesheet'
      link.href = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css'
      document.head.appendChild(link)
    }
    if (!window.L) {
      const script = document.createElement('script')
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js'
      script.onload = () => initMap()
      document.head.appendChild(script)
    } else {
      initMap()
    }
    return () => { if (leafletMapRef.current) { leafletMapRef.current.remove(); leafletMapRef.current = null } }
  }, [])

  const initMap = (lat = 28.6139, lng = 77.2090) => {
    if (leafletMapRef.current) return
    const L = window.L
    const map = L.map(mapRef.current, { zoomControl: true }).setView([lat, lng], 13)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(map)
    leafletMapRef.current = map
  }

  const addMarkers = (list, userLat, userLng) => {
    const L = window.L
    if (!L || !leafletMapRef.current) return
    // Clear old markers
    markersRef.current.forEach(m => m.remove())
    markersRef.current = []

    // User marker
    const userIcon = L.divIcon({
      html: `<div style="background:#0f1729;width:14px;height:14px;border-radius:50%;border:3px solid white;box-shadow:0 0 0 2px #0f1729"></div>`,
      iconAnchor: [7, 7], className: ''
    })
    const userM = L.marker([userLat, userLng], { icon: userIcon }).addTo(leafletMapRef.current)
    userM.bindPopup('<b>You are here</b>')
    markersRef.current.push(userM)

    // Place markers
    list.forEach((place, i) => {
      const icon = L.divIcon({
        html: `<div style="background:#ef4444;color:white;width:28px;height:28px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;border:2px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.3)">${i + 1}</div>`,
        iconAnchor: [14, 14], className: ''
      })
      const m = L.marker([place.lat, place.lon], { icon })
        .addTo(leafletMapRef.current)
        .bindPopup(`<b>${place.name}</b><br/><small>${place.address}</small>`)
      markersRef.current.push(m)
    })

    leafletMapRef.current.setView([userLat, userLng], 14)
  }

  const locate = () => {
    setLoading(true)
    setError('')
    navigator.geolocation.getCurrentPosition(
      pos => {
        const { latitude, longitude } = pos.coords
        setCoords({ lat: latitude, lng: longitude })
        fetchPlaces(latitude, longitude)
        if (leafletMapRef.current) {
          leafletMapRef.current.setView([latitude, longitude], 14)
        }
      },
      () => {
        setError('Location access denied. Showing results for New Delhi as fallback.')
        fetchPlaces(28.6139, 77.2090)
      }
    )
  }

  const fetchPlaces = async (lat, lng) => {
    setLoading(true)
    try {
      const query = `[out:json][timeout:25];
        (
          node["amenity"~"hospital|clinic|pharmacy|doctors"](around:5000,${lat},${lng});
          way["amenity"~"hospital|clinic|pharmacy|doctors"](around:5000,${lat},${lng});
        );
        out center 30;`

      const res = await fetch('https://overpass-api.de/api/interpreter', {
        method: 'POST',
        body: 'data=' + encodeURIComponent(query),
      })
      const data = await res.json()

      const results = data.elements
        .filter(e => e.tags?.name)
        .map(e => ({
          id: e.id,
          name: e.tags.name,
          amenity: e.tags.amenity,
          address: [e.tags['addr:street'], e.tags['addr:city']].filter(Boolean).join(', ') || 'Address unavailable',
          lat: e.lat || e.center?.lat,
          lon: e.lon || e.center?.lon,
          distance: getDistance(lat, lng, e.lat || e.center?.lat, e.lon || e.center?.lon),
          phone: e.tags.phone || e.tags['contact:phone'] || null,
        }))
        .filter(e => e.lat && e.lon)
        .sort((a, b) => parseFloat(a.distance) - parseFloat(b.distance))
        .slice(0, 20)

      setPlaces(results)
      addMarkers(results, lat, lng)
    } catch (err) {
      setError('Could not fetch nearby locations. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const AMENITY_LABELS = {
    hospital: 'Hospital',
    clinic: 'Clinic',
    pharmacy: 'Pharmacy',
    doctors: 'Clinic',
  }

  const filtered = places.filter(p => {
    if (filter === 'All') return true
    if (filter === 'Hospitals') return p.amenity === 'hospital'
    if (filter === 'Clinics') return p.amenity === 'clinic' || p.amenity === 'doctors'
    if (filter === 'Pharmacies') return p.amenity === 'pharmacy'
    return true
  })

  return (
    <div className="min-h-screen bg-parchment">
      {/* Header */}
      <div className="bg-navy-900 py-10 px-4">
        <div className="max-w-5xl mx-auto">
          <p className="text-cream/40 font-body text-sm tracking-widest uppercase mb-1">Locate</p>
          <h1 className="font-display text-4xl text-cream mb-4">Nearby Medical Facilities</h1>
          <button
            onClick={locate}
            disabled={loading}
            className="btn-primary bg-sage-400 text-navy-900 hover:bg-sage-500 disabled:opacity-60"
          >
            {loading
              ? <><Loader2 size={16} className="animate-spin" /> Finding locations…</>
              : <><Navigation size={16} /> Use My Location</>
            }
          </button>
        </div>
      </div>

      {error && (
        <div className="max-w-5xl mx-auto px-4 pt-4">
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-start gap-2 text-amber-800 text-sm font-body">
            <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
            {error}
          </div>
        </div>
      )}

      <div className="max-w-5xl mx-auto px-4 py-6">
        <div className="grid md:grid-cols-5 gap-6">
          {/* Sidebar list */}
          <div className="md:col-span-2 space-y-4">
            {/* Filters */}
            <div className="flex flex-wrap gap-2">
              {FILTERS.map(f => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-3 py-1 rounded-full text-xs font-body font-medium border transition-all
                    ${filter === f ? 'bg-navy-900 text-cream border-navy-900' : 'bg-white border-parchment text-navy-600 hover:border-navy-900/30'}`}
                >
                  {f}
                </button>
              ))}
            </div>

            {/* No results message */}
            {!loading && places.length === 0 && (
              <div className="card p-6 text-center">
                <MapPin size={32} className="text-navy-900/20 mx-auto mb-3" />
                <p className="font-body text-sm text-navy-600/50">
                  Click "Use My Location" to find hospitals and clinics near you.
                </p>
              </div>
            )}

            {/* Results */}
            <div className="space-y-3 max-h-[500px] overflow-y-auto">
              {filtered.map((place, i) => (
                <div
                  key={place.id}
                  onClick={() => {
                    setSelected(place.id)
                    if (leafletMapRef.current) {
                      leafletMapRef.current.setView([place.lat, place.lon], 16)
                    }
                  }}
                  className={`card p-4 cursor-pointer transition-all hover:shadow-md
                    ${selected === place.id ? 'ring-2 ring-navy-900' : ''}`}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-7 h-7 rounded-full bg-red-500 text-white text-xs font-bold flex items-center justify-center flex-shrink-0">
                      {i + 1}
                    </div>
                    <div className="min-w-0">
                      <p className="font-body font-semibold text-navy-900 text-sm leading-tight">{place.name}</p>
                      <p className="text-navy-600/50 text-xs mt-0.5 font-body">{place.address}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-xs bg-parchment text-navy-600 px-2 py-0.5 rounded-full font-body">
                          {AMENITY_LABELS[place.amenity] || 'Medical'}
                        </span>
                        <span className="text-xs text-navy-600/50 font-body flex items-center gap-1">
                          <MapPin size={10} /> {place.distance} km
                        </span>
                      </div>
                      <a
                        href={`https://www.openstreetmap.org/directions?to=${place.lat},${place.lon}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={e => e.stopPropagation()}
                        className="inline-flex items-center gap-1 text-xs text-sage-500 hover:underline mt-2 font-body"
                      >
                        Get Directions <ExternalLink size={10} />
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Map */}
          <div className="md:col-span-3">
            <div
              ref={mapRef}
              className="rounded-2xl overflow-hidden border border-parchment shadow-sm"
              style={{ height: '520px', width: '100%' }}
            />
            <p className="text-xs text-navy-600/30 font-body mt-2 text-center">
              Map data © OpenStreetMap contributors · Powered by Leaflet
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
