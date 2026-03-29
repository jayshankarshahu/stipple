import { slashFactory } from '@milkdown/kit/plugin/slash'
import { usePluginViewFactory } from '@prosemirror-adapter/react'
import type { Ctx } from '@milkdown/kit/ctx'
import { SlashMenu } from './SlashMenu'

const slash = slashFactory('stippleSlash')

/**
 * Shared mutable ref written by SlashMenu on every render.
 * handleKeyDown delegates to it so ProseMirror-intercepted keys
 * actually reach SlashMenu's React state (selectedIndex, etc.).
 */
export const keydownHandlerRef: { current: ((key: string) => boolean) | null } = {
  current: null,
}

export const useSlash = () => {
  const pluginViewFactory = usePluginViewFactory()

  return {
    plugin: slash,
    config: (ctx: Ctx) => {
      ctx.set(slash.key, {
        props: {
          handleKeyDown: (_view: unknown, event: KeyboardEvent) => {
            // Note: ctx.get(slash.key) is our own config object — it has no .opened
            // property. Guard is handled inside keydownHandlerRef (returns false when closed).
            if (!['ArrowDown', 'ArrowUp', 'Enter', 'Escape'].includes(event.key)) return false
            return keydownHandlerRef.current?.(event.key) ?? false
          },
        },
        view: pluginViewFactory({ component: SlashMenu }),
      })
    },
  }
}
