import { useEffect, useRef, useState } from 'react';

let pdfjsPromise;
async function getPdfjs() {
  if (!pdfjsPromise) {
    pdfjsPromise = import(/* @vite-ignore */ '/lib/pdfjs/build/pdf.mjs').then((pdfjs) => {
      pdfjs.GlobalWorkerOptions.workerSrc = '/lib/pdfjs/build/pdf.worker.mjs';
      return pdfjs;
    });
  }
  return pdfjsPromise;
}

export function usePdfDocument({ report, proxyUrl, bodyRef }) {
  const [loading, setLoading] = useState(true);
  const [pages, setPages] = useState([]);
  const [scale, setScale] = useState(1);
  const pageWidthRef = useRef(null);

  useEffect(() => {
    if (!report) return;
    setLoading(true);
    setPages([]);
    setScale(1);
    pageWidthRef.current = null;
  }, [report]);

  useEffect(() => {
    if (!proxyUrl) return undefined;
    let active = true;

    (async () => {
      try {
        const response = await fetch(proxyUrl);
        if (!response.ok || !active) return;
        const blob = await response.blob();
        if (!active) return;
        const pdfjs = await getPdfjs();
        const url = URL.createObjectURL(blob);
        const documentProxy = await pdfjs.getDocument({ url, cMapUrl: '/lib/pdfjs/web/cmaps/', cMapPacked: true }).promise;
        if (!active) {
          documentProxy.destroy();
          URL.revokeObjectURL(url);
          return;
        }

        const pageList = [];
        for (let pageNum = 1; pageNum <= documentProxy.numPages; pageNum += 1) {
          pageList.push({ pageNum, page: await documentProxy.getPage(pageNum) });
        }
        const pageWidth = pageList[0]?.page.getViewport({ scale: 1 }).width || 0;
        pageWidthRef.current = pageWidth;
        const containerWidth = bodyRef.current?.clientWidth || window.innerWidth;
        const nextScale = containerWidth > 0 && pageWidth > 0 ? containerWidth / pageWidth : 1;
        if (!active) {
          documentProxy.destroy();
          URL.revokeObjectURL(url);
          return;
        }
        setPages(pageList);
        setScale(nextScale);
        setLoading(false);
        URL.revokeObjectURL(url);
      } catch (error) {
        console.warn('[PDFViewer]', error);
        if (active) setLoading(false);
      }
    })();

    return () => { active = false; };
  }, [bodyRef, proxyUrl]);

  return { loading, pages, scale, setScale, pageWidthRef };
}
