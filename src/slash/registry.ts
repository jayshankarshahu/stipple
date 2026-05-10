import type { ISlashCommand } from './commands/ISlashCommand'
import { HeadingCommand } from './commands/HeadingCommand'
import { DividerCommand } from './commands/DividerCommand'
import { BulletListCommand } from './commands/BulletListCommand'
import { OrderedListCommand } from './commands/OrderedListCommand'
import { QuoteCommand } from './commands/QuoteCommand'
import { CodeBlockCommand } from './commands/CodeBlockCommand'

export const SLASH_COMMANDS: ISlashCommand[] = [
  new HeadingCommand(1),
  new HeadingCommand(2),
  new HeadingCommand(3),
  new BulletListCommand(),
  new OrderedListCommand(),
  new QuoteCommand(),
  new CodeBlockCommand(),
  new DividerCommand(),
]
