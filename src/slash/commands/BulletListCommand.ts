import { wrapInBulletListCommand } from '@milkdown/kit/preset/commonmark'
import { commandsCtx } from '@milkdown/kit/core'
import type { Ctx } from '@milkdown/kit/ctx'
import type { ISlashCommand } from './ISlashCommand'

export class BulletListCommand implements ISlashCommand {
  readonly slug = 'bullet-list'
  readonly label = 'Bullet List'
  readonly icon = '•'
  readonly description = 'Insert a bulleted list'

  execute(ctx: Ctx) {
    ctx.get(commandsCtx).call(wrapInBulletListCommand.key)
  }
}
