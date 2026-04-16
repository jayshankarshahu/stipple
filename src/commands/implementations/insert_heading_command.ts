import { command_interface, command_context } from '../base/command_interface';

export class insert_heading_command implements command_interface {
    private context: command_context;

    constructor(context: command_context) {
        this.context = context;
    }

    execute(): void {
        this.context.replace_selection('# ');
    }
}
