import { slashFactory, SlashProvider } from '@milkdown/plugin-slash';
import { Ctx } from '@milkdown/ctx';
import { EditorView } from '@milkdown/prose/view';
import { registry } from './registry/command_registry';
import { command_context } from './base/command_interface';

export const slash = slashFactory('stipple-slash');

export function configureSlashPlugin() {
    const menu = document.createElement('div');
    menu.className = 'slash-menu';
    // Initially hide
    menu.dataset.show = 'false';

    const provider: any = new SlashProvider({
        content: menu,
        shouldShow(view: EditorView): boolean {
            const currentTextBlockContent = provider.getContent(view);
            if (!currentTextBlockContent) return false;
            // Show if it ends with / followed by non-space characters
            const match = currentTextBlockContent.match(/\/[^\s]*$/);
            return !!match;
        },
    });

    let selectedIndex = 0;
    const commandsData = registry.list_commands();

    // We will update the menu items dynamically
    const updateMenu = (query: string, view: EditorView) => {
        const filtered = commandsData.filter(cmd =>
            cmd.name.toLowerCase().includes(query.toLowerCase()) ||
            cmd.slug.toLowerCase().includes(query.toLowerCase())
        );

        menu.innerHTML = '';
        if (filtered.length === 0) {
            const noRes = document.createElement('div');
            noRes.classList.add('slash-menu-empty');
            noRes.textContent = 'No commands match';
            menu.appendChild(noRes);
            return;
        }

        selectedIndex = Math.min(selectedIndex, filtered.length - 1);

        filtered.forEach((cmd, idx) => {
            const item = document.createElement('div');
            item.className = 'slash-menu-item';
            if (idx === selectedIndex) {
                item.classList.add('selected');
            }

            const title = document.createElement('div');
            title.className = 'slash-menu-title';
            title.textContent = cmd.name;

            const desc = document.createElement('div');
            desc.className = 'slash-menu-desc';
            desc.textContent = cmd.description;

            item.appendChild(title);
            item.appendChild(desc);

            item.onmousedown = (e) => {
                e.preventDefault();
                executeCommand(cmd.slug, query, view);
            };

            menu.appendChild(item);
        });
    };

    const createContext = (view: EditorView, query: string): command_context => {
        return {
            editor_instance: view,
            get_content: () => {
                const { from, to } = view.state.selection;
                return view.state.doc.textBetween(from, to, '\n');
            },
            set_content: (content: string) => {
                // not fully safe, just replace everything
                const tr = view.state.tr.replaceWith(0, view.state.doc.content.size, view.state.schema.text(content));
                view.dispatch(tr);
            },
            insert_text: (text: string) => {
                const { state } = view;
                const tr = state.tr.insertText(text);
                view.dispatch(tr);
            },
            replace_selection: (text: string) => {
                const { state } = view;
                const { from } = state.selection;
                // Delete the slash and query
                const tr = state.tr.delete(from - query.length - 1, from);
                tr.insertText(text);
                view.dispatch(tr);
                view.focus();
            }
        };
    };

    const executeCommand = (slug: string, query: string, view: EditorView) => {
        const context = createContext(view, query);
        const command = registry.get_command(slug, context);
        command.execute();
        provider.hide();
    };

    // We need to attach listeners to EditorView when provider shows/hides
    // We can do this tracking updates
    let isMenuOpen = false;
    let currentQuery = '';

    provider.onShow = () => {
        isMenuOpen = true;
        selectedIndex = 0;
    };

    provider.onHide = () => {
        isMenuOpen = false;
    };

    return (ctx: Ctx) => {
        ctx.set(slash.key as any, {
            view: (view: EditorView) => {

                // Track keydown for navigation
                const handleKeyDown = (e: KeyboardEvent) => {
                    if (!isMenuOpen) return false;

                    const match = provider.getContent(view)?.match(/\/([^\s]*)$/);
                    if (!match) {
                        provider.hide();
                        return false;
                    }
                    currentQuery = match[1] || '';
                    const filteredLength = commandsData.filter(cmd =>
                        cmd.name.toLowerCase().includes(currentQuery.toLowerCase()) ||
                        cmd.slug.toLowerCase().includes(currentQuery.toLowerCase())
                    ).length;

                    if (e.key === 'ArrowDown') {
                        e.preventDefault();
                        selectedIndex = (selectedIndex + 1) % filteredLength;
                        updateMenu(currentQuery, view);
                        return true;
                    }
                    if (e.key === 'ArrowUp') {
                        e.preventDefault();
                        selectedIndex = (selectedIndex - 1 + filteredLength) % filteredLength;
                        updateMenu(currentQuery, view);
                        return true;
                    }
                    if (e.key === 'Enter') {
                        e.preventDefault();
                        const filtered = commandsData.filter(cmd =>
                            cmd.name.toLowerCase().includes(currentQuery.toLowerCase()) ||
                            cmd.slug.toLowerCase().includes(currentQuery.toLowerCase())
                        );
                        if (filtered[selectedIndex]) {
                            executeCommand(filtered[selectedIndex].slug, currentQuery, view);
                        }
                        return true;
                    }
                    if (e.key === 'Escape') {
                        e.preventDefault();
                        provider.hide();
                        return true;
                    }
                    return false;
                };

                // Inject event listener
                const wrapper = {
                    update: (view: EditorView) => {
                        provider.update(view);
                        const content = provider.getContent(view);
                        const match = content ? content.match(/\/[^\s]*$/) : null;
                        if (match) {
                            currentQuery = match[0].slice(1);
                            updateMenu(currentQuery, view);
                        }
                    },
                    destroy: () => {
                        provider.destroy();
                    }
                };

                // Add keydown listener to ProseMirror DOM
                view.dom.addEventListener('keydown', handleKeyDown);

                return {
                    update: wrapper.update,
                    destroy: () => {
                        view.dom.removeEventListener('keydown', handleKeyDown);
                        wrapper.destroy();
                    }
                };
            },
        });
    };
}
