export const handler = async (event) => {
  const { url, filename } = event.queryStringParameters;

  if (!url) {
    return { statusCode: 400, body: 'Missing URL parameter' };
  }

  const displayFilename = filename ? decodeURIComponent(filename) : 'report.pdf';

  try {
    const targetUrl = decodeURIComponent(url);
    const urlObj = new URL(targetUrl);
    const wr_id = urlObj.searchParams.get('wr_id');
    const bo_table = urlObj.searchParams.get('bo_table');
    const boardUrl = `https://www.ds-sec.co.kr/bbs/board.php?bo_table=${bo_table}&wr_id=${wr_id}`;

    const baseHeaders = {
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
      'Accept-Language': 'ko-KR,ko;q=0.9',
      'Connection': 'keep-alive',
    };

    console.log(`[Proxy] Step 1: Visiting ${boardUrl}`);
    const boardRes = await fetch(boardUrl, { headers: baseHeaders });
    
    const allCookies = boardRes.headers.getSetCookie 
      ? boardRes.headers.getSetCookie().join('; ') 
      : boardRes.headers.get('set-cookie') || '';

    console.log(`[Proxy] Step 2: Requesting download with cookies...`);

    const response = await fetch(targetUrl, {
      headers: {
        ...baseHeaders,
        'Referer': boardUrl,
        'Cookie': allCookies,
      }
    });

    const contentType = response.headers.get('content-type');
    const buffer = await response.arrayBuffer();

    if (contentType && contentType.includes('text/html')) {
      const htmlText = Buffer.from(buffer).toString('utf-8');
      
      if (htmlText.includes('alert(')) {
        const msg = htmlText.match(/alert\("([^"]+)"\)/)?.[1] || '알 수 없는 경고창';
        console.error(`[Proxy Error Message from Server]: ${msg}`);
      } else {
        console.log(`[Proxy HTML Body]: ${htmlText.substring(0, 500)}...`);
      }

      return {
        statusCode: 200,
        headers: { 'Content-Type': 'text/html; charset=utf-8' },
        body: htmlText,
      };
    }

    console.log(`[Proxy Success] Serving PDF with filename: ${displayFilename}`);
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="${encodeURIComponent(displayFilename)}"`,
        'X-Content-Type-Options': 'nosniff',
      },
      body: Buffer.from(buffer).toString('base64'),
      isBase64Encoded: true,
    };
  } catch (error) {
    console.error('[Proxy Exception]:', error);
    return { statusCode: 500, body: error.message };
  }
};
