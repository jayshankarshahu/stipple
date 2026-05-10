import { useEffect, useRef, useState } from 'react'
import { SlashProvider } from '@milkdown/kit/plugin/slash'
import { usePluginViewContext } from '@prosemirror-adapter/react'
import { useInstance } from '@milkdown/react'
import { SLASH_COMMANDS } from './registry'
import { keydownHandlerRef } from './index'
import './SlashMenu.css'

/**
 * Read the slash query from the current ProseMirror selection.
 * Returns null if the cursor is not in a slash-command context
 * (i.e. there is no '/' before the cursor in the current text block).
 */
function getSlashQuery(view: ReturnType<typeof usePluginViewContext>['view']): string | null {
  const { $from } = view.state.selection
  // Only consider inline/paragraph contexts — not code blocks, etc.
  if ($from.parent.type.spec.code) return null
  const textBefore = $from.parent.textBetween(0, $from.parentOffset, undefined, '\0')
  const slashIdx = textBefore.lastIndexOf('/')
  if (slashIdx === -1) return null
  // Ensure nothing before the slash (or only whitespace) — avoids mid-word '/'
  const beforeSlash = textBefore.slice(0, slashIdx)
  if (beforeSlash.length > 0 && !/\s$/.test(beforeSlash)) return null
  return textBefore.slice(slashIdx + 1)
}

export const SlashMenu = () => {
  const { view, prevState } = usePluginViewContext()
  const [loading, getEditor] = useInstance()
  const providerRef = useRef<SlashProvider | null>(null)
  const containerRef = useRef<HTMLDivElement>(null!)

  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)

  // Start-with priority filter on both label and slug
  const q = query.toLowerCase()
  const filtered = q
    ? SLASH_COMMANDS.filter(cmd =>
        cmd.label.toLowerCase().startsWith(q) ||
        cmd.slug.toLowerCase().startsWith(q) ||
        cmd.label.toLowerCase().includes(q)
      )
    : SLASH_COMMANDS

  // Create SlashProvider once (only for DOM positioning — NOT for open/close state)
  useEffect(() => {
    if (!containerRef.current || !view) return
    providerRef.current = new SlashProvider({
      content: containerRef.current,
      debounce: 50,
    })
    return () => {
      providerRef.current?.destroy()
      providerRef.current = null
    }
  }, [view])

  // On every ProseMirror update: derive open state and query directly from view.state.
  // This is more reliable than SlashProvider's onShow/onHide, which fires onHide as
  // soon as the user types any character after '/', collapsing the menu immediately.
  useEffect(() => {
    providerRef.current?.update(view, prevState)

    const slashQuery = getSlashQuery(view)
    const shouldBeOpen = slashQuery !== null && slashQuery.length <= 20

    if (shouldBeOpen) {
      if (!isOpen) {
        setIsOpen(true)
        setSelectedIndex(0)
      }
      if (slashQuery !== query) {
        setQuery(slashQuery)
        setSelectedIndex(0)
      }
      if (slashQuery.length > 3 && filtered.length === 0) {
        setIsOpen(false)
        keydownHandlerRef.current = null
      }
    } else if (isOpen) {
      setIsOpen(false)
      keydownHandlerRef.current = null
    }
  })

  // Auto-scroll selected item into view
  useEffect(() => {
    if (!isOpen || !containerRef.current) return
    const selectedItem = containerRef.current.querySelector('.slash-menu-item--selected')
    if (selectedItem) {
      selectedItem.scrollIntoView({ block: 'nearest' })
    }
  }, [selectedIndex, isOpen])

  const hide = () => {
    setIsOpen(false)
    keydownHandlerRef.current = null
    providerRef.current?.hide()
  }

  // Delete the '/' trigger + query text before executing a command
  const deleteSlashText = () => {
    const { state, dispatch } = view
    const { $from } = state.selection
    const textBefore = $from.parent.textBetween(0, $from.parentOffset, undefined, '\0')
    const slashIdx = textBefore.lastIndexOf('/')
    if (slashIdx !== -1) {
      const from = $from.start() + slashIdx
      const to = $from.pos
      dispatch(state.tr.delete(from, to))
    }
  }

  const runCommand = (idx: number) => {
    if (loading) return
    const cmd = filtered[idx]
    if (!cmd) return
    deleteSlashText()
    getEditor()?.action(ctx => cmd.execute(ctx))
    hide()
  }

  // Assign keydown handler on every render so it always closes over fresh state.
  // ProseMirror swallows arrow/enter/escape before they reach the DOM; this ref
  // bridges the gap via handleKeyDown in index.ts.
  keydownHandlerRef.current = (key: string) => {
    if (!isOpen) return false
    if (key === 'ArrowDown') {
      setSelectedIndex(i => (i + 1) % Math.max(filtered.length, 1))
      return true
    }
    if (key === 'ArrowUp') {
      setSelectedIndex(i => (i - 1 + Math.max(filtered.length, 1)) % Math.max(filtered.length, 1))
      return true
    }
    if (key === 'Enter') {
      runCommand(selectedIndex)
      return true
    }
    if (key === 'Escape') {
      hide()
      return true
    }
    return false
  }

  if (!isOpen) return <div ref={containerRef} style={{ display: 'none' }} />

  return (
    <div ref={containerRef} className="slash-menu-wrapper">
      <div className="slash-menu">
        {filtered.length === 0 ? (
          <div className="slash-menu-empty">No results for &ldquo;{query}&rdquo;</div>
        ) : (
          filtered.map((cmd, i) => (
            <div
              key={cmd.slug}
              className={`slash-menu-item ${i === selectedIndex ? 'slash-menu-item--selected' : ''}`}
              onMouseEnter={() => setSelectedIndex(i)}
              onMouseDown={e => { e.preventDefault(); runCommand(i) }}
            >
              <span className="slash-menu-icon" dangerouslySetInnerHTML={{ __html: cmd.icon }}></span>
              <div className="slash-menu-text">
                <span className="slash-menu-label">{cmd.label}</span>
                <span className="slash-menu-desc">{cmd.description}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
