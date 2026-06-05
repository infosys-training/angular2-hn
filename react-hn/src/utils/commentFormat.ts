export function formatCommentCount(count: number): string {
  if (count > 0) {
    return `${count} ${count === 1 ? 'comment' : 'comments'}`;
  }
  return 'discuss';
}
