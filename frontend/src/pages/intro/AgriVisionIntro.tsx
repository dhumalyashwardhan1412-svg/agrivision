import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sprout, Handshake, ChartNoAxesCombined, ArrowRight, LogIn, Compass } from 'lucide-react';
import GlyphPortal from '../../components/ui/glyph-portal';

const family = '"Glyph Portal Jakarta", Arial, sans-serif';
let fontLoad: Promise<void> | undefined;

export const AgriVisionIntro: React.FC = () => {
  const navigate = useNavigate();
  const [face, setFace] = useState<string | null>(null);

  useEffect(() => {
    let settled = false;
    const finish = (value: string) => {
      if (!settled) {
        settled = true;
        setFace(value);
      }
    };

    try {
      fontLoad ??= new FontFace(
        'Glyph Portal Jakarta',
        'url("https://cdn.21st.dev/assets/mirror/15/153fc85b70298beeb1d61a5f723331649e7f23bb77302a66e61cb3e2fbdb5e79.woff2")',
        { weight: '400 700 900' }
      )
        .load()
        .then((font) => {
          document.fonts.add(font);
        });

      const timeout = window.setTimeout(() => finish('Arial, sans-serif'), 1500);
      void fontLoad.then(
        () => finish(family),
        () => finish('Arial, sans-serif')
      );

      return () => {
        settled = true;
        clearTimeout(timeout);
      };
    } catch {
      finish('Arial, sans-serif');
    }
  }, []);

  return (
    <div
      data-agrivision-portal
      tabIndex={0}
      role="region"
      aria-label="AgriVision. Scroll to explore the smart agriculture ecosystem."
      style={{
        width: '100%',
        minHeight: '100svh',
        height: '100svh',
        overflowY: 'auto',
        overflowX: 'hidden',
        background: '#071f16',
        containerType: 'inline-size',
        fontFamily: face ?? 'Arial, sans-serif',
      }}
    >
      <style>{`
        [data-agrivision-portal] [data-gp-caption] {
          inset: calc(var(--gp-word-bottom, 50%) + 82px) 24px auto;
          justify-content: center;
        }
        [data-agrivision-portal] [data-gp-hint] {
          display: none;
        }
        [data-agrivision-portal] [data-gp-enter] {
          min-height: 48px;
          padding: 0 24px;
          gap: 16px;
          background: #0b3b2a;
          border: 1px solid #14573f;
          border-radius: 12px;
          color: #f8faf8;
          font-size: 14px;
          font-weight: 600;
          box-shadow: 0 4px 14px rgba(7, 31, 22, 0.45);
          transition: all 0.2s ease;
        }
        [data-agrivision-portal] [data-gp-enter]:hover {
          background: #14573f;
          border-color: #22c55e;
          box-shadow: 0 6px 20px rgba(34, 197, 94, 0.25);
          transform: translateY(-1px);
        }
        [data-agrivision-portal] [data-gp-enter]:focus-visible {
          outline: 2px solid #22c55e;
          outline-offset: 4px;
        }
        [data-agrivision-portal] [data-gp-touch-picker] {
          top: auto;
          bottom: 24px;
          left: 50%;
        }
        [data-agrivision-portal] [data-gp-select] {
          border-color: #14573f;
          border-radius: 8px;
          font-size: 13px;
          color: #071f16;
          background: #ffffff;
        }
        [data-agri-header] {
          position: absolute;
          inset: clamp(20px, 4vw, 44px) clamp(20px, 4.5vw, 56px) auto;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          z-index: 10;
        }
        [data-agri-logo] {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: clamp(20px, 2.5vw, 24px);
          font-weight: 800;
          letter-spacing: -0.04em;
          color: #071f16;
        }
        [data-agri-badge] {
          font-size: 12px;
          font-weight: 500;
          padding: 6px 14px;
          background: rgba(11, 59, 42, 0.08);
          border: 1px solid rgba(20, 87, 63, 0.15);
          border-radius: 20px;
          color: #0b3b2a;
          letter-spacing: 0.02em;
        }
        [data-agri-eyebrow] {
          position: absolute;
          inset: auto 24px calc(100% - var(--gp-word-top, 35%) + 28px);
          margin: 0;
          text-align: center;
          font-size: clamp(13px, 1.6vw, 15px);
          font-weight: 600;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: #14573f;
        }
        [data-agri-support] {
          position: absolute;
          inset: calc(var(--gp-word-bottom, 50%) + 24px) 24px auto;
          margin: 0;
          text-align: center;
          font-size: clamp(15px, 2vw, 18px);
          font-weight: 500;
          line-height: 1.4;
          color: #1e3a2f;
        }
        [data-agri-secondary] {
          position: absolute;
          inset: calc(var(--gp-word-bottom, 50%) + 52px) 24px auto;
          margin: 0;
          text-align: center;
          font-size: clamp(12px, 1.4vw, 14px);
          font-weight: 400;
          letter-spacing: 0.02em;
          color: #4a6b5d;
        }
        [data-agri-scroll] {
          position: absolute;
          inset: auto 24px 6%;
          text-align: center;
          color: #2e5947;
          font-size: 12px;
          font-weight: 500;
          letter-spacing: 0.04em;
        }
        @media (any-pointer: coarse) {
          [data-agri-scroll] {
            bottom: 12%;
          }
        }
        @container (max-width: 480px) {
          [data-agri-badge] {
            font-size: 11px;
            padding: 4px 10px;
          }
          [data-agri-eyebrow] {
            font-size: 11px;
            letter-spacing: 0.05em;
          }
          [data-agri-support] {
            font-size: 14px;
          }
          [data-agri-secondary] {
            display: none;
          }
          [data-agrivision-portal] [data-gp-caption] {
            top: calc(var(--gp-word-bottom, 50%) + 68px);
          }
        }
        @container (max-height: 520px) {
          [data-agri-header] {
            top: 14px;
          }
          [data-agri-support] {
            top: calc(var(--gp-word-bottom, 50%) + 14px);
          }
          [data-agrivision-portal] [data-gp-caption] {
            top: calc(var(--gp-word-bottom, 50%) + 52px);
          }
          [data-agri-scroll] {
            display: none;
          }
        }
        [data-agrivision-portal] [data-gp-content] {
          padding: clamp(3rem, 6vw, 6rem) clamp(1.5rem, 5cqw, 4.5rem);
          font-family: inherit;
        }
        [data-agri-copy] {
          display: flex;
          width: min(100%, 76rem);
          margin: auto;
          flex-direction: column;
          align-items: flex-start;
          gap: clamp(2rem, 5svh, 3.5rem);
        }
        [data-agri-copy] h2 {
          max-width: 52rem;
          margin: 0;
          color: #f8faf8;
          font-size: clamp(2rem, 1.4rem + 2.2cqw, 3.25rem);
          font-weight: 800;
          line-height: 1.15;
          letter-spacing: -0.03em;
        }
        [data-agri-copy] [data-agri-desc] {
          max-width: 48rem;
          margin: 0;
          color: rgba(248, 250, 248, 0.85);
          font-size: clamp(1rem, 0.9rem + 0.5cqw, 1.25rem);
          line-height: 1.6;
        }
        [data-agri-features] {
          display: grid;
          width: 100%;
          grid-template-columns: 1fr;
          gap: 1.75rem;
        }
        [data-agri-feature] {
          background: rgba(11, 59, 42, 0.45);
          border: 1px solid rgba(34, 197, 94, 0.25);
          border-radius: 16px;
          padding: 1.75rem;
          backdrop-filter: blur(8px);
          transition: transform 0.2s ease, border-color 0.2s ease;
        }
        [data-agri-feature]:hover {
          transform: translateY(-2px);
          border-color: rgba(34, 197, 94, 0.6);
        }
        [data-agri-feature-header] {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 0.85rem;
        }
        [data-agri-feature-icon] {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 40px;
          height: 40px;
          border-radius: 10px;
          background: rgba(34, 197, 94, 0.15);
          color: #22c55e;
        }
        [data-agri-feature] h3 {
          margin: 0;
          color: #f8faf8;
          font-size: 1.15rem;
          font-weight: 700;
          letter-spacing: -0.01em;
        }
        [data-agri-feature] p {
          margin: 0;
          color: rgba(248, 250, 248, 0.82);
          font-size: 0.95rem;
          line-height: 1.55;
        }
        [data-agri-no] {
          display: inline-block;
          margin-right: 0.5rem;
          color: #22c55e;
          font: 600 0.85rem ui-monospace, monospace;
        }
        [data-agri-cta-group] {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 1rem;
          margin-top: 1.5rem;
        }
        @container (min-width: 768px) {
          [data-agri-features] {
            grid-template-columns: repeat(3, minmax(0, 1fr));
            gap: 2rem;
          }
        }
      `}</style>

      <GlyphPortal
        word="AGRIVISION"
        scrollLength={2.4}
        interactive={true}
        annotations={false}
        enterLabel="Enter AgriVision"
        fontFamily={face ?? 'Arial, sans-serif'}
        fontWeight={900}
        style={{ fontFamily: face ?? 'Arial, sans-serif' }}
        background={
          <div
            style={{
              position: 'absolute',
              inset: 0,
              transform: 'scale(var(--gp-field-scale, 1))',
              background:
                'radial-gradient(circle at 18% 8%, rgba(34, 197, 94, 0.45), transparent 38%), radial-gradient(circle at 82% 20%, rgba(20, 87, 63, 0.5), transparent 30%), radial-gradient(circle at 48% 78%, rgba(7, 31, 22, 0.9), transparent 50%), linear-gradient(135deg, #071f16 0%, #0b3b2a 45%, #14573f 80%, #061a12 100%)',
            }}
          />
        }
        front={
          <>
            <header data-agri-header>
              <div data-agri-logo>
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 10,
                    background: '#0b3b2a',
                    border: '1px solid #14573f',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#22c55e',
                    boxShadow: '0 2px 8px rgba(7, 31, 22, 0.2)',
                  }}
                >
                  <Sprout size={20} strokeWidth={2.4} />
                </div>
                <span>AgriVision</span>
              </div>
              <span data-agri-badge>Smart Agriculture Ecosystem</span>
            </header>

            <p data-agri-eyebrow>The Future of Farming Starts Here.</p>
            <p data-agri-support>Smart Farming. Connected Markets. Better Decisions.</p>
            <p data-agri-secondary>Grow Smarter. Sell Better. Earn More.</p>
            <span data-agri-scroll>Scroll to explore ↓</span>
          </>
        }
      >
        <div data-agri-copy>
          <div>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '6px 14px',
                borderRadius: 20,
                background: 'rgba(34, 197, 94, 0.15)',
                border: '1px solid rgba(34, 197, 94, 0.35)',
                color: '#4ade80',
                fontSize: 13,
                fontWeight: 600,
                marginBottom: 16,
              }}
            >
              <Sprout size={16} />
              <span>Next-Generation Agriculture</span>
            </div>
            <h2>One Platform. A Smarter Agricultural Future.</h2>
            <p data-agri-desc style={{ marginTop: '1rem' }}>
              AgriVision connects farmers, buyers and agricultural dealers through smart farming
              tools, direct markets, intelligent insights and transparent digital commerce.
            </p>
          </div>

          <div data-agri-features>
            <div data-agri-feature>
              <div data-agri-feature-header>
                <div data-agri-feature-icon>
                  <Sprout size={22} strokeWidth={2.2} />
                </div>
                <h3>
                  <span data-agri-no>01</span>Farm Smarter
                </h3>
              </div>
              <p>
                AI crop doctor, yield predictions, weather intelligence, and personalized farming
                schedules to maximize output and crop health.
              </p>
            </div>

            <div data-agri-feature>
              <div data-agri-feature-header>
                <div data-agri-feature-icon>
                  <Handshake size={22} strokeWidth={2.2} />
                </div>
                <h3>
                  <span data-agri-no>02</span>Connect Directly
                </h3>
              </div>
              <p>
                Disintermediate agricultural supply chains with real-time bidding, counter-offers,
                fair pricing, and verified direct trade.
              </p>
            </div>

            <div data-agri-feature>
              <div data-agri-feature-header>
                <div data-agri-feature-icon>
                  <ChartNoAxesCombined size={22} strokeWidth={2.2} />
                </div>
                <h3>
                  <span data-agri-no>03</span>Decide Better
                </h3>
              </div>
              <p>
                Mandi price analytics, buyer demand forecasting, and inventory optimization for
                data-backed growth and sustainable farming.
              </p>
            </div>
          </div>

          <div data-agri-cta-group>
            <button
              type="button"
              onClick={() => navigate('/register')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 10,
                height: 48,
                padding: '0 26px',
                borderRadius: 12,
                background: '#22c55e',
                color: '#071f16',
                fontSize: 15,
                fontWeight: 700,
                border: 'none',
                cursor: 'pointer',
                boxShadow: '0 4px 14px rgba(34, 197, 94, 0.4)',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#16a34a';
                e.currentTarget.style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#22c55e';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <span>Get Started</span>
              <ArrowRight size={18} />
            </button>

            <button
              type="button"
              onClick={() => navigate('/login')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 10,
                height: 48,
                padding: '0 24px',
                borderRadius: 12,
                background: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.25)',
                color: '#f8faf8',
                fontSize: 15,
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.18)';
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.25)';
              }}
            >
              <LogIn size={18} />
              <span>Login</span>
            </button>

            <button
              type="button"
              onClick={() => navigate('/home')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 10,
                height: 48,
                padding: '0 24px',
                borderRadius: 12,
                background: 'transparent',
                border: '1px solid rgba(34, 197, 94, 0.4)',
                color: '#4ade80',
                fontSize: 15,
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(34, 197, 94, 0.12)';
                e.currentTarget.style.borderColor = '#22c55e';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.borderColor = 'rgba(34, 197, 94, 0.4)';
              }}
            >
              <Compass size={18} />
              <span>Explore Platform</span>
            </button>
          </div>
        </div>
      </GlyphPortal>
    </div>
  );
};

export default AgriVisionIntro;
