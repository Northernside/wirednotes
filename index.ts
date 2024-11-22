import fs from "node:fs";
import { Elysia } from "elysia";

import type { Note } from "./types";
import { initializeNotes } from "./misc/notes";
import { mdToHtml, mdToLiteHtml } from "./misc/markdown";

let notes: Note[] = initializeNotes();
let imagesCache: { [key: string]: Buffer } = {};

let homeHtml = fs.readFileSync("./html/home.html", "utf-8");
let baseHtml = fs.readFileSync("./html/base.html", "utf-8");
let notFoundHtml = fs.readFileSync("./html/404.html", "utf-8");

const cliArgs = process.argv.slice(2);
const router = new Elysia();

/* Home */
router.get("/", ({ set }) => {
    set.headers["Content-Type"] = "text/html";
    const notesPreview = notes.map((note) =>
        `
        <a href="/note/${note.url_name}" style="text-decoration: none;">
            <div class="note" published="${note.published}">
                <div class="preview-image" style="background: url(${note.meta_image});"></div>
                <div class="note-information">
                    <div class="title-container">
                        <h4>${note.title}</h4>
                        <span>(<span class="extended-date">published </span>${new Date(note.published).toLocaleDateString()})</span>
                    </div>
                    <p>${mdToLiteHtml(note.content.slice(0, 256))}...</p>
                </div>
            </div>
        </a>
        `
    ).join("");

    return homeHtml.replace("{{notes}}", notesPreview);
});


/* Note management */
router.get("/api/notes", ({ }) => notes);
router.get("/note/:name", ({ set, params, request }) => {
    set.headers["Content-Type"] = "text/html";
    const note = notes.find((note) => note.url_name === params.name);
    if (!note) { set.status = 404; return notFoundHtml; }

    return baseHtml
        .replace("{{title}}", note.title)
        .replace("{{meta_title}}", note.title)
        .replace(/{{meta_image}}/g, `https://notes.northernsi.de${note.meta_image}`)
        .replace("{{content}}", mdToHtml(note));
});

router.get("/media/:name", ({ set, params }) => {
    const folder = Bun.env.MEDIA_DIR ?? "./media";
    const filePath = `${folder}/${params.name}`;
    if (!fs.existsSync(filePath)) { set.status = 404; set.headers["Content-Type"] = "text/html"; return notFoundHtml; }

    set.headers["Content-Type"] = `image/${filePath.split(".").pop()}`;

    if (imagesCache[filePath]) return imagesCache[filePath];

    imagesCache[filePath] = fs.readFileSync(filePath);
    return imagesCache[filePath];
});

router.get("/*", ({ set }) => {
    set.status = 404;
    set.headers["Content-Type"] = "text/html";
    return notFoundHtml;
});

router.listen({
    hostname: Bun.env.HOSTNAME ?? "127.0.0.1",
    port: Bun.env.PORT ?? 3000,
});

if (cliArgs.includes("--watch")) {
    console.log("Watching for changes...");

    fs.watch("./notes", () => {
        console.log("Reloading notes...");
        notes = initializeNotes();
    });

    fs.watch("./media", () => {
        console.log("Reloading media...");
        imagesCache = {};
    });

    fs.watch("./html", () => {
        console.log("Reloading HTML...");
        homeHtml = fs.readFileSync("./html/home.html", "utf-8");
        baseHtml = fs.readFileSync("./html/base.html", "utf-8");
        notFoundHtml = fs.readFileSync("./html/404.html", "utf-8");
    });
}