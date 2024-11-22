import type { Note } from "../types";

export function mdToHtml(note: Note): string {
  let md = note.content.replace(/\r\n/g, "\n");

  let html = md
    // Heading
    .replace(
      /^# (.+)$/gm,
      `<h1 style="margin-bottom: -25px;">$1</h1>
            <span style="color: gray;">published ${new Date(
              note.published
            ).toLocaleDateString()}</span>
            <img src="${
              note.meta_image
            }" alt="Meta image" style="width: 100%; height: auto; margin-top: 20px; border-radius: 10px;">
        `
    )
    .replace(/^## (.+)$/gm, "<h2>$1</h2>")
    .replace(/^### (.+)$/gm, "<h3>$1</h3>")
    .replace(/^#### (.+)$/gm, "<h4>$1</h4>")
    .replace(/^##### (.+)$/gm, "<h5>$1</h5>")
    .replace(/^###### (.+)$/gm, "<h6>$1</h6>")

    // Text formatting
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/~~(.+?)~~/g, "<del>$1</del>")
    .replace(/__(.+?)__/g, "<u>$1</u>")

    // Code blocks
    .replace(/```(.+?)\n([\s\S]+?)```/gm, "<pre><code>$2</code></pre>")
    .replace(/`(.+?)`/g, "<code>$1</code>")

    // Images and links
    .replace(
      /!\[(.+?)\]\((.+?)\)/g,
      '<div><img src="$2" alt="$1" style="width: 100%; height: auto; border-radius: 10px;"></div>'
    )
    .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2">$1</a>')

    // Quotes
    .replace(/^> (.+)$/gm, "<blockquote>$1</blockquote>")

    // Line breaks
    .replace(/---/g, "<hr>");

  // Nested lists (handling bullet and numeric points with indentation)
  html = html
    .replace(
      /^(\s*)[-*+] (.+)$/gm,
      (_: string, spaces: string, text: string) => {
        const depth = spaces.length / 2;
        return `${"<ul>".repeat(depth + 1)}<li>${text}</li>${"</ul>".repeat(
          depth + 1
        )}`;
      }
    )
    .replace(
      /^(\s*)(\d+)\. (.+)$/gm,
      (_: string, spaces: string, number: string, text: string) => {
        const depth = spaces.length / 2;
        return `${"<ol>".repeat(
          depth + 1
        )}<li value="${number}">${text.trim()}</li>${"</ol>".repeat(
          depth + 1
        )}`;
      }
    );

  // Wrap remaining lines in paragraphs
  html = html
    .split("\n")
    .map((line: string) => {
      if (!line.match(/^<\/?(ul|ol|li|h[1-6]|blockquote|pre|code|div)>/))
        return `<p>${line}</p>`;
      return line;
    })
    .join("");

  return html;
}

export function mdToLiteHtml(md: string): string {
  md = md.replace(/\r\n/g, "\n");

  return (
    md
      // Heading
      .replace(/^# (.+)$/gm, "<strong>$1</strong> ")
      .replace(/^## (.+)$/gm, "<strong>$1</strong> ")
      .replace(/^### (.+)$/gm, "<strong>$1</strong> ")
      .replace(/^#### (.+)$/gm, "<strong>$1</strong> ")
      .replace(/^##### (.+)$/gm, "<strong>$1</strong> ")
      .replace(/^###### (.+)$/gm, "<strong>$1</strong> ")

      // Text formatting
      .replace(/\*\*(.+?)\*\*/g, "$1")
      .replace(/\*(.+?)\*/g, "$1")
      .replace(/~~(.+?)~~/g, "$1")
      .replace(/__(.+?)__/g, "$1")

      // Code
      .replace(/```(.+?)\n(.+?)```/gs, "$2")
      .replace(/`(.+?)`/g, "$1")

      // Images and links
      .replace(/!\[(.+?)\]\((.+?)\)/g, " $1 ")
      .replace(/\[(.+?)\]\((.+?)\)/g, " $1 ")

      // Quotes
      .replace(/^> (.+)$/gm, "$1")

      .replace(/\n\n/g, "")
  );
}
