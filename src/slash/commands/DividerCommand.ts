import { insertHrCommand } from '@milkdown/kit/preset/commonmark'
import { commandsCtx } from '@milkdown/kit/core'
import type { Ctx } from '@milkdown/kit/ctx'
import type { ISlashCommand } from './ISlashCommand'

export class DividerCommand implements ISlashCommand {
  readonly slug = 'divider'
  readonly label = 'Divider'
  readonly icon = '—'
  readonly description = 'Insert a horizontal rule'

  execute(ctx: Ctx) {
    ctx.get(commandsCtx).call(insertHrCommand.key)
  }
}
