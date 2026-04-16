# How to Add New Slash Commands (Stipple Extension)

The slash command system in the Stipple extension operates on a highly decoupled architecture. The user interface (`@milkdown/plugin-slash`) is strictly separate from the command logic.

To add a new slash command (e.g., "Insert Table", "Mark as Task"), follow these **3 simple steps**:

---

## 1. Add the Command Configuration

Open the registry config file: `src/commands/registry/command_config.json`

Add a new key (this is the `slug` identifier) for your command. Include the user-facing `name`, `description`, and the exact `class` name you intend to use.

```json
{
  "heading": {
    "name": "Insert Heading",
    "description": "Adds a heading block",
    "class": "insert_heading_command"
  },
  "task": {
    "name": "To-Do List",
    "description": "Creates an interactive checkbox",
    "class": "insert_task_command"
  }
}
```

---

## 2. Create the Command Implementation Class

Create a new file in `src/commands/implementations/` with the exact same name as your class (e.g., `insert_task_command.ts`).

Implement the `command_interface`. Your logic should interact with the editor purely using the safe generic actions provided by the `command_context`.

```typescript
import { command_interface, command_context } from '../base/command_interface';

export class insert_task_command implements command_interface {
    private context: command_context;

    constructor(context: command_context) {
        this.context = context;
    }

    execute(): void {
        // Safe editor manipulation
        // replace_selection deletes the "/task" syntax and inserts your text, re-focusing
        this.context.replace_selection('[ ] ');
    }
}
```

### Available `command_context` Methods
- `insert_text(text: string)`: Inserts raw text exactly at the current cursor.
- `replace_selection(text: string)`: Automatically removes the `/query` characters the user typed, and inserts the target text seamlessly. Preferred for almost all commands.
- `get_content()`: Returns all text in the current block/document context.
- `set_content(content: string)`: Overwrites the entirety of the text block.
- `editor_instance`: The raw ProseMirror `EditorView` object, purely for highly advanced logic if the wrapper bounds are insufficient. 

---

## 3. Register the Class

Finally, open your registry map in `src/commands/registry/command_registry.ts` and add your new class so it is properly instantiated dynamically when a user activates it.

1. Import your class at the top.
2. Add it to the `CLASS_MAP` mapping.

```typescript
import { insert_heading_command } from '../implementations/insert_heading_command';
import { insert_date_command } from '../implementations/insert_date_command';
// 1. Add import
import { insert_task_command } from '../implementations/insert_task_command';

// ...

const CLASS_MAP: Record<string, CommandConstructor> = {
    insert_heading_command,
    insert_date_command,
    // 2. Map class identifier to definition
    insert_task_command, 
};
```

### Done! 🎉 
You do **not** need to touch `Editor.tsx` or `slash_plugin.ts`. The bridge handles automatic UI rendering, keyword filtering, and execution handling out-of-the-box. Just `npm run build` to see your changes applied instantly.
