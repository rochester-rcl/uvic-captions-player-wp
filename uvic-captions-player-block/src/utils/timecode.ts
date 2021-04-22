export default function toTimecode(currentTime: number): string {
  const hours = Math.floor(currentTime / 3600);
  const minutes = Math.floor(currentTime / 60);
  const seconds = Math.floor(currentTime - hours * 3600 - minutes * 60);

  const timecodeParts = [hours, minutes, seconds];

  const formatted = timecodeParts.map(time => {
    if (time < 10) {
      return `0${time}`;
    }
    return time.toString();
  });
  return formatted.join(":");
}
