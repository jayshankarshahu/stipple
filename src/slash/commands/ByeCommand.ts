import type { ISlashCommand } from './ISlashCommand'
import type { Ctx } from '@milkdown/kit/ctx'
import { saveStateManager } from '../../state'

export class ByeCommand implements ISlashCommand {
  readonly slug = 'bye'
  readonly label = 'Bye'
  readonly icon = '👋'
  readonly description = 'Close the editor'

  async execute(_ctx: Ctx): Promise<void> {
    await saveStateManager.waitForSaved()
    window.close()
  }
}