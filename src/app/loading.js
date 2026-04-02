// src/app/loading.js
export default function Loading() {
  return (
    <div style={{
      position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
      backgroundColor: 'var(--background)', zIndex: 9999
    }}>
      <div className="glass-panel" style={{
        padding: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center'
      }}>
        <div className="apple-spinner">
          {[...Array(12)].map((_, i) => (
            <div key={i} className={`spinner-blade spinner-blade-${i + 1}`}></div>
          ))}
        </div>
      </div>
      <style>{`
        .apple-spinner {
          display: inline-block;
          width: 32px;
          height: 32px;
          position: relative;
        }
        .apple-spinner .spinner-blade {
          transform-origin: 16px 16px;
          animation: apple-spinner-anim 1.2s linear infinite;
        }
        .apple-spinner .spinner-blade:after {
          content: " ";
          display: block;
          position: absolute;
          top: 0px;
          left: 15px;
          width: 2px;
          height: 8px;
          border-radius: 20%;
          background: #888;
        }
        .spinner-blade-1 { transform: rotate(0deg); animation-delay: -1.1s; }
        .spinner-blade-2 { transform: rotate(30deg); animation-delay: -1s; }
        .spinner-blade-3 { transform: rotate(60deg); animation-delay: -0.9s; }
        .spinner-blade-4 { transform: rotate(90deg); animation-delay: -0.8s; }
        .spinner-blade-5 { transform: rotate(120deg); animation-delay: -0.7s; }
        .spinner-blade-6 { transform: rotate(150deg); animation-delay: -0.6s; }
        .spinner-blade-7 { transform: rotate(180deg); animation-delay: -0.5s; }
        .spinner-blade-8 { transform: rotate(210deg); animation-delay: -0.4s; }
        .spinner-blade-9 { transform: rotate(240deg); animation-delay: -0.3s; }
        .spinner-blade-10 { transform: rotate(270deg); animation-delay: -0.2s; }
        .spinner-blade-11 { transform: rotate(300deg); animation-delay: -0.1s; }
        .spinner-blade-12 { transform: rotate(330deg); animation-delay: 0s; }
        @keyframes apple-spinner-anim {
          0% { opacity: 1; }
          100% { opacity: 0; }
        }
      `}</style>
    </div>
  );
}
