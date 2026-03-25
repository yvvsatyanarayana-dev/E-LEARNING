import { useState, useEffect, useRef } from "react";
import "./GlobalCursor.css";

export default function GlobalCursor() {
  const [cursorState, setCursorState] = useState("");
  const cursorRef = useRef(null);
  const ringRef = useRef(null);
  const mx = useRef(0), my = useRef(0);
  const tx = useRef(0), ty = useRef(0);
  const rafRef = useRef(null);

  useEffect(() => {
    let moved = false;
    const onMove = (e) => {
      mx.current = e.clientX;
      my.current = e.clientY;
      if (cursorRef.current) {
        if (!moved) {
          moved = true;
          cursorRef.current.style.opacity = "1";
          if (ringRef.current) ringRef.current.style.opacity = "1";
        }
        cursorRef.current.style.left = `${e.clientX}px`;
        cursorRef.current.style.top = `${e.clientY}px`;
      }
    };

    const onDown = () => {
      setCursorState("c-click");
      setTimeout(() => setCursorState(""), 160);
    };

    const onOver = (e) => {
      const target = e.target;
      const isClickable = 
        target.tagName === 'A' || 
        target.tagName === 'BUTTON' || 
        target.closest('a') || 
        target.closest('button') ||
        window.getComputedStyle(target).cursor === 'pointer';
      
      if (isClickable) {
        setCursorState("c-hover");
      } else {
        setCursorState("");
      }
    };

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mousedown", onDown);
    window.addEventListener("mouseover", onOver);

    const tick = () => {
      tx.current += (mx.current - tx.current) * 0.11;
      ty.current += (my.current - ty.current) * 0.11;
      if (ringRef.current) {
        ringRef.current.style.left = `${tx.current}px`;
        ringRef.current.style.top = `${ty.current}px`;
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mousedown", onDown);
      window.removeEventListener("mouseover", onOver);
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  useEffect(() => {
    if (cursorState) {
      document.body.classList.add(cursorState);
    } else {
      document.body.classList.remove("c-hover", "c-click");
    }
    return () => document.body.classList.remove("c-hover", "c-click");
  }, [cursorState]);

  return (
    <>
      <div className="sc-cursor" ref={cursorRef} style={{ opacity: 0 }} />
      <div className="sc-cursor-ring" ref={ringRef} style={{ opacity: 0 }} />
      <div className="sc-noise" />
    </>
  );
}
