const KEYS = {
  LAST_STORE: 'mallmap_last_store',
  EDITOR_DATA: 'mallmap_editor_data',
  EDITOR_AUTH: 'mallmap_editor_auth',
}

export function getLastStoreId() {
  return localStorage.getItem(KEYS.LAST_STORE)
}

export function setLastStoreId(id) {
  localStorage.setItem(KEYS.LAST_STORE, id)
}

export function getEditorData() {
  const raw = localStorage.getItem(KEYS.EDITOR_DATA)
  return raw ? JSON.parse(raw) : null
}

export function setEditorData(data) {
  localStorage.setItem(KEYS.EDITOR_DATA, JSON.stringify(data))
}

export function isEditorAuthed() {
  return sessionStorage.getItem(KEYS.EDITOR_AUTH) === '1'
}

export function setEditorAuthed() {
  sessionStorage.setItem(KEYS.EDITOR_AUTH, '1')
}
