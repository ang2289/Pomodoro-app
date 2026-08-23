import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { QRCodeCanvas } from "qrcode.react";
import { Helmet } from "react-helmet-async";

export default function QRPage() {
  const { id } = useParams();
  const [data, setData] = useState("");

  useEffect(() => {
    if (!id) return;
    try {
      setData(atob(id));
    } catch {
      setData("");
    }
  }, [id]);

  const resolvedId = id ?? "";
  const url = `https://pomodoro-app-eight-rouge.vercel.app/qr/${resolvedId}`;

  return (
    <>
      <Helmet>
        <title>QR Code 分享</title>
        <meta property="og:title" content="QR Code 分享" />
        <meta property="og:description" content={data} />
        <meta property="og:url" content={url} />
        <meta property="og:image" content={`https://pomodoro-app-eight-rouge.vercel.app/api/qr-preview?id=${resolvedId}`} />
      </Helmet>

      <div style={{ textAlign: "center", padding: 40 }}>
        <h1>QR Code</h1>
        <QRCodeCanvas value={data} size={220} />
        <p>{data}</p>
      </div>
    </>
  );
}

