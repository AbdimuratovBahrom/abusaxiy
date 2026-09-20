function RoutePanel({ store, route, loading, onClose }) {
  if (!store) return null

  const leg = route?.routes?.[0]?.legs?.[0]

  return (
    <div className="pointer-events-auto w-full max-w-sm rounded-lg bg-white p-4 shadow-lg">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">{store.name}</h2>
          {store.block && (
            <p className="text-sm text-gray-500">
              Блок {store.block}
              {store.row ? `, ряд ${store.row}` : ''}
            </p>
          )}
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
          aria-label="Закрыть"
        >
          ✕
        </button>
      </div>

      {store.description && <p className="mt-2 text-sm text-gray-600">{store.description}</p>}

      {loading && <p className="mt-3 text-sm text-gray-500">Строим маршрут…</p>}

      {leg && (
        <div className="mt-3 border-t border-gray-100 pt-3">
          <p className="text-sm font-medium text-gray-800">
            🚶 {leg.distance?.text} · {leg.duration?.text}
          </p>
          <ol className="mt-2 max-h-64 list-decimal space-y-2 overflow-y-auto pl-5 text-sm text-gray-600">
            {leg.steps?.map((step, idx) => (
              <li key={idx} dangerouslySetInnerHTML={{ __html: step.instructions }} />
            ))}
          </ol>
        </div>
      )}
    </div>
  )
}

export default RoutePanel
