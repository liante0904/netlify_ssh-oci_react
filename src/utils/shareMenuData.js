export function buildShareMenuData(report, shareUrl = report.shareUrl) {
  return {
    title: report.title,
    firm: report.firm,
    writer: report.writer,
    shareUrl,
  };
}
