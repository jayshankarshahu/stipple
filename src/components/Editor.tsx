import React, { useEffect, useRef, useState } from 'react';
import { Editor as MilkdownEditor, rootCtx, defaultValueCtx } from '@milkdown/kit/core';
import { commonmark } from '@milkdown/kit/preset/commonmark';
import { history } from '@milkdown/kit/plugin/history';
import { listener, listenerCtx } from '@milkdown/kit/plugin/listener';
import { replaceAll } from '@milkdown/kit/utils';
import { nord } from '@milkdown/theme-nord';
import { slash, configureSlashPlugin } from '../commands/slash_plugin';
import '@milkdown/theme-nord/style.css';
import './Editor.css';

interface EditorProps {
    initialContent: string;
    noteId: string;
    onContentChange: (markdown: string) => void;
}

export const Editor: React.FC<EditorProps> = ({
    initialContent,
    noteId,
    onContentChange,
}) => {
    const editorRef = useRef<HTMLDivElement>(null);
    const editorInstanceRef = useRef<MilkdownEditor | null>(null);
    const onContentChangeRef = useRef(onContentChange);
    const currentMarkdownRef = useRef(initialContent || '');
    const [isEmpty, setIsEmpty] = useState(!initialContent?.trim());

    useEffect(() => {
        onContentChangeRef.current = onContentChange;
    }, [onContentChange]);

    useEffect(() => {
        if (!editorRef.current) return;

        if (editorInstanceRef.current) {
            editorInstanceRef.current.destroy();
            editorInstanceRef.current = null;
        }

        editorRef.current.innerHTML = '';
        currentMarkdownRef.current = initialContent || '';
        setIsEmpty(!initialContent?.trim());

        const createEditor = async () => {
            try {
                const editor = await MilkdownEditor.make()
                    .config(nord)
                    .config(configureSlashPlugin())
                    .config((ctx) => {
                        ctx.set(rootCtx, editorRef.current!);
                        ctx.set(defaultValueCtx, initialContent || '');
                        ctx.get(listenerCtx).markdownUpdated((_ctx, markdown) => {
                            currentMarkdownRef.current = markdown;
                            const empty = !markdown?.trim();
                            setIsEmpty(empty);
                            onContentChangeRef.current(markdown);
                        });
                    })
                    .use(commonmark)
                    .use(history)
                    .use(listener)
                    .use(slash as any)
                    .create();

                editorInstanceRef.current = editor;
            } catch (err) {
                console.error('Failed to create Milkdown editor:', err);
            }
        };

        createEditor();

        return () => {
            if (editorInstanceRef.current) {
                editorInstanceRef.current.destroy();
                editorInstanceRef.current = null;
            }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [noteId]);

    /**
     * Intercept paste events. When the clipboard contains plain text without HTML
     * (i.e., the user is pasting raw markdown from a text editor), we append the
     * pasted text to the current markdown content and use replaceAll() to let
     * Milkdown re-parse everything as markdown — rendering headings, bold, lists, etc.
     *
     * If the clipboard contains HTML (pasting from a browser or rich-text source),
     * we leave ProseMirror's default paste handler alone.
     */
    const handlePaste = (e: React.ClipboardEvent<HTMLDivElement>) => {
        const types = Array.from(e.clipboardData?.types ?? []);
        const hasHTML = types.includes('text/html');
        const text = e.clipboardData?.getData('text/plain') ?? '';

        // Only intercept when there's no HTML counterpart — raw markdown paste
        if (!text || hasHTML) return;

        e.preventDefault();
        e.stopPropagation();

        const editor = editorInstanceRef.current;
        if (!editor) return;

        // Append pasted text to whatever the editor currently contains
        const current = currentMarkdownRef.current.trimEnd();
        const merged = current ? `${current}\n\n${text}` : text;

        // replaceAll causes Milkdown to re-parse the whole string as markdown
        editor.action(replaceAll(merged));
    };

    return (
        <div className="editor-wrapper" onPaste={handlePaste}>
            {isEmpty && (
                <div className="editor-placeholder" aria-hidden="true">
                    Start writing your notes…
                </div>
            )}
            <div ref={editorRef} />
        </div>
    );
};
