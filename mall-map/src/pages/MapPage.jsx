import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  DirectionsRenderer,
  DirectionsService,
  GoogleMap,
  InfoWindowF,
  useJsApiLoader,
} from '@react-google-maps/api'
import storesData from '../data/stores.json'
import SearchBar from '../components/SearchBar.jsx'
import RoutePanel from '../components/RoutePanel.jsx'
import StoreMarker, { iconForType } from '../components/StoreMarker.jsx'
import { getLastStoreId, setLastStoreId } from '../utils/storage.js'

const containerStyle = { width: '100%', height: '100vh' }
const MAIN_ENTRANCE = storesData.specialObjects.find((o) => o.id === 'main_entrance')

function matchesQuery(point, query) {
  const q = query.trim().toLowerCase()
  if (!q) return true
  return (
    point.name.toLowerCase().includes(q) ||
    point.id.toLowerCase().includes(q) ||
    (point.block || '').toLowerCase().includes(q) ||
    (point.row || '').toLowerCase().includes(q)
  )
}

function MapPage() {
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
  })

  const allPoints = useMemo(
    () => [...storesData.stores, ...storesData.specialObjects],
    [],
  )

  const [map, setMap] = useState(null)
  const [query, setQuery] = useState('')
  const [activeInfoPoint, setActiveInfoPoint] = useState(null)
  const [selectedStore, setSelectedStore] = useState(null)
  const [origin, setOrigin] = useState(
    MAIN_ENTRANCE ? { lat: MAIN_ENTRANCE.lat, lng: MAIN_ENTRANCE.lng } : null,
  )
  const [directionsResult, setDirectionsResult] = useState(null)
  const [routeLoading, setRouteLoading] = useState(false)
  const [geoError, setGeoError] = useState('')

  const onMapLoad = useCallback((mapInstance) => setMap(mapInstance), [])

  const selectStore = useCallback((point) => {
    setSelectedStore(point)
    setActiveInfoPoint(null)
    setLastStoreId(point.id)
    if (map) {
      map.panTo({ lat: point.lat, lng: point.lng })
      map.setZoom(19)
    }
  }, [map])

  // Restore last selected store once the map and data are ready.
  useEffect(() => {
    if (!map || selectedStore) return
    const lastId = getLastStoreId()
    if (!lastId) return
    const found = allPoints.find((p) => p.id === lastId)
    if (found) selectStore(found)
  }, [map, allPoints, selectedStore, selectStore])

  // Rebuild the route whenever the destination or the starting point changes.
  useEffect(() => {
    if (!selectedStore || !origin) return
    setDirectionsResult(null)
    setRouteLoading(true)
  }, [selectedStore, origin])

  const useMyLocation = () => {
    if (!navigator.geolocation) {
      setGeoError('Геолокация не поддерживается браузером')
      return
    }
    setGeoError('')
    navigator.geolocation.getCurrentPosition(
      (pos) => setOrigin({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => setGeoError('Не удалось определить местоположение'),
    )
  }

  if (!import.meta.env.VITE_GOOGLE_MAPS_API_KEY) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50 p-6 text-center text-gray-600">
        Не задан VITE_GOOGLE_MAPS_API_KEY в .env — см. README.md
      </div>
    )
  }

  if (!isLoaded) {
    return <div className="flex h-screen items-center justify-center">Загрузка карты…</div>
  }

  return (
    <div className="relative h-screen w-full overflow-hidden">
      <div className="pointer-events-none absolute inset-x-0 top-0 z-10 flex flex-col items-center gap-2 p-3 sm:items-start sm:p-4">
        <div className="pointer-events-auto flex w-full max-w-md items-center justify-between gap-2">
          <SearchBar points={allPoints} onQueryChange={setQuery} onSelect={selectStore} />
          <Link
            to="/editor"
            className="rounded-lg bg-white px-3 py-2 text-sm text-gray-600 shadow-md hover:bg-gray-50"
          >
            Редактор
          </Link>
        </div>
      </div>

      <GoogleMap
        mapContainerStyle={containerStyle}
        center={storesData.mapCenter}
        zoom={storesData.defaultZoom}
        mapTypeId="satellite"
        onLoad={onMapLoad}
        options={{ streetViewControl: false, fullscreenControl: false }}
      >
        {allPoints.map((point) => (
          <StoreMarker
            key={point.id}
            point={point}
            dimmed={query.trim() !== '' && !matchesQuery(point, query)}
            onClick={setActiveInfoPoint}
          />
        ))}

        {activeInfoPoint && (
          <InfoWindowF
            position={{ lat: activeInfoPoint.lat, lng: activeInfoPoint.lng }}
            onCloseClick={() => setActiveInfoPoint(null)}
          >
            <div className="min-w-[160px] p-1">
              <p className="font-semibold text-gray-900">
                {iconForType(activeInfoPoint.type)} {activeInfoPoint.name}
              </p>
              {activeInfoPoint.block && (
                <p className="text-sm text-gray-500">
                  Блок {activeInfoPoint.block}
                  {activeInfoPoint.row ? `, ряд ${activeInfoPoint.row}` : ''}
                </p>
              )}
              <button
                type="button"
                onClick={() => selectStore(activeInfoPoint)}
                className="mt-2 w-full rounded bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700"
              >
                Проложить маршрут
              </button>
            </div>
          </InfoWindowF>
        )}

        {selectedStore && origin && !directionsResult && (
          <DirectionsService
            options={{
              origin,
              destination: { lat: selectedStore.lat, lng: selectedStore.lng },
              travelMode: 'WALKING',
            }}
            callback={(result, status) => {
              setRouteLoading(false)
              if (status === 'OK') setDirectionsResult(result)
            }}
          />
        )}

        {directionsResult && (
          <DirectionsRenderer
            directions={directionsResult}
            options={{ suppressMarkers: true }}
          />
        )}
      </GoogleMap>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 flex flex-col items-center gap-2 p-3 sm:flex-row sm:items-end sm:justify-between sm:p-4">
        <RoutePanel
          store={selectedStore}
          route={directionsResult}
          loading={routeLoading}
          onClose={() => {
            setSelectedStore(null)
            setDirectionsResult(null)
          }}
        />
        <div className="pointer-events-auto flex flex-col items-end gap-1">
          {geoError && <p className="rounded bg-red-50 px-2 py-1 text-xs text-red-600">{geoError}</p>}
          <button
            type="button"
            onClick={useMyLocation}
            className="rounded-full bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-lg hover:bg-gray-50"
          >
            📍 Моё местоположение
          </button>
        </div>
      </div>
    </div>
  )
}

export default MapPage
