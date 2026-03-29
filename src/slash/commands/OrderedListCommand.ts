import { wrapInOrderedListCommand } from '@milkdown/kit/preset/commonmark'
import { commandsCtx } from '@milkdown/kit/core'
import type { Ctx } from '@milkdown/kit/ctx'
import type { ISlashCommand } from './ISlashCommand'

export class OrderedListCommand implements ISlashCommand {
  readonly slug = 'ordered-list'
  readonly label = 'Numbered List'
  readonly icon = '1.'
  readonly description = 'Insert a numbered list'

  execute(ctx: Ctx) {
    ctx.get(commandsCtx).call(wrapInOrderedListCommand.key)
  }
}
