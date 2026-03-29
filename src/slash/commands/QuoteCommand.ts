import { wrapInBlockquoteCommand } from '@milkdown/kit/preset/commonmark'
import { commandsCtx } from '@milkdown/kit/core'
import type { Ctx } from '@milkdown/kit/ctx'
import type { ISlashCommand } from './ISlashCommand'

export class QuoteCommand implements ISlashCommand {
  readonly slug = 'quote'
  readonly label = 'Quote'
  readonly icon = '"'
  readonly description = 'Insert a block quote'

  execute(ctx: Ctx) {
    ctx.get(commandsCtx).call(wrapInBlockquoteCommand.key)
  }
}
