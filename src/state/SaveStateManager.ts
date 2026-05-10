import type { SaveState } from './types'

type SaveStateListener = (state: SaveState) => void

class SaveStateManager extends EventTarget {
  private _state: SaveState = 'saved'

  get state(): SaveState {
    return this._state
  }

  setState(next: SaveState): void {
    if (next === this._state) return
    this._state = next
    this.dispatchEvent(new CustomEvent<SaveState>('change', { detail: next }))
  }

  // Subscribe to state changes. Returns an unsubscribe function.
  subscribe(listener: SaveStateListener): () => void {
    const handler = (e: Event) => listener((e as CustomEvent<SaveState>).detail)
    this.addEventListener('change', handler)
    return () => this.removeEventListener('change', handler)
  }

  // Returns a Promise that resolves when state reaches 'saved' or 'error'.
  // If already saved, resolves immediately.
  waitForSaved(timeoutMs = 5000): Promise<SaveState> {
    if (this._state === 'saved' || this._state === 'error') {
      return Promise.resolve(this._state)
    }
    return new Promise((resolve) => {
      let unsubscribe: () => void
      const timer = setTimeout(() => {
        unsubscribe()
        resolve('error') // timed out — treat as error, don't block forever
      }, timeoutMs)
      unsubscribe = this.subscribe((state) => {
        if (state === 'saved' || state === 'error') {
          clearTimeout(timer)
          unsubscribe()
          resolve(state)
        }
      })
    })
  }
}

// Singleton — one instance for the entire extension
export const saveStateManager = new SaveStateManager()
