/*
 * Glyph Portal component
 * Original author: Christian Katzmann (@Legacy)
 * Source: 21st.dev
 * License: MIT
 */

import React, { useId, useRef, useLayoutEffect } from 'react';

export interface GlyphPortalProps {
  word?: string;
  focusChar?: string;
  interactive?: boolean;
  background?: React.ReactNode;
  front?: React.ReactNode;
  children?: React.ReactNode;
  scrollLength?: number;
  fontFamily?: string;
  fontWeight?: number | string;
  annotations?: boolean;
  enterLabel?: string;
  className?: string;
  style?: React.CSSProperties;
  onProgress?: (progress: number) => void;
}

const DEFAULT_FALLBACK_FONT = '"Arial Black", "Arial", sans-serif';

function clamp(val: number, min: number = 0, max: number = 1): number {
  return Math.min(max, Math.max(min, val));
}

function smooth(min: number, max: number, val: number): number {
  const h = clamp((val - min) / (max - min), 0, 1);
  return h * h * (3 - 2 * h);
}

interface InscribedCircle {
  x: number;
  y: number;
  radius: number;
}

function interior(ctx: CanvasRenderingContext2D, char: string, font: string): InscribedCircle | null {
  const canvas = ctx.canvas;
  ctx.font = font;
  const metrics = ctx.measureText(char);
  const pad = 8;
  const boxLeft = Math.ceil(metrics.actualBoundingBoxLeft);
  const boxAscent = Math.ceil(metrics.actualBoundingBoxAscent);
  canvas.width = Math.max(1, Math.ceil(metrics.actualBoundingBoxLeft + metrics.actualBoundingBoxRight) + pad * 2);
  canvas.height = Math.max(1, Math.ceil(metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent) + pad * 2);
  ctx.font = font;
  ctx.fontKerning = 'none';
  ctx.fillText(char, pad + boxLeft, pad + boxAscent);
  const { width: W, height: H } = canvas;
  const data = ctx.getImageData(0, 0, W, H).data;
  const rowBuffer = new Uint16Array(W + 1);
  let maxDist = 0;
  let bestX = 0;
  let bestY = 0;
  for (let y = 0; y < H; y++) {
    let leftDist = 0;
    for (let x = 0; x < W; x++) {
      const prevTop = rowBuffer[x + 1];
      rowBuffer[x + 1] = data[(y * W + x) * 4 + 3] > 245 ? Math.min(prevTop, rowBuffer[x], leftDist) + 1 : 0;
      leftDist = prevTop;
      if (rowBuffer[x + 1] > maxDist) {
        maxDist = rowBuffer[x + 1];
        bestX = x;
        bestY = y;
      }
    }
  }
  return maxDist < 3 ? null : {
    x: (bestX + 1 - maxDist / 2 - pad - boxLeft) / 3,
    y: (bestY + 1 - maxDist / 2 - pad - boxAscent) / 3,
    radius: (maxDist / 2 - 1) / 3,
  };
}

function scrollParent(el: HTMLElement): HTMLElement | null {
  for (let p = el.parentElement; p; p = p.parentElement) {
    if (/(auto|scroll|hidden)/.test(getComputedStyle(p).overflowY) && p !== document.body && p !== document.documentElement) {
      return p;
    }
  }
  return null;
}

export const GlyphPortal: React.FC<GlyphPortalProps> = ({
  word = 'SUBLIME',
  focusChar,
  interactive = true,
  background,
  front,
  children,
  scrollLength = 2.4,
  fontFamily = DEFAULT_FALLBACK_FONT,
  fontWeight = 900,
  annotations = false,
  enterLabel = 'Enter section',
  className,
  style,
  onProgress,
}) => {
  const baseId = useId().replace(/[^a-zA-Z0-9]/g, '');
  const id = `gp-${baseId}`;
  const clipId = `${id}-clip`;
  const containerRef = useRef<HTMLElement | null>(null);
  const onProgressRef = useRef(onProgress);

  useLayoutEffect(() => {
    onProgressRef.current = onProgress;
  }, [onProgress]);

  const text = word.trim().normalize('NFC') || 'SUBLIME';
  let charIdxOffset = 0;
  const charEntries = Array.from(text, (char) => {
    const idx = charIdxOffset;
    charIdxOffset += char.length;
    return { char, index: idx };
  });

  const parsedLength = Number.isFinite(scrollLength) ? clamp(scrollLength, 1, 8) : 2.4;
  const parsedWeight = Number.isFinite(fontWeight as number) ? clamp(fontWeight as number, 1, 1000) : 900;
  const hasFront = front != null;
  const scopeSelector = `:where(#${id})`;

  useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const pinEl = container.querySelector<HTMLElement>('[data-gp-pin]');
    const fieldEl = container.querySelector<HTMLElement>('[data-gp-field]');
    const artSvg = container.querySelector<SVGSVGElement>('[data-gp-art]');
    const clipEl = container.querySelector<SVGClipPathElement>(`#${clipId}`);
    const glyphText = container.querySelector<SVGTextElement>('[data-gp-glyph]');
    const marksG = container.querySelector<SVGGElement>('[data-gp-marks]');
    const choicesEl = container.querySelector<HTMLElement>('[data-gp-choices]');
    const letterButtons = Array.from(choicesEl?.querySelectorAll<HTMLButtonElement>('button') ?? []);
    const selectEl = container.querySelector<HTMLSelectElement>('[data-gp-select]');
    const scroller = scrollParent(container);
    const mediaReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const canvasCtx = document.createElement('canvas').getContext('2d', { willReadFrequently: true });

    let unmounted = false;
    let animFrameId = 0;
    let needsLayout = true;
    let isIntersecting = true;
    let inkReady = false;
    const startTime = performance.now();
    let frameReady = false;
    let fontTimedOut = false;
    let viewWidth = 1;
    let viewHeight = 1;
    let scrollSpan = 1;
    let fontScale = 1;
    let maxScale = 1;
    let centerOffset = { x: 0, y: 0 };
    let currentTarget: (InscribedCircle & { index: number }) | null = null;
    let lastProgress = -1;
    let targetCircles: Array<InscribedCircle & { index: number }> = [];
    let glyphMetrics: Array<{ index: number; x: number; y: number; width: number; height: number }> = [];
    let isInteractiveActive = false;
    let bbox = { x: 0, y: 0, width: 1, height: 1 };
    let firstInkRun = true;

    if (glyphText) {
      glyphText.style.fontFamily = fontFamily;
      const familyParts = getComputedStyle(glyphText).fontFamily.match(/(?:[^,"']+|"[^"]*"|'[^']*')+/g) ?? [];
      const validFamilies = familyParts.filter((fam) => {
        try {
          return document.fonts.check(`${parsedWeight} 100px ${fam.trim()}`, text);
        } catch {
          return false;
        }
      });
      glyphText.style.fontFamily = [...validFamilies, DEFAULT_FALLBACK_FONT].join(',');
      fontTimedOut = validFamilies.length < familyParts.length;
    }

    const readInk = (): boolean => {
      if (!canvasCtx || !glyphText) return false;
      const comp = getComputedStyle(glyphText);
      const largeFont = `${comp.fontWeight} 300px ${comp.fontFamily}`;
      canvasCtx.font = `${comp.fontWeight} 100px ${comp.fontFamily}`;
      canvasCtx.fontKerning = 'none';
      const metrics = canvasCtx.measureText(text);
      const xOffsets = Array.from({ length: text.length }, (_, i) => canvasCtx!.measureText(text.slice(0, i)).width);
      bbox = {
        x: -metrics.actualBoundingBoxLeft,
        y: -metrics.actualBoundingBoxAscent,
        width: metrics.actualBoundingBoxLeft + metrics.actualBoundingBoxRight,
        height: metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent,
      };
      if (!bbox.width || !bbox.height) return false;
      centerOffset = {
        x: bbox.x + bbox.width / 2,
        y: bbox.y + bbox.height / 2,
      };
      const focusIndex = focusChar ? text.indexOf(focusChar.normalize('NFC')) : -1;
      let charPos = 0;
      targetCircles = [];
      glyphMetrics = [];
      for (const char of Array.from(text)) {
        canvasCtx.font = `${comp.fontWeight} 100px ${comp.fontFamily}`;
        const m = canvasCtx.measureText(char);
        glyphMetrics.push({
          index: charPos,
          x: xOffsets[charPos] - m.actualBoundingBoxLeft,
          y: -m.actualBoundingBoxAscent,
          width: m.actualBoundingBoxLeft + m.actualBoundingBoxRight,
          height: m.actualBoundingBoxAscent + m.actualBoundingBoxDescent,
        });
        const circle = interior(canvasCtx, char, largeFont);
        if (circle) {
          targetCircles.push({
            ...circle,
            x: circle.x + xOffsets[charPos],
            index: charPos,
          });
        }
        charPos += char.length;
      }
      currentTarget =
        targetCircles.find((t) => t.index === focusIndex) ??
        [...targetCircles].sort((a, b) => b.radius - a.radius || Math.abs(a.x - centerOffset.x) - Math.abs(b.x - centerOffset.x))[0] ??
        null;
      return true;
    };

    const select = (target: (InscribedCircle & { index: number }) | null) => {
      currentTarget = target;
      maxScale = currentTarget ? Math.max(fontScale, Math.hypot(viewWidth, viewHeight) / (currentTarget.radius * 1.35)) : fontScale;
      container.dataset.gpFocus = currentTarget ? Array.from(text.slice(currentTarget.index))[0] : '';
      container.dataset.gpFocusIndex = String(currentTarget?.index ?? -1);

      for (const btn of letterButtons) {
        const isChecked = Number(btn.dataset.gpLetter) === currentTarget?.index;
        btn.disabled = !targetCircles.some((t) => t.index === Number(btn.dataset.gpLetter));
        btn.setAttribute('aria-checked', String(isChecked));
        btn.tabIndex = isChecked ? 0 : -1;
      }
      if (selectEl && selectEl.value !== '') {
        selectEl.value = String(currentTarget?.index ?? -1);
      }
      if (selectEl) {
        for (const opt of Array.from(selectEl.options)) {
          opt.disabled = opt.value === '' || !targetCircles.some((t) => t.index === Number(opt.value));
        }
      }
      const invScale = 1 / fontScale;
      const underLineY = bbox.y + bbox.height + 25 * invScale;
      const leftX = bbox.x;
      const rightX = leftX + bbox.width;
      const crossPath = currentTarget
        ? `M${currentTarget.x - 9 * invScale} ${currentTarget.y} h${18 * invScale} M${currentTarget.x} ${currentTarget.y - 9 * invScale} v${18 * invScale}`
        : '';
      const pathEl = marksG?.querySelector('path');
      if (pathEl) {
        pathEl.setAttribute(
          'd',
          `M${leftX} ${underLineY} H${rightX} M${leftX} ${underLineY - 5 * invScale} v${10 * invScale} M${rightX} ${underLineY - 5 * invScale} v${10 * invScale} ${crossPath}`
        );
        pathEl.setAttribute('stroke-width', String(invScale));
      }
    };

    const getPosition = (): number => {
      const top = scroller ? scroller.getBoundingClientRect().top + scroller.clientTop : 0;
      return clamp((top - container.getBoundingClientRect().top) / scrollSpan);
    };

    const paint = (progress: number) => {
      const isReduced = mediaReducedMotion.matches || !frameReady || fontTimedOut || !currentTarget;
      const p = isReduced ? 0 : progress;
      const normP = clamp(p / 0.78);
      const eased = normP < 0.5 ? 4 * normP ** 3 : 1 - (-2 * normP + 2) ** 3 / 2;
      const curScale = Math.exp(Math.log(fontScale) + Math.log(maxScale / fontScale) * eased);
      const scaleRatio = maxScale === fontScale ? 0 : (1 / curScale - 1 / fontScale) / (1 / maxScale - 1 / fontScale);
      const targetX = centerOffset.x + ((currentTarget?.x ?? centerOffset.x) - centerOffset.x) * scaleRatio;
      const targetY = centerOffset.y + ((currentTarget?.y ?? centerOffset.y) - centerOffset.y) * scaleRatio;
      const rotateDeg = -4 * smooth(0.06, 0.5, normP) * (1 - smooth(0.62, 0.92, normP));
      const marksTransform = `translate(${viewWidth / 2} ${viewHeight * 0.46 + viewHeight * 0.04 * eased}) scale(${curScale}) rotate(${rotateDeg}) translate(${-targetX} ${-targetY})`;
      const rad = (rotateDeg * Math.PI) / 180;
      const scaledHalfW = viewWidth / 2 / curScale;
      const scaledCenterH = (viewHeight * 0.46 + viewHeight * 0.04 * eased) / curScale;

      clipEl?.setAttribute('transform', `scale(${curScale}) rotate(${rotateDeg})`);
      glyphText?.setAttribute(
        'transform',
        `translate(${Math.cos(rad) * scaledHalfW + Math.sin(rad) * scaledCenterH - targetX} ${-Math.sin(rad) * scaledHalfW + Math.cos(rad) * scaledCenterH - targetY})`
      );
      if (marksG) {
        marksG.setAttribute('transform', marksTransform);
        marksG.style.opacity = String(1 - smooth(0.015, 0.17, p));
      }
      isInteractiveActive = interactive && !isReduced && p < 0.04;
      if (choicesEl) {
        (choicesEl as any).inert = !isInteractiveActive;
      }
      container.dataset.gpChoosing = String(isInteractiveActive);
      if (fieldEl) {
        fieldEl.style.clipPath = normP >= 1 ? 'none' : `url(#${clipId})`;
      }
      container.style.setProperty('--gp-caption', String(1 - smooth(0.01, 0.16, p)));
      container.style.setProperty('--gp-reveal', String(isReduced ? 1 : smooth(0.78, 0.9, p)));
      container.style.setProperty('--gp-field-scale', String(1 + 0.16 * smooth(0, 0.82, p)));
      container.style.setProperty('--gp-caption-hit', p < 0.08 ? 'auto' : 'none');
      container.dataset.gpEntered = String(p >= 0.9);
      container.dataset.gpProgress = p.toFixed(5);

      if (p !== lastProgress) {
        lastProgress = p;
        onProgressRef.current?.(p);
      }
    };

    const layout = () => {
      if (!container.clientWidth) return;
      viewWidth = pinEl?.clientWidth ?? container.clientWidth;
      const vp = container.querySelector<HTMLElement>('[data-gp-viewport]');
      const vpHeight = vp ? vp.offsetHeight : window.innerHeight;
      const containerHeight = Math.max(1, Math.min(scroller?.clientHeight ?? vpHeight, vpHeight));
      viewHeight = mediaReducedMotion.matches ? Math.min(containerHeight * 0.75, 480) : containerHeight;
      container.style.setProperty('--gp-height', `${viewHeight}px`);
      scrollSpan = viewHeight * parsedLength;
      artSvg?.setAttribute('viewBox', `0 0 ${viewWidth} ${viewHeight}`);

      if (firstInkRun) {
        inkReady = readInk();
        firstInkRun = false;
      }
      if (!inkReady) return;

      const targetHeight =
        hasFront && viewHeight < 480 ? Math.min(viewHeight * 0.38, Math.max(24, viewHeight - 264)) : viewHeight * 0.38;
      fontScale = Math.min((viewWidth * 0.84) / bbox.width, targetHeight / bbox.height);
      select(currentTarget);

      for (const btn of letterButtons) {
        const metric = glyphMetrics.find((m) => m.index === Number(btn.dataset.gpLetter));
        if (metric) {
          Object.assign(btn.style, {
            left: `${viewWidth / 2 + (metric.x - centerOffset.x) * fontScale}px`,
            top: `${viewHeight * 0.46 + (metric.y - centerOffset.y) * fontScale - Math.max(0, 44 - metric.height * fontScale) / 2}px`,
            width: `${Math.max(1, metric.width * fontScale)}px`,
            height: `${Math.max(44, metric.height * fontScale)}px`,
          });
        }
      }

      container.style.setProperty('--gp-word-top', `${viewHeight * 0.46 - (bbox.height * fontScale) / 2}px`);
      container.style.setProperty('--gp-word-bottom', `${viewHeight * 0.46 + (bbox.height * fontScale) / 2}px`);
      container.dataset.gpReady = 'true';
      container.dataset.gpMotion = !mediaReducedMotion.matches && frameReady && !fontTimedOut && currentTarget ? 'on' : 'off';
    };

    const onFrame = (timestamp?: number) => {
      animFrameId = 0;
      if (!unmounted) {
        if (timestamp !== undefined && !frameReady) {
          frameReady = true;
          if (!fontTimedOut) {
            fontTimedOut = performance.now() - startTime > 2500;
          }
          needsLayout = true;
        }
        if (needsLayout) {
          needsLayout = false;
          layout();
        }
        if (inkReady) {
          paint(getPosition());
        }
      }
    };

    const schedule = () => {
      if (!animFrameId && isIntersecting) {
        animFrameId = requestAnimationFrame(onFrame);
      }
    };

    const onResize = () => {
      cancelAnimationFrame(animFrameId);
      needsLayout = true;
      onFrame();
    };

    const onScroll = () => {
      schedule();
    };

    const onChoose = (e: Event) => {
      if (!isInteractiveActive || getPosition() >= 0.04) return;
      const target = (e.target as HTMLElement).closest<HTMLElement>('[data-gp-letter]');
      const found = targetCircles.find((t) => t.index === Number(target?.dataset.gpLetter));
      if (found && found !== currentTarget) {
        select(found);
        paint(getPosition());
      }
    };

    const onKeyNav = (e: KeyboardEvent) => {
      if (!isInteractiveActive || !['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End'].includes(e.key)) return;
      e.preventDefault();
      const curIdx = targetCircles.indexOf(currentTarget!);
      const nextIdx =
        e.key === 'Home'
          ? 0
          : e.key === 'End'
          ? targetCircles.length - 1
          : (curIdx + (e.key === 'ArrowLeft' || e.key === 'ArrowUp' ? -1 : 1) + targetCircles.length) % targetCircles.length;
      const btn = letterButtons.find((b) => Number(b.dataset.gpLetter) === targetCircles[nextIdx].index);
      btn?.focus({ preventScroll: true });
    };

    const onSelectPick = () => {
      if (!isInteractiveActive || getPosition() >= 0.04 || !selectEl) return;
      const found = targetCircles.find((t) => t.index === Number(selectEl.value));
      if (found) {
        select(found);
        paint(getPosition());
      }
    };

    choicesEl?.addEventListener('pointerover', onChoose);
    choicesEl?.addEventListener('click', onChoose);
    choicesEl?.addEventListener('focusin', onChoose);
    choicesEl?.addEventListener('keydown', onKeyNav as any);
    selectEl?.addEventListener('change', onSelectPick);

    const ro = new ResizeObserver(onResize);
    ro.observe(container);
    if (scroller) ro.observe(scroller);

    const io = new IntersectionObserver(
      ([entry]) => {
        isIntersecting = entry.isIntersecting;
        if (isIntersecting) {
          needsLayout = true;
          schedule();
        } else if (animFrameId) {
          cancelAnimationFrame(animFrameId);
          animFrameId = 0;
        }
      },
      { root: scroller, rootMargin: '100% 0px' }
    );
    io.observe(container);

    const scrollTarget = scroller ?? window;
    scrollTarget.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize);
    window.visualViewport?.addEventListener('resize', onResize);
    mediaReducedMotion.addEventListener('change', onResize);

    onFrame();
    schedule();

    return () => {
      unmounted = true;
      cancelAnimationFrame(animFrameId);
      ro.disconnect();
      io.disconnect();
      scrollTarget.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
      window.visualViewport?.removeEventListener('resize', onResize);
      mediaReducedMotion.removeEventListener('change', onResize);
      choicesEl?.removeEventListener('pointerover', onChoose);
      choicesEl?.removeEventListener('click', onChoose);
      choicesEl?.removeEventListener('focusin', onChoose);
      choicesEl?.removeEventListener('keydown', onKeyNav as any);
      selectEl?.removeEventListener('change', onSelectPick);
    };
  }, [text, focusChar, interactive, fontFamily, parsedWeight, parsedLength, clipId, hasFront]);

  return (
    <section
      ref={containerRef}
      id={id}
      className={className}
      aria-label={text}
      style={{
        ['--gp-length' as any]: parsedLength,
        ['--gp-characters' as any]: Array.from(text).length,
        ...style,
      }}
    >
      <style>{`
        ${scopeSelector} {
          --gp-paper: #ffffff;
          --gp-ink: #071f16;
          --gp-field: #0b3b2a;
          --gp-foreground: #f8faf8;
          position: relative;
          isolation: isolate;
          background: var(--gp-paper);
          color: var(--gp-ink);
          font-family: inherit;
        }
        ${scopeSelector} > [data-gp-viewport] {
          position: absolute;
          inset: 0 auto auto 0;
          height: 100vh;
          height: 100svh;
          width: 0;
          pointer-events: none;
          visibility: hidden;
        }
        ${scopeSelector} [data-gp-pin] {
          position: relative;
          height: var(--gp-height, 100svh);
          overflow: clip;
          isolation: isolate;
          container-type: size;
        }
        ${scopeSelector} [data-gp-field] {
          position: absolute;
          inset: 0;
          background: var(--gp-field);
          opacity: 0;
          pointer-events: none;
        }
        ${scopeSelector}[data-gp-ready="true"] [data-gp-field] {
          opacity: 1;
        }
        ${scopeSelector} [data-gp-art] {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          overflow: visible;
          pointer-events: none;
        }
        ${scopeSelector} [data-gp-marks] {
          fill: none;
          stroke: var(--gp-ink);
          opacity: 0.6;
        }
        ${scopeSelector} [data-gp-choices] {
          position: absolute;
          inset: 0;
          visibility: hidden;
          pointer-events: none;
        }
        ${scopeSelector}[data-gp-choosing="true"] [data-gp-choices] {
          visibility: visible;
        }
        ${scopeSelector} [data-gp-letter] {
          box-sizing: border-box;
          position: absolute;
          border: 0;
          padding: 0;
          margin: 0;
          background: transparent;
          cursor: pointer;
          pointer-events: auto;
          touch-action: pan-y;
        }
        ${scopeSelector} [data-gp-letter]:disabled {
          pointer-events: none;
        }
        ${scopeSelector} [data-gp-letter]:focus-visible {
          outline: 2px solid var(--gp-field);
          outline-offset: 5px;
        }
        ${scopeSelector} [data-gp-touch-picker] {
          display: none;
          position: absolute;
          top: calc(var(--gp-word-bottom, 50%) + 42px);
          left: 50%;
          transform: translateX(-50%);
          font: 12px/1.4 inherit;
          align-items: center;
          gap: 12px;
          visibility: hidden;
        }
        ${scopeSelector}[data-gp-choosing="true"] [data-gp-touch-picker] {
          visibility: visible;
        }
        ${scopeSelector} [data-gp-select] {
          min-height: 44px;
          min-width: 90px;
          border: 1px solid #d8deda;
          border-radius: 6px;
          background: var(--gp-paper);
          color: var(--gp-ink);
          padding: 0 10px;
          font: inherit;
        }
        ${scopeSelector} [data-gp-select]:focus-visible {
          outline: 2px solid var(--gp-field);
          outline-offset: 4px;
        }
        @media (any-pointer: coarse) {
          ${scopeSelector} [data-gp-touch-picker] {
            display: flex;
          }
        }
        ${scopeSelector} [data-gp-fallback] {
          position: absolute;
          inset: 0;
          display: none;
          place-items: center;
          font-size: min(calc(100cqw / var(--gp-characters)), 38cqh);
          line-height: 1;
          color: var(--gp-field);
        }
        ${scopeSelector}[data-gp-ready="true"] [data-gp-fallback] {
          visibility: hidden;
        }
        ${scopeSelector} [data-gp-caption] {
          position: absolute;
          inset: auto 8% 9%;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
          font: 13px/1.4 inherit;
          opacity: var(--gp-caption, 1);
          pointer-events: var(--gp-caption-hit, auto);
        }
        ${scopeSelector} [data-gp-front] {
          position: absolute;
          inset: 0;
          opacity: var(--gp-caption, 1);
          pointer-events: none;
        }
        ${scopeSelector} [data-gp-front] a,
        ${scopeSelector} [data-gp-front] button {
          pointer-events: var(--gp-caption-hit, auto);
        }
        ${scopeSelector} [data-gp-front]:focus-within {
          opacity: 1;
        }
        ${scopeSelector} [data-gp-hint] {
          max-width: 30ch;
          color: var(--gp-ink);
        }
        ${scopeSelector} [data-gp-enter] {
          display: inline-flex;
          align-items: center;
          gap: 12px;
          min-height: 44px;
          color: inherit;
          font: inherit;
          text-decoration: none;
          letter-spacing: inherit;
        }
        ${scopeSelector} [data-gp-enter]:focus-visible {
          outline: 2px solid currentColor;
          outline-offset: 5px;
        }
        ${scopeSelector} [data-gp-caption]:focus-within {
          opacity: 1;
          pointer-events: auto;
        }
        ${scopeSelector} [data-gp-content] {
          box-sizing: border-box;
          position: relative;
          min-height: var(--gp-height, 100svh);
          padding: clamp(32px, 7%, 100px);
          display: grid;
          align-content: center;
          color: var(--gp-foreground);
          background: var(--gp-field);
          overflow-wrap: anywhere;
        }
        ${scopeSelector}[data-gp-motion="on"] [data-gp-pin] {
          position: sticky;
          top: 0;
        }
        ${scopeSelector}[data-gp-motion="off"] [data-gp-hint] {
          display: none;
        }
        ${scopeSelector}[data-gp-motion="on"] [data-gp-content] {
          margin-top: calc((var(--gp-length) - 1) * var(--gp-height));
          background: transparent;
          opacity: var(--gp-reveal, 0);
          pointer-events: none;
        }
        ${scopeSelector}[data-gp-motion="on"][data-gp-entered="true"] [data-gp-content] {
          pointer-events: auto;
        }
        ${scopeSelector}[data-gp-motion="on"]:has([data-gp-content]:focus-within) [data-gp-field] {
          clip-path: none !important;
        }
        ${scopeSelector}[data-gp-motion="on"] [data-gp-content]:focus-within {
          opacity: 1;
          pointer-events: auto;
        }
        ${scopeSelector}:has([data-gp-content]:focus-within) [data-gp-caption],
        ${scopeSelector}:has([data-gp-content]:focus-within) [data-gp-marks] {
          opacity: 0;
        }
        @media (prefers-reduced-motion: reduce) {
          ${scopeSelector} [data-gp-pin] {
            position: relative !important;
          }
          ${scopeSelector} [data-gp-content] {
            margin-top: 0 !important;
            opacity: 1 !important;
            background: var(--gp-field) !important;
            min-height: 0;
            padding-block: 64px;
          }
          ${scopeSelector} [data-gp-caption] {
            opacity: 1 !important;
          }
          ${scopeSelector} [data-gp-hint] {
            display: none;
          }
        }
      `}</style>
      <noscript>
        <style>{`
          ${scopeSelector} [data-gp-fallback] { display: grid; }
          ${scopeSelector} [data-gp-hint] { display: none; }
        `}</style>
      </noscript>

      <div data-gp-viewport aria-hidden="true" />
      <div data-gp-pin>
        <div data-gp-field aria-hidden="true" tabIndex={-1}>
          {background ?? (
            <div
              data-gp-default-field
              style={{
                position: 'absolute',
                inset: 0,
                transform: 'scale(var(--gp-field-scale, 1))',
                background:
                  'radial-gradient(circle at 18% 8%, rgba(34, 197, 94, 0.45), transparent 38%), radial-gradient(circle at 82% 20%, rgba(20, 87, 63, 0.5), transparent 30%), radial-gradient(circle at 48% 78%, rgba(7, 31, 22, 0.9), transparent 50%), linear-gradient(135deg, #071f16 0%, #0b3b2a 45%, #14573f 80%, #061a12 100%)',
              }}
            />
          )}
        </div>

        <svg data-gp-art aria-hidden="true" focusable="false">
          <defs>
            <clipPath id={clipId} clipPathUnits="userSpaceOnUse">
              <text
                data-gp-glyph
                x="0"
                y="0"
                style={{
                  fontFamily,
                  fontWeight: parsedWeight,
                  fontSize: 100,
                  fontKerning: 'none',
                  fontVariantLigatures: 'none',
                  letterSpacing: 0,
                }}
              >
                {text}
              </text>
            </clipPath>
          </defs>
          <g data-gp-marks style={{ visibility: annotations ? 'visible' : 'hidden' }}>
            <path />
          </g>
        </svg>

        <div data-gp-choices role="radiogroup" aria-label="Choose the letter to enter through" tabIndex={-1}>
          {charEntries.map(({ char, index }, i) => (
            <button
              key={index}
              type="button"
              role="radio"
              aria-checked="false"
              tabIndex={-1}
              data-gp-letter={index}
              aria-label={`${char}, letter ${i + 1} of ${charEntries.length}`}
            />
          ))}
        </div>

        <label data-gp-touch-picker>
          <span style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clipPath: 'inset(50%)' }}>
            Entry letter
          </span>
          <select data-gp-select defaultValue="">
            <option value="" disabled>
              Choose a letter
            </option>
            {charEntries.map(({ char, index }, i) => (
              <option key={index} value={index}>
                {i + 1} · {char}
              </option>
            ))}
          </select>
        </label>

        {front && <div data-gp-front>{front}</div>}

        <span data-gp-fallback aria-hidden="true" style={{ fontFamily, fontWeight: parsedWeight }}>
          {text}
        </span>

        <div data-gp-caption>
          <span data-gp-hint aria-hidden="true">
            {interactive ? 'Scroll to explore ↓' : annotations ? 'A passage through type' : ''}
          </span>
          <a data-gp-enter href={`#${id}-content`}>
            {enterLabel}
            <span aria-hidden="true">↘</span>
          </a>
        </div>
      </div>

      <div data-gp-content id={`${id}-content`} tabIndex={-1}>
        {children ?? (
          <div>
            <h2 style={{ fontSize: 'clamp(28px, 4vw, 56px)', fontWeight: 600, margin: '0 0 16px' }}>
              Welcome to AgriVision
            </h2>
            <p style={{ fontSize: 16, opacity: 0.9, maxWidth: '40ch' }}>
              Smart farming, connected markets and better agricultural decisions.
            </p>
          </div>
        )}
      </div>
    </section>
  );
};

export default GlyphPortal;
