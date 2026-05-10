import { useEffect, useState } from 'react'
import { saveStateManager, type SaveState } from '../state'

export const useSaveState = (): SaveState => {
  const [state, setState] = useState<SaveState>(saveStateManager.state)

  useEffect(() => {
    // Sync in case state changed between render and effect
    setState(saveStateManager.state)
    return saveStateManager.subscribe(setState)
  }, [])

  return state
}
