import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { GoogleMap, MarkerF, useJsApiLoader } from '@react-google-maps/api'
import storesData from '../data/stores.json'
import EditorPanel from '../components/EditorPanel.jsx'
import { iconForType } from '../components/StoreMarker.jsx'
import {
  getEditorData,
  setEditorData,
  isEditorAuthed,
  setEditorAuthed,
} from '../utils/storage.js'

const ADMIN_PASSWORD = 'admin2024'
const containerStyle = { width: '100%', height: '60vh' }

function specialCategoryFor(type) {
  return type === 'store' || type === 'food' ? 'store' : 'special'
}

function nextStoreId(stores) {
  const max = stores.reduce((acc, s) => {
    const n = parseInt(s.id, 10)
    return Number.isNaN(n) ? acc : Math.max(acc, n)
  }, 0)
  return String(max + 1).padStart(3, '0')
}

function LoginGate({ onSuccess }) {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (password === ADMIN_PASSWORD) {
      setEditorAuthed()
      onSuccess()
    } else {
      setError('Неверный пароль')
    }
  }

  return (
    <div className="flex h-screen items-center justify-center bg-gray-50">
      <form onSubmit={handleSubmit} className="w-full max-w-xs space-y-3 rounded-lg bg-white p-6 shadow-md">
        <h1 className="text-lg font-semibold text-gray-900">Вход в редактор</h1>
        <input
          type="password"
          autoFocus
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Пароль"
          className="w-full rounded border border-gray-300 px-3 py-2"
        />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button type="submit" className="w-full rounded bg-blue-600 px-3 py-2 text-white hover:bg-blue-700">
          Войти
        </button>
        <Link to="/" className="block text-center text-sm text-gray-500 hover:underline">
          ← На карту
        </Link>
      </form>
    </div>
  )
}

function EditorPage() {
  const [authed, setAuthed] = useState(isEditorAuthed())
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
  })

  const [data, setData] = useState(() => getEditorData() || storesData)
  const [formOpen, setFormOpen] = useState(false)
  const [formMode, setFormMode] = useState('add')
  const [formInitial, setFormInitial] = useState(null)
  const editingRef = useRef(null)
  const fileInputRef = useRef(null)

  useEffect(() => {
    setEditorData(data)
  }, [data])

  if (!authed) return <LoginGate onSuccess={() => setAuthed(true)} />

  const points = [
    ...data.stores.map((p) => ({ ...p, category: 'store' })),
    ...data.specialObjects.map((p) => ({ ...p, category: 'special' })),
  ]

  const handleMapClick = (e) => {
    editingRef.current = null
    setFormMode('add')
    setFormInitial({ lat: e.latLng.lat(), lng: e.latLng.lng() })
    setFormOpen(true)
  }

  const handleEditClick = (point) => {
    editingRef.current = { id: point.id, category: point.category }
    setFormMode('edit')
    setFormInitial(point)
    setFormOpen(true)
  }

  const handleDelete = (point) => {
    setData((prev) => ({
      ...prev,
      stores: prev.stores.filter((s) => s.id !== point.id),
      specialObjects: prev.specialObjects.filter((s) => s.id !== point.id),
    }))
  }

  const handleFormSubmit = (form) => {
    const category = specialCategoryFor(form.type)
    const editing = editingRef.current

    setData((prev) => {
      let stores = prev.stores.filter((s) => s.id !== editing?.id)
      let specialObjects = prev.specialObjects.filter((s) => s.id !== editing?.id)

      const id = editing?.id || (category === 'store' ? nextStoreId(prev.stores) : `${form.type}_${Date.now().toString(36)}`)
      const point = {
        id,
        name: form.name,
        block: form.block,
        row: form.row,
        type: form.type,
        lat: form.lat,
        lng: form.lng,
        description: form.description || '',
      }

      if (category === 'store') stores = [...stores, point]
      else specialObjects = [...specialObjects, point]

      return { ...prev, stores, specialObjects }
    })

    setFormOpen(false)
    editingRef.current = null
  }

  const handleExport = () => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'stores.json'
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleImportClick = () => fileInputRef.current?.click()

  const handleImportFile = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const text = await file.text()
      const parsed = JSON.parse(text)
      if (!Array.isArray(parsed.stores) || !Array.isArray(parsed.specialObjects)) {
        throw new Error('Неверный формат')
      }
      setData(parsed)
    } catch {
      alert('Не удалось прочитать JSON-файл')
    } finally {
      e.target.value = ''
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="mx-auto max-w-6xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h1 className="text-xl font-semibold text-gray-900">Редактор точек ТЦ «Абусахий»</h1>
          <div className="flex gap-2">
            <button onClick={handleExport} className="rounded bg-green-600 px-3 py-1.5 text-sm text-white hover:bg-green-700">
              Экспорт JSON
            </button>
            <button onClick={handleImportClick} className="rounded bg-gray-600 px-3 py-1.5 text-sm text-white hover:bg-gray-700">
              Импорт JSON
            </button>
            <input ref={fileInputRef} type="file" accept="application/json" onChange={handleImportFile} className="hidden" />
            <Link to="/" className="rounded bg-white px-3 py-1.5 text-sm text-gray-700 shadow hover:bg-gray-100">
              ← На карту
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <div className="lg:col-span-2">
            {!import.meta.env.VITE_GOOGLE_MAPS_API_KEY ? (
              <div className="flex h-[60vh] items-center justify-center rounded-lg bg-white text-center text-gray-600 shadow">
                Не задан VITE_GOOGLE_MAPS_API_KEY в .env
              </div>
            ) : !isLoaded ? (
              <div className="flex h-[60vh] items-center justify-center rounded-lg bg-white shadow">Загрузка карты…</div>
            ) : (
              <div className="space-y-3">
                <GoogleMap
                  mapContainerStyle={containerStyle}
                  center={data.mapCenter}
                  zoom={data.defaultZoom}
                  onClick={handleMapClick}
                  options={{ streetViewControl: false, fullscreenControl: false }}
                >
                  {points.map((point) => (
                    <MarkerF
                      key={point.id}
                      position={{ lat: point.lat, lng: point.lng }}
                      title={point.name}
                      label={{ text: iconForType(point.type), fontSize: '20px' }}
                    />
                  ))}
                </GoogleMap>
                <p className="text-sm text-gray-500">Кликните по карте, чтобы добавить новую точку.</p>
                {formOpen && (
                  <EditorPanel
                    mode={formMode}
                    initialData={formInitial}
                    onSubmit={handleFormSubmit}
                    onCancel={() => setFormOpen(false)}
                  />
                )}
              </div>
            )}
          </div>

          <div className="rounded-lg bg-white p-3 shadow">
            <h2 className="mb-2 font-semibold text-gray-900">Все точки ({points.length})</h2>
            <ul className="max-h-[70vh] space-y-1 overflow-y-auto">
              {points.map((point) => (
                <li key={point.id} className="flex items-center gap-2 rounded px-2 py-1.5 hover:bg-gray-50">
                  <span>{iconForType(point.type)}</span>
                  <span className="flex-1 truncate text-sm">
                    {point.name}
                    {point.block && (
                      <span className="ml-1 text-xs text-gray-400">
                        ({point.block}
                        {point.row ? `-${point.row}` : ''})
                      </span>
                    )}
                  </span>
                  <button onClick={() => handleEditClick(point)} className="text-xs text-blue-600 hover:underline">
                    изм.
                  </button>
                  <button onClick={() => handleDelete(point)} className="text-xs text-red-600 hover:underline">
                    удал.
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

export default EditorPage
