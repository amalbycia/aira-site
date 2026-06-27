import { useCallback, useRef, useState } from "react";
import { set, unset, useFormValue, type StringInputProps } from "sanity";

/**
 * Custom Studio input for the reel's `bunnyVideoId` field (Option C).
 *
 * The client picks a video file → it uploads DIRECTLY to Bunny Stream through
 * our server proxy (/api/upload-reel), and the returned video GUID is written
 * straight into this field. The client never sees Bunny, never copies an ID,
 * and stays entirely inside Sanity Studio.
 *
 * The underlying field is still a plain string (the Bunny GUID), so everything
 * downstream — GROQ queries, the site's reel components — is unchanged.
 */
export function BunnyVideoUpload(props: StringInputProps) {
  const { onChange, value, elementProps } = props;

  // Use the reel's title as the Bunny video title (falls back gracefully).
  const title = (useFormValue(["title"]) as string) || "Untitled reel";

  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const upload = useCallback(
    (file: File) => {
      setError(null);
      setUploading(true);
      setProgress(0);

      // XHR (not fetch) so we get real upload progress events.
      const xhr = new XMLHttpRequest();
      xhr.open(
        "POST",
        `/api/upload-reel?title=${encodeURIComponent(title)}`,
        true,
      );

      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          setProgress(Math.round((e.loaded / e.total) * 100));
        }
      };

      xhr.onload = () => {
        setUploading(false);
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const { guid } = JSON.parse(xhr.responseText);
            if (guid) {
              onChange(set(guid));
              setProgress(100);
              return;
            }
            setError("Upload finished but no video id was returned.");
          } catch {
            setError("Unexpected response from the server.");
          }
        } else {
          let msg = `Upload failed (${xhr.status}).`;
          try {
            const r = JSON.parse(xhr.responseText);
            if (r.error) msg = r.error;
          } catch {
            /* keep default */
          }
          setError(msg);
        }
      };

      xhr.onerror = () => {
        setUploading(false);
        setError("Network error during upload.");
      };

      // Send the raw file as the body (server forwards it to Bunny verbatim).
      xhr.setRequestHeader("content-type", "application/octet-stream");
      xhr.send(file);
    },
    [onChange, title],
  );

  const onPick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) upload(file);
    // Reset so picking the same file again re-triggers change.
    e.target.value = "";
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <input
        ref={fileRef}
        type="file"
        accept="video/*"
        onChange={onPick}
        style={{ display: "none" }}
      />

      {/* Primary action */}
      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          style={{
            cursor: uploading ? "default" : "pointer",
            padding: "0.6em 1.1em",
            borderRadius: 6,
            border: "1px solid #2276fc",
            background: uploading ? "#1a3a66" : "#2276fc",
            color: "#fff",
            fontSize: 13,
            fontWeight: 600,
          }}
        >
          {uploading
            ? `Uploading… ${progress}%`
            : value
              ? "Replace video"
              : "Upload reel video"}
        </button>

        {value && !uploading ? (
          <button
            type="button"
            onClick={() => {
              onChange(unset());
              setProgress(0);
              setError(null);
            }}
            style={{
              cursor: "pointer",
              padding: "0.6em 1em",
              borderRadius: 6,
              border: "1px solid #555",
              background: "transparent",
              color: "#bbb",
              fontSize: 13,
            }}
          >
            Remove
          </button>
        ) : null}
      </div>

      {/* Progress bar */}
      {uploading ? (
        <div
          style={{
            height: 6,
            borderRadius: 999,
            background: "#2a2a2a",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              height: "100%",
              width: `${progress}%`,
              background: "#2276fc",
              transition: "width 150ms ease",
            }}
          />
        </div>
      ) : null}

      {/* Success state */}
      {value && !uploading ? (
        <p style={{ margin: 0, fontSize: 12, color: "#3bd16f" }}>
          ✓ Video uploaded. It will be ready to play in a few minutes while it
          processes.
          <br />
          <span style={{ color: "#888" }}>Video ID: {value}</span>
        </p>
      ) : null}

      {/* Error state */}
      {error ? (
        <p style={{ margin: 0, fontSize: 12, color: "#ff6b6b" }}>{error}</p>
      ) : null}

      {/* The raw id field, read-only — shown only so it's never a mystery.
          Hidden visually if you prefer; kept minimal here. */}
      <input
        {...elementProps}
        readOnly
        value={value || ""}
        placeholder="No video uploaded yet"
        style={{
          fontSize: 12,
          padding: "0.5em 0.7em",
          borderRadius: 6,
          border: "1px solid #333",
          background: "#1b1b1b",
          color: "#777",
        }}
      />
    </div>
  );
}
