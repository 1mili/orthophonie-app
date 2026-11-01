function toEmbedUrl(url: string): { type: "youtube" | "vimeo" | "file"; src: string } {
  const ytMatch = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/))([\w-]{11})/);
  if (ytMatch) {
    return { type: "youtube", src: `https://www.youtube-nocookie.com/embed/${ytMatch[1]}` };
  }

  const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
  if (vimeoMatch) {
    return { type: "vimeo", src: `https://player.vimeo.com/video/${vimeoMatch[1]}` };
  }

  return { type: "file", src: url };
}

export function VideoEmbed({ url }: { url: string }) {
  const embed = toEmbedUrl(url);

  if (embed.type === "file") {
    return (
      <video controls className="aspect-video w-full" src={embed.src} />
    );
  }

  return (
    <iframe
      src={embed.src}
      className="aspect-video w-full"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      allowFullScreen
      title="Vidéo de l'article"
    />
  );
}
