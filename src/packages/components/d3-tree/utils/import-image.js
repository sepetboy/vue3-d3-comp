/**
 * imagesContext = import.meta.glob('@/assets/indicator-tree/full-screen/*', {
 *    eager: true
 * })
*/
export function parseImages(imagesContext){
  let images = {}
  const regex = /\/([^\/]*?)\.[^\/]*$/;
  for (const path in imagesContext) {
    const image = imagesContext[path].default;
    const match = regex.exec(path)
    if(match) {
      const key = match[1]
      images[key] = image;
    }
  }
  console.log("images", images)
  return images
}