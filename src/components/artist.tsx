"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export default function Artist() {
  const [songId, setSongId] = useState("");
  const [file, setFile] = useState<File | null>(null);

  const handleSubmit = async () => {
    if (!songId || !file) {
      alert("Please provide both song ID and file.");
      return;
    }

    const formData = new FormData();
    formData.append("song_id", songId);
    formData.append("file", file);

    try {
      const response = await fetch("http://127.0.0.1:8888/upload", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        alert("Upload successful!");
      } else {
        alert("Upload failed.");
      }
    } catch (error) {
      console.error(error);
      alert("An error occurred during upload.");
    }
  };

  return (
    <>
      <h1>Artist-Page</h1>
      <div className="grid w-full max-w-sm items-center gap-3">
        <h2>song_id</h2>
        <Input
          id="text"
          type="text"
          value={songId}
          onChange={(e) => setSongId(e.target.value)}
        />

        <Input
          id="file"
          type="file"
          onChange={(e) => {
            if (e.target.files) setFile(e.target.files[0]);
          }}
        />

        <Button variant="outline" onClick={handleSubmit}>
          Submit
        </Button>
      </div>
    </>
  );
}
