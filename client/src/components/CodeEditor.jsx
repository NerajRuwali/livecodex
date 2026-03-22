import { useEffect, useState } from 'react';
import Editor from '@monaco-editor/react';

const CodeEditor = ({ code, language, onChange, isReadOnly }) => {
    const handleEditorChange = (value) => {
        if (!isReadOnly && onChange) {
            onChange(value);
        }
    };

    return (
        <div className="h-full w-full bg-[#1e1e1e] relative">
            <Editor
                height="100%"
                language={language}
                theme="vs-dark"
                value={code}
                onChange={handleEditorChange}
                options={{
                    readOnly: isReadOnly,
                    minimap: { enabled: false },
                    fontSize: 14,
                    fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', Consolas, monospace",
                    lineHeight: 24,
                    padding: { top: 16, bottom: 16 },
                    scrollBeyondLastLine: false,
                    smoothScrolling: true,
                    cursorBlinking: "smooth",
                    cursorSmoothCaretAnimation: "on",
                    formatOnPaste: true,
                    matchBrackets: "near",
                    wordWrap: "on"
                }}
            />
        </div>
    );
};

export default CodeEditor;
