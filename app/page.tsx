'use client';

import { useEffect, useState } from 'react';
import { format } from 'date-fns';

export default function PortalPage() {
  const [clientId, setClientId] = useState('');
  const [clientSecret, setClientSecret] = useState('');
  const [result, setResult] = useState<null | {
    token: string;
    channel: string;
    exp: number;
    userName: string;
  }>(null);
  const [iframeOpen, setIframeOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showV2, setShowV2] = useState(false);

  const handleSubmit = async () => {
    if (clientId === clientSecret && clientSecret === 'v2') {
      console.log('show v2');
      setShowV2(true);
      return;
    }
    setLoading(true);
    const res = await fetch('/api/chat/token/anonymous', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ clientId, clientSecret }),
    });

    if (res.ok) {
      const data = await res.json();
      setResult({
        channel: data.channel_name,
        token: data.token,
        exp: data.exp,
        userName: data.user_name,
      });
    } else {
      alert('取得 token 失敗');
    }

    setLoading(false);
  };

  useEffect(() => {
    if (!showV2) return;
  
    const script = document.createElement('script');
    script.src = 'https://kufu-portal-demo.vercel.app/kufu-anonymous-chat.js';
    script.async = true;
  
    script.onload = () => {
      // 確保 KufuAnonymousChat 可用後再執行
      const win = window as { KufuAnonymousChat?: any };
      if (win.KufuAnonymousChat) {
        new win.KufuAnonymousChat({
          clientId: 'QPj9Ulfz96',
          apiBase: 'https://kufu-portal-demo.vercel.app',
        });
      } else {
        console.error('KufuAnonymousChat not found on window');
      }
    };
  
    document.body.appendChild(script);
  
    return () => {
      // 可選：清理 script
      document.body.removeChild(script);
    };
  }, [showV2]);

  const widgetOrigin = process.env.NEXT_PUBLIC_WIDGET_ORIGIN;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 py-8">
      <div className="w-full max-w-md bg-white shadow-md rounded-xl p-6 space-y-4">
        <h2 className="text-xl font-semibold text-gray-800">Kufu Portal 測試頁面</h2>
        <h3 className='text-gray-700'>第一步：取得 Token</h3>
        <p className="text-gray-700">
          請在下方輸入您在酷服平台申請的 client_id 與 client_secret，然後點擊「取得 Token」按鈕，模擬在您的網站後端與酷服請求 Kufu portal token 的流程。
        </p>
        <input
          type="text"
          placeholder="Kufu portal client id"
          className="w-full border rounded px-3 py-2 text-sm placeholder:text-gray-400 text-black"
          value={clientId}
          onChange={(e) => setClientId(e.target.value)}
        />
        <input
          type="password"
          placeholder="Kufu portal client secret"
          className="w-full border rounded px-3 py-2 text-sm placeholder:text-gray-400 text-black"
          value={clientSecret}
          onChange={(e) => setClientSecret(e.target.value)}
        />

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded disabled:opacity-50"
        >
          {loading ? '取得中...' : '取得 Token'}
        </button>

        {result && (
          <div className="text-sm text-gray-700 space-y-1 border-t pt-4">
            <p className='break-all whitespace-pre-wrap'><br/><strong>User Name:</strong> {result.userName}</p>
            <p className='break-all whitespace-pre-wrap'><br/><strong>Channel:</strong> {result.channel}</p>
            <p className='break-all whitespace-pre-wrap'><br/><strong>Token:</strong> {result.token}</p>
            <p className='break-all whitespace-pre-wrap'><br/><strong>Expires:</strong> {format(new Date(result.exp * 1000), 'yyyy-MM-dd HH:mm:ss')}</p>
            <button
              onClick={() => setIframeOpen(true)}
              className="mt-2 w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded"
            >
              開啟 Portal
            </button>
          </div>
        )}
      </div>

      {/* Iframe Floating Widget */}
      {
        showV2 && iframeOpen && result && (
          <div className="fixed bottom-4 right-4 w-[400px] h-[600px] border shadow-xl rounded-lg overflow-hidden z-50">
            <iframe
              src={`${widgetOrigin}/widget/portal?token=${result.token}&channel=${result.channel}&title=${encodeURIComponent('酷服 Portal Demo')}`}
              className="w-full h-full"
              frameBorder="0"
            />
          </div>
        )
      }
    </div>
  );
}
