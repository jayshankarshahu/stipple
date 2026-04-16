import { command_interface, command_context } from '../base/command_interface';

export class insert_date_command implements command_interface {
    private context: command_context;

    constructor(context: command_context) {
        this.context = context;
    }

    execute(): void {
        const today = new Date();
        const options: Intl.DateTimeFormatOptions = {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        };
        const dateString = today.toLocaleDateString(undefined, options);
        this.context.replace_selection(dateString + ' ');
    }
}
