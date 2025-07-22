// <원본 이미지 URL, 변환된 Blob URL> 형태로 저장하는 캐시 객체
const imageCache = new Map<string, string>();

/**
 * 이미지 URL을 받아 캐시된 Blob URL을 반환하거나,
 * 캐시에 없으면 새로 다운로드하여 Blob URL을 생성하고 캐시에 저장합니다.
 * @param src 원본 이미지 URL
 * @returns 로컬에서 접근 가능한 Blob URL
 */
export const getCachedImage = async (
  src: string | null | undefined
): Promise<string | null> => {
  if (!src) {
    return null;
  }

  // 1. 캐시에 이미 Blob URL이 있으면 즉시 반환 (네트워크 요청 없음)
  if (imageCache.has(src)) {
    return imageCache.get(src)!;
  }

  try {
    // 2. 캐시에 없으면 fetch API로 이미지를 다운로드
    const response = await fetch(src);
    if (!response.ok) {
      throw new Error("Image fetch failed");
    }
    const blob = await response.blob();

    // 3. 다운로드한 이미지 데이터(Blob)로 로컬 URL 생성
    const blobUrl = URL.createObjectURL(blob);

    // 4. 다음 사용을 위해 캐시에 저장
    imageCache.set(src, blobUrl);

    return blobUrl;
  } catch (error) {
    console.error("Failed to cache image:", src, error);
    return null; // 이미지 로딩 실패 시 null 반환
  }
};
