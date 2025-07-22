const preloadedImages = new Set<string>();

/**
 * 이미지 URL을 받아 브라우저 캐시에 미리 다운로드합니다.
 * @param src 이미지 URL
 */
export const preloadImage = (src: string | null | undefined) => {
  if (!src || preloadedImages.has(src)) {
    return;
  }
  const img = new Image();
  img.src = src;
  preloadedImages.add(src);
};
