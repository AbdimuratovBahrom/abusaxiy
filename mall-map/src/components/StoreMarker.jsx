import { MarkerF } from '@react-google-maps/api'

export const TYPE_ICONS = {
  store: '🏪',
  toilet: '🚽',
  food: '🍔',
  atm: '🏧',
  exit: '🚪',
  entrance: '🚩',
  other: '📍',
}

export function iconForType(type) {
  return TYPE_ICONS[type] || TYPE_ICONS.other
}

function StoreMarker({ point, dimmed = false, onClick }) {
  return (
    <MarkerF
      position={{ lat: point.lat, lng: point.lng }}
      title={point.name}
      opacity={dimmed ? 0.35 : 1}
      label={{
        text: iconForType(point.type),
        fontSize: '22px',
      }}
      icon={{
        path: 'M0,0 m -14,0 a 14,14 0 1,0 28,0 a 14,14 0 1,0 -28,0',
        fillOpacity: 0,
        strokeOpacity: 0,
        scale: 1,
      }}
      onClick={() => onClick?.(point)}
    />
  )
}

export default StoreMarker
