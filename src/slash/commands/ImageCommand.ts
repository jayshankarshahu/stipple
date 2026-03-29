import type { ISlashCommand } from './ISlashCommand'
import type { Ctx } from '@milkdown/kit/ctx'

// Marker — actual execution is handled by SlashMenu after URL input
export class ImageCommand implements ISlashCommand {
  readonly slug = 'image'
  readonly label = 'Image'
  readonly icon = '🖼'
  readonly description = 'Insert an image from a URL'

  // Called by SlashMenu after the user provides a URL
  execute(_ctx: Ctx) {
    // no-op: SlashMenu handles this via insertImage()
  }
}
