import React, { useMemo } from "react";
import hljs from "highlight.js/lib/core";
import bash from "highlight.js/lib/languages/bash";
import csharp from "highlight.js/lib/languages/csharp";
import go from "highlight.js/lib/languages/go";
import java from "highlight.js/lib/languages/java";
import javascript from "highlight.js/lib/languages/javascript";
import kotlin from "highlight.js/lib/languages/kotlin";
import php from "highlight.js/lib/languages/php";
import python from "highlight.js/lib/languages/python";
import ruby from "highlight.js/lib/languages/ruby";
import rust from "highlight.js/lib/languages/rust";
import swift from "highlight.js/lib/languages/swift";
import typescript from "highlight.js/lib/languages/typescript";

hljs.registerLanguage("bash", bash);
hljs.registerLanguage("csharp", csharp);
hljs.registerLanguage("go", go);
hljs.registerLanguage("java", java);
hljs.registerLanguage("javascript", javascript);
hljs.registerLanguage("kotlin", kotlin);
hljs.registerLanguage("php", php);
hljs.registerLanguage("python", python);
hljs.registerLanguage("ruby", ruby);
hljs.registerLanguage("rust", rust);
hljs.registerLanguage("swift", swift);
hljs.registerLanguage("typescript", typescript);

const LANGUAGE_ALIASES = {
    curl: "bash",
    java: "java",
    kotlin: "kotlin",
    go: "go",
    rust: "rust",
    "C#": "csharp",
    python: "python",
    javascript: "javascript",
    typescript: "typescript",
    PHP: "php",
    ruby: "ruby",
    swift: "swift",
};

const highlightCode = (language, code) => {
    const hlLanguage = LANGUAGE_ALIASES[language] || language;

    try {
        if (hljs.getLanguage(hlLanguage)) {
            return hljs.highlight(code, { language: hlLanguage }).value;
        }
    } catch (e) {
        // fall through to auto-detect
    }

    return hljs.highlightAuto(code).value;
};

const CodeHighlight = ({ language, children, className }) => {
    const code = children || "";
    const html = useMemo(() => highlightCode(language, code), [language, code]);

    return (
        <pre className={className}>
            <code className="hljs" dangerouslySetInnerHTML={{ __html: html }} />
        </pre>
    );
};

export default CodeHighlight;
