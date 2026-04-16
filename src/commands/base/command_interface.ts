export type command_context = {
    editor_instance: any;
    get_content: () => string;
    set_content: (content: string) => void;
    insert_text: (text: string) => void;
    replace_selection: (text: string) => void;
};

export interface command_interface {
    execute(): void | Promise<void>;
}

export type command_metadata = {
    slug: string;
    name: string;
    description: string;
    class: string;
};
