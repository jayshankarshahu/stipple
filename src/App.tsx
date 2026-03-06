import React, { useState } from 'react';
import { useNotes } from './hooks/useNotes';
import { TopBar } from './components/TopBar';
import { BottomBar } from './components/BottomBar';
import { Editor } from './components/Editor';
import { TagsPanel } from './components/TagsPanel';
import './App.css';

const App: React.FC = () => {
    const {
        currentNote,
        currentNoteId,
        currentIndex,
        totalNotes,
        isLoading,
        allTags,
        goToPrev,
        goToNext,
        goToDate,
        saveContent,
        addTag,
        removeTag,
    } = useNotes();

    const [isTagsOpen, setIsTagsOpen] = useState(false);

    if (isLoading || !currentNote || !currentNoteId) {
        return (
            <div className="app">
                <div className="app__loading">
                    <div className="app__loading-spinner" />
                    <span>Loading...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="app">
            <div className="app__content">
                <TopBar
                    date={currentNote.date}
                    canGoPrev={currentIndex > 0}
                    canGoNext={currentIndex < totalNotes - 1}
                    onPrev={goToPrev}
                    onNext={goToNext}
                    onJumpToDate={goToDate}
                />

                <div className="app__editor-area">
                    <Editor
                        key={currentNoteId}
                        noteId={currentNoteId}
                        initialContent={currentNote.noteData}
                        onContentChange={saveContent}
                    />
                </div>

                {isTagsOpen && (
                    <TagsPanel
                        tags={currentNote.tags}
                        allTags={allTags}
                        onAddTag={addTag}
                        onRemoveTag={removeTag}
                    />
                )}

                <BottomBar
                    tagCount={currentNote.tags.length}
                    lastEdited={currentNote.lastEdited}
                    isTagsOpen={isTagsOpen}
                    onToggleTags={() => setIsTagsOpen((v) => !v)}
                />
            </div>
        </div>
    );
};

export default App;
