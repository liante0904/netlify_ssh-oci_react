export const handler = async (event) => {
  const { id } = event.queryStringParameters;
  const BASE_URL = process.env.VITE_ORACLE_REST_API;
  const TABLE_NAME = process.env.VITE_TABLE_NAME;
  const SITE_URL = process.env.URL || 'https://ssh-oci.netlify.app';

  if (!id) {
    return {
      statusCode: 400,
      body: 'Missing report id',
    };
  }

  try {
    // 1. Oracle ATP API 호출 (리포트 단건 조회 가정 - report_id 파라미터 사용)
    const apiUrl = `${BASE_URL}/${TABLE_NAME}/search/?report_id=${id}`;
    const response = await fetch(apiUrl);
    const data = await response.json();

    const report = data.items && data.items.length > 0 ? data.items[0] : null;

    if (!report) {
      return {
        statusCode: 404,
        body: 'Report not found',
      };
    }

    const title = report.article_title || '증권사 리포트';
    const company = report.firm_nm || '증권사';
    const pdfUrl = report.telegram_url || report.download_url || report.attach_url || SITE_URL;
    
    // 증권사 로고 매칭 (추후 실제 로고 URL로 보강 필요)
    // 현재는 기본 아이콘을 사용하거나, 사이트의 기본 로고를 사용합니다.
    const logoUrl = `${SITE_URL}/assets/icons/android-icon-192x192.png`;

    // 2. HTML 응답 (카톡 크롤러용 OG 태그 포함)
    const html = `
      <!DOCTYPE html>
      <html lang="ko">
      <head>
        <meta charset="UTF-8">
        <meta property="og:title" content="[${company}] ${title}" />
        <meta property="og:description" content="클릭하여 리포트 원문을 확인하세요." />
        <meta property="og:image" content="${logoUrl}" />
        <meta property="og:type" content="article" />
        <meta property="og:url" content="${SITE_URL}/share?id=${id}" />
        
        <!-- 일반 사용자 리다이렉트 -->
        <script>
          window.location.href = "${pdfUrl}";
        </script>
        <title>${title}</title>
      </head>
      <body>
        리포트 페이지로 이동 중입니다...
      </body>
      </html>
    `;

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'text/html' },
      body: html,
    };
  } catch (error) {
    console.error('Error fetching report:', error);
    return {
      statusCode: 500,
      body: 'Internal Server Error',
    };
  }
};
