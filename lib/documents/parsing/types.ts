export type ResumeFileKind = "pdf" | "docx";
export type ResumeUpload = { fileName: string; mimeType: string; sizeBytes: number; bytes: Uint8Array };
export type ParsedResume = { kind: ResumeFileKind; text: string; hash: string; sections: Array<{ title: string; content: string }>; durationMs: number };
export interface ResumeParser { kind: ResumeFileKind; parse(upload: ResumeUpload): Promise<string>; }
