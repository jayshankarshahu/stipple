import { wrapInHeadingCommand } from '@milkdown/kit/preset/commonmark'
import { commandsCtx } from '@milkdown/kit/core'
import type { Ctx } from '@milkdown/kit/ctx'
import type { ISlashCommand } from './ISlashCommand'

export class HeadingCommand implements ISlashCommand {
  readonly slug: string
  readonly label: string
  readonly icon: string
  readonly description: string

  constructor(private level: 1 | 2 | 3) {
    this.slug = `heading${level}`
    this.label = `Heading ${level}`
    this.icon = ['H1', 'H2', 'H3'][level - 1]
    this.description = ['Large heading', 'Medium heading', 'Small heading'][level - 1]
  }

  execute(ctx: Ctx) {
    ctx.get(commandsCtx).call(wrapInHeadingCommand.key, this.level)
  }
}
