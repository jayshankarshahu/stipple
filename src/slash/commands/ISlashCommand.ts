import type { Ctx } from '@milkdown/kit/ctx'

export interface ISlashCommand {
  readonly slug: string
  readonly label: string
  readonly icon: string
  readonly description: string
  execute(ctx: Ctx): void | Promise<void>
}
