import React, { useRef, useState } from 'react';
import { Editor as MilkdownEditor, rootCtx, defaultValueCtx } from '@milkdown/kit/core';
import { commonmark } from '@milkdown/kit/preset/commonmark';
import { history } from '@milkdown/kit/plugin/history';
import { listener, listenerCtx } from '@milkdown/kit/plugin/listener';
import { replaceAll } from '@milkdown/kit/utils';
import { nord } from '@milkdown/theme-nord';
import { Milkdown, MilkdownProvider, useEditor, useInstance } from '@milkdown/react';
import { useSlash } from '../slash';
import { ProsemirrorAdapterProvider } from '@prosemirror-adapter/react';
import '@milkdown/theme-nord/style.css';
import './Editor.css';

interface EditorProps {
    initialContent: string;
    noteId: string;
    onContentChange: (markdown: string) => void;
}

interface EditorCoreProps {
    initialContent: string;
    onContentChange: (markdown: string) => void;
    onIsEmptyChange: (isEmpty: boolean) => void;
}

/**
 * EditorCore must live inside MilkdownProvider + ProsemirrorAdapterProvider.
 * It calls useEditor() to mount the Milkdown instance and useInstance() to
 * access the editor for the paste handler.
 *
 * Callbacks are stabilised via refs so the markdownUpdated listener never
 * captures a stale closure.
 */
const EditorCore: React.FC<EditorCoreProps> = ({
    initialContent,
    onContentChange,
    onIsEmptyChange,
}) => {
    const currentMarkdownRef = useRef(initialContent || '');
    const onContentChangeRef = useRef(onContentChange);
    const onIsEmptyChangeRef = useRef(onIsEmptyChange);

    // Always keep refs pointing at latest props — avoids stale closure in listener
    onContentChangeRef.current = onContentChange;
    onIsEmptyChangeRef.current = onIsEmptyChange;

    const [loading, getEditor] = useInstance();
    const slash = useSlash();

    useEditor((root) =>
        MilkdownEditor.make()
            .config(nord)
            .config((ctx) => {
                ctx.set(rootCtx, root);
                ctx.set(defaultValueCtx, initialContent || '');
                ctx.get(listenerCtx).markdownUpdated((_ctx, markdown) => {
                    currentMarkdownRef.current = markdown;
                    const empty = !markdown?.trim();
                    onIsEmptyChangeRef.current(empty);
                    onContentChangeRef.current(markdown);
                })
            })
            .config(slash.config)
            .use(commonmark)
            .use(history)
            .use(listener)
            .use(slash.plugin)
    );

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

        if (loading) return;
        const editor = getEditor();
        if (!editor) return;

        // Append pasted text to whatever the editor currently contains
        const current = currentMarkdownRef.current.trimEnd();
        const merged = current ? `${current}\n\n${text}` : text;

        // replaceAll causes Milkdown to re-parse the whole string as markdown
        editor.action(replaceAll(merged));
    };

    return (
        <div onPaste={handlePaste}>
            <Milkdown />
        </div>
    );
};

/**
 * Public Editor component. Owns the isEmpty state (for the placeholder) and
 * provides the MilkdownProvider + ProsemirrorAdapterProvider context required
 * by useEditor, useInstance, and — later — usePluginViewFactory (slash plugin).
 *
 * Remounting on noteId change is handled upstream: App.tsx passes key={currentNoteId}
 * on this component, so the entire provider tree is torn down and rebuilt fresh.
 */
export const Editor: React.FC<EditorProps> = ({
    initialContent,
    onContentChange,
}) => {
    const [isEmpty, setIsEmpty] = useState(!initialContent?.trim());

    return (
        <div className="editor-wrapper">
            {isEmpty && (
                <div className="editor-placeholder" aria-hidden="true">
                    Start writing your notes…
                </div>
            )}
            <MilkdownProvider>
                <ProsemirrorAdapterProvider>
                    <EditorCore
                        initialContent={initialContent}
                        onContentChange={onContentChange}
                        onIsEmptyChange={setIsEmpty}
                    />
                </ProsemirrorAdapterProvider>
            </MilkdownProvider>
        </div>
    );
};
