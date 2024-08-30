export const COLOR_MAP: Record<any, any> = {
  "1": "blue",
  "2": "green",
  "3": "red",
  "4": "yellow",
  "5": "orange",
  "6": "gray",
};

export function parseImages(imagesContext: any) {
  let images: any = {};
  const regex = /\/([^\/]*?)\.[^\/]*$/;
  for (const path in imagesContext) {
    const image = imagesContext[path].default;
    const match = regex.exec(path);
    if (match) {
      const key = match[1];
      images[key] = image;
    }
  }
  console.log("images", images);
  return images;
}

const imagesContext = import.meta.glob("@/assets/modal/legend/*", {
  // eager: true,
});
export const images = parseImages(imagesContext);
