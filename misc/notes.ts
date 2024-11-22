import fs from "node:fs";
import type { Note } from "../types";

export function initializeNotes(): Note[] {
    const folder = Bun.env.NOTES_DIR ?? "./notes";
    const files = fs.readdirSync(folder).filter((file) => file.endsWith(".md"));
    return files.map((file) => {
        const filePath = `${folder}/${file}`;
        const content = fs.readFileSync(filePath, "utf-8");
        const meta = getMedata(content);

        return {
            url_name: file.replace(/\.md$/, ""),
            title: content.match(/^# (.+)$/m)?.[1] ?? "Untitled",
            published: convertTime(meta.published) ?? 0,
            meta_image: meta.meta_image ?? "/media/meta.webp",
            content: content.replace(/<!--\r?\n([\s\S]+)\r?\n-->/, "") ?? "No content found",
        };
    }).sort((a, b) => b.published - a.published);
}

function getMedata(content: string): { [key: string]: string } {
    let meta = content.match(/<!--\r?\n([\s\S]+)\r?\n-->/)?.[1] ?? "";

    return meta.replaceAll("\r\n", "\n").split("\n").reduce((acc, line) => {
        const [key, value] = line.split(": ");
        acc[key] = value;
        return acc;
    }, {} as { [key: string]: string });
}

function convertTime(time: string): number {
    let [datePart, timePart] = time.split(" ");
    let [day, month, year] = datePart.split("/");
    let [hour, minute, second] = timePart.split(":");
    return new Date(+year, +month - 1, +day, +hour, +minute, +second).getTime();
}