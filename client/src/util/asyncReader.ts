import { fromByteArray } from "base64-js";

export async function readFileAsBase64(file: File): Promise<string> {
    const resultBuffer = await new Promise<ArrayBuffer>((resolve) => {
        const reader = new FileReader();
        reader.addEventListener("load", () =>
            resolve(reader.result as ArrayBuffer)
        );
        reader.readAsArrayBuffer(file);
    });
    return fromByteArray(new Uint8Array(resultBuffer))
        .replaceAll("+", "-")
        .replaceAll("/", "_");
}
