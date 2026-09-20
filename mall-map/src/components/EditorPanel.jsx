import { useEffect, useState } from 'react'

const TYPE_OPTIONS = [
  { value: 'store', label: '🏪 Магазин' },
  { value: 'toilet', label: '🚽 Туалет' },
  { value: 'food', label: '🍔 Еда' },
  { value: 'atm', label: '🏧 Банкомат' },
  { value: 'exit', label: '🚪 Выход' },
  { value: 'other', label: '📍 Другое' },
]

const BLOCK_OPTIONS = ['A', 'B', 'C']

const EMPTY_FORM = { name: '', block: 'A', row: '', type: 'store', description: '', lat: null, lng: null }

function EditorPanel({ mode, initialData, onSubmit, onCancel }) {
  const [form, setForm] = useState(EMPTY_FORM)

  useEffect(() => {
    setForm(initialData ? { ...EMPTY_FORM, ...initialData } : EMPTY_FORM)
  }, [initialData])

  const update = (field) => (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }))

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.name.trim() || form.lat == null || form.lng == null) return
    onSubmit(form)
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-sm space-y-3 rounded-lg border border-gray-200 bg-white p-4 shadow-lg"
    >
      <h3 className="font-semibold text-gray-900">
        {mode === 'edit' ? 'Редактировать точку' : 'Новая точка'}
      </h3>

      <p className="text-xs text-gray-500">
        Координаты: {form.lat?.toFixed(6)}, {form.lng?.toFixed(6)}
      </p>

      <label className="block text-sm">
        Название
        <input
          type="text"
          required
          value={form.name}
          onChange={update('name')}
          className="mt-1 w-full rounded border border-gray-300 px-2 py-1.5"
        />
      </label>

      <div className="flex gap-2">
        <label className="block flex-1 text-sm">
          Блок
          <select
            value={form.block}
            onChange={update('block')}
            className="mt-1 w-full rounded border border-gray-300 px-2 py-1.5"
          >
            {BLOCK_OPTIONS.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>
        </label>
        <label className="block flex-1 text-sm">
          Ряд
          <input
            type="text"
            value={form.row}
            onChange={update('row')}
            className="mt-1 w-full rounded border border-gray-300 px-2 py-1.5"
          />
        </label>
      </div>

      <label className="block text-sm">
        Тип
        <select
          value={form.type}
          onChange={update('type')}
          className="mt-1 w-full rounded border border-gray-300 px-2 py-1.5"
        >
          {TYPE_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </label>

      <label className="block text-sm">
        Описание
        <textarea
          value={form.description}
          onChange={update('description')}
          rows={2}
          className="mt-1 w-full rounded border border-gray-300 px-2 py-1.5"
        />
      </label>

      <div className="flex justify-end gap-2 pt-1">
        <button
          type="button"
          onClick={onCancel}
          className="rounded px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100"
        >
          Отмена
        </button>
        <button
          type="submit"
          className="rounded bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700"
        >
          Сохранить
        </button>
      </div>
    </form>
  )
}

export default EditorPanel
