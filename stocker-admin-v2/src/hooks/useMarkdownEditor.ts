import { useRef, useCallback } from 'react';

type MarkdownFormat = 'bold' | 'italic' | 'underline' | 'h1' | 'h2' | 'h3' | 'code' | 'link' | 'image' | 'quote' | 'list' | 'list-ol';

export const useMarkdownEditor = (
    content: string,
    setContent: (value: string) => void
) => {
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const insertFormat = useCallback((format: MarkdownFormat) => {
        const textarea = textareaRef.current;
        if (!textarea) return;

        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const selectedText = content.substring(start, end);
        let newText = '';
        let newCursorPos = start;

        switch (format) {
            case 'bold':
                newText = `**${selectedText || 'kalın metin'}**`;
                newCursorPos = end + 4; // text length + 2 * (** length)
                if (!selectedText) newCursorPos = start + 2;
                break;
            case 'italic':
                newText = `*${selectedText || 'italik metin'}*`;
                newCursorPos = end + 2;
                if (!selectedText) newCursorPos = start + 1;
                break;
            case 'underline':
                // Markdown doesn't natively support underline, usually handled via HTML or ignored. 
                // Using <u> tag for HTML support or ignoring. Let's strictly stick to MD generally, but HTML is often valid.
                newText = `<u>${selectedText || 'altı çizili'}</u>`;
                newCursorPos = end + 7;
                if (!selectedText) newCursorPos = start + 3;
                break;
            case 'h1':
                newText = `# ${selectedText || 'Başlık 1'}`;
                newCursorPos = end + 2;
                break;
            case 'h2':
                newText = `## ${selectedText || 'Başlık 2'}`;
                newCursorPos = end + 3;
                break;
            case 'h3':
                newText = `### ${selectedText || 'Başlık 3'}`;
                newCursorPos = end + 4;
                break;
            case 'code':
                newText = `\`\`\`\n${selectedText || 'kod bloğu'}\n\`\`\``;
                newCursorPos = end + 8;
                break;
            case 'quote':
                newText = `> ${selectedText || 'alıntı'}`;
                newCursorPos = end + 2;
                break;
            case 'list':
                newText = `- ${selectedText || 'liste öğesi'}`;
                newCursorPos = end + 2;
                break;
            case 'image':
                newText = `![${selectedText || 'resim açıklaması'}](https://ornek.com/resim.jpg)`;
                newCursorPos = start + 2;
                break;
            case 'link':
                newText = `[${selectedText || 'bağlantı metni'}](https://ornek.com)`;
                newCursorPos = start + 1;
                break;
            default:
                return;
        }

        const updatedContent = content.substring(0, start) + newText + content.substring(end);
        setContent(updatedContent);

        // Restore cursor position and focus
        setTimeout(() => {
            textarea.focus();
            textarea.setSelectionRange(
                selectedText ? start : newCursorPos,
                selectedText ? start + newText.length : newCursorPos
            );
        }, 0);
    }, [content, setContent]);

    return { textareaRef, insertFormat };
};
