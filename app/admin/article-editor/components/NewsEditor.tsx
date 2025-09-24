"use client";

import { Editor } from "@tinymce/tinymce-react";
import { useRef } from "react";

export default function NewsEditorFull() {
  const editorRef = useRef<any>(null);

  return (
    <Editor
      apiKey="yfffpxjyf0g4fx9jay81jkrvaoz54cv9cg78k2mkkhcg5716"
      onInit={(editor) => (editorRef.current = editor)}
      initialValue="<p>Введіть текст новини...</p>"
      init={{
        height: 600,
        menubar: "file edit view insert format tools table help",
        plugins: [
          "advlist", "autolink", "lists", "link", "image", "charmap", "preview",
          "anchor", "searchreplace", "visualblocks", "code", "fullscreen",
          "insertdatetime", "media", "table", "help", "wordcount",
          "emoticons", "autosave", "print", "pagebreak", "template"
        ],
        toolbar:
          "undo redo | blocks fontfamily fontsize | " +
          "bold italic underline strikethrough superscript subscript | " +
          "forecolor backcolor | alignleft aligncenter alignright alignjustify | " +
          "bullist numlist outdent indent | " +
          "link image media table emoticons charmap | " +
          "preview code fullscreen print | " +
          "insertdatetime template pagebreak removeformat",
        content_style:
          "body { font-family:Helvetica,Arial,sans-serif; font-size:14px; line-height:1.6 }",
      }}
    />
  );
}
