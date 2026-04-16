import { command_interface, command_context, command_metadata } from '../base/command_interface';
import config from './command_config.json';
import { insert_heading_command } from '../implementations/insert_heading_command';
import { insert_date_command } from '../implementations/insert_date_command';

type CommandConstructor = new (context: command_context) => command_interface;

const CLASS_MAP: Record<string, CommandConstructor> = {
    insert_heading_command,
    insert_date_command,
};

export class CommandRegistry {
    list_commands(): (command_metadata & { slug: string })[] {
        const metadataList: (command_metadata & { slug: string })[] = [];

        for (const [slug, data] of Object.entries(config)) {
            metadataList.push({
                slug,
                name: data.name,
                description: data.description,
                class: data.class,
            });
        }

        return metadataList;
    }

    get_command(slug: string, context: command_context): command_interface {
        const data = (config as any)[slug];
        if (!data) {
            throw new Error(`Command slug not found in config: ${slug}`);
        }

        const className = data.class;
        const CommandClass = CLASS_MAP[className];

        if (!CommandClass) {
            throw new Error(`Command class not found in map: ${className}`);
        }

        return new CommandClass(context);
    }
}

export const registry = new CommandRegistry();
