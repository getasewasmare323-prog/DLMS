export function getPlaylistItems(resource) {
  if (!Array.isArray(resource?.contentData?.playlistItems)) {
    return [];
  }

  return resource.contentData.playlistItems
    .filter((item) => item && item.filePath)
    .map((item, index) => ({
      itemId: item.itemId || `playlist-item-${index + 1}`,
      title: item.title || `Lesson ${index + 1}`,
      description: item.description || "",
      filePath: item.filePath,
      position:
        Number.isInteger(item.position) && item.position > 0
          ? item.position
          : index + 1,
    }))
    .sort((left, right) => left.position - right.position);
}

export function isPlaylistVideo(resource) {
  return (
    resource?.resourceType === "video" &&
    resource?.contentType === "playlist" &&
    getPlaylistItems(resource).length > 0
  );
}

export function getPrimaryVideoItem(resource) {
  return getPlaylistItems(resource)[0] || null;
}

export function getPreferredVideoPath(resource, itemId = null) {
  const playlistItems = getPlaylistItems(resource);

  if (playlistItems.length) {
    const selectedItem =
      playlistItems.find((item) => item.itemId === itemId) || playlistItems[0];
    return selectedItem?.filePath || resource?.filePath || "";
  }

  return resource?.filePath || "";
}
