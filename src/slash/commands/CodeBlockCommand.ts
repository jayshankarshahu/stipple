import { createCodeBlockCommand } from '@milkdown/kit/preset/commonmark'
import { commandsCtx } from '@milkdown/kit/core'
import type { Ctx } from '@milkdown/kit/ctx'
import type { ISlashCommand } from './ISlashCommand'

export class CodeBlockCommand implements ISlashCommand {
  readonly slug = 'code'
  readonly label = 'Code Block'
  readonly icon = '<>'
  readonly description = 'Insert a fenced code block'

  execute(ctx: Ctx) {
    ctx.get(commandsCtx).call(createCodeBlockCommand.key)
  }
}
