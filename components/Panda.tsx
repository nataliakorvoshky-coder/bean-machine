"use client";
import { useEffect, useRef, useState } from "react";

type State = "walk" | "sleep" | "drink" | "angry" | "play";

type PandaProps = {
  employeeName?: string;
};

export default function Panda({ employeeName = "there" }: PandaProps) {
  const pandaRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const bubbleRef = useRef<HTMLDivElement>(null);

  const [state, setState] = useState<State>("walk");
  const [inventoryOpen, setInventoryOpen] = useState(false);

  const pos = useRef<number>(200);
  const dir = useRef<number>(1);

  const velocity = useRef<number>(0.045);
  const last = useRef<number>(performance.now());

  const lockedPosition = useRef<number | null>(null);

  const draggedItem = useRef<string | null>(null);

  const idleTimer = useRef<number>(0);
  const sleepStarted = useRef<boolean>(false);

  const heartCooldown = useRef<boolean>(false);
  const zCooldown = useRef<boolean>(false);
  const heartCount = useRef<number>(0);

  const currentState = useRef<State>("walk");
  const [speech, setSpeech] = useState<string | null>(null);

  useEffect(() => {
    currentState.current = state;
  }, [state]);

  // WAKE UP (FIXED Z CLEANUP)
  useEffect(() => {
    const wake = () => {
      idleTimer.current = 0;

      document.querySelectorAll(".panda-z").forEach(el => el.remove());

      if (currentState.current === "sleep") {
        setState("walk");
        sleepStarted.current = false;
        zCooldown.current = false;
      }
    };

    window.addEventListener("mousemove", wake);
    window.addEventListener("click", wake);
    window.addEventListener("keydown", wake);

    return () => {
      window.removeEventListener("mousemove", wake);
      window.removeEventListener("click", wake);
      window.removeEventListener("keydown", wake);
    };
  }, []);

  function speak(text: string) {
    setSpeech(text);
    setTimeout(() => setSpeech(null), 3000);
  }

  function spawnZ() {
    if (zCooldown.current || currentState.current !== "sleep") return;

    zCooldown.current = true;

    const el = document.createElement("div");
    el.className = "panda-z";
    el.innerText = "💤";

    el.style.position = "fixed";
    el.style.left = pos.current + 50 + "px";
    el.style.bottom = "140px";
    el.style.transition = "all 2s linear";

    document.body.appendChild(el);

    setTimeout(() => {
      el.style.transform = "translateY(-80px)";
      el.style.opacity = "0";
    }, 50);

    setTimeout(() => {
      el.remove();
      zCooldown.current = false;
    }, 2000);
  }

  function spawnHeart() {
    if (heartCooldown.current) return;
    heartCooldown.current = true;

    const el = document.createElement("div");
    el.innerText = "💖";
    el.style.position = "fixed";
    el.style.left = pos.current + 40 + "px";
    el.style.bottom = "120px";
    el.style.transition = "all 1s ease-out";

    document.body.appendChild(el);

    setTimeout(() => {
      el.style.transform = "translateY(-60px)";
      el.style.opacity = "0";
    }, 10);

    setTimeout(() => el.remove(), 1000);

    setTimeout(() => (heartCooldown.current = false), 1200);
  }

  useEffect(() => {
    const panda = pandaRef.current!;
    const img = imgRef.current!;

    const walkFrames = [
      "/panda/walk/walk_1.png",
      "/panda/walk/walk_2_(2).png",
      "/panda/walk/walk_4_(1).png",
      "/panda/walk/walk_5_(1).png",
    ];

    const sleepFrames = [
      "/panda/sleep/sleep1.png",
      "/panda/sleep/sleep2.png",
    ];

    function animate(t: number) {
      const d = t - last.current;
      last.current = t;

      const isAction = currentState.current !== "walk";

      if (currentState.current === "walk") {
        idleTimer.current += d;

        if (idleTimer.current > 8000 && !sleepStarted.current) {
          sleepStarted.current = true;
          setState("sleep");
        }
      }

      if (isAction) {
        if (lockedPosition.current === null) {
          lockedPosition.current = pos.current;
        }

        pos.current = lockedPosition.current;
        panda.style.left = pos.current + "px";

        if (state === "sleep") {
          const frame = Math.floor(t * 0.002) % sleepFrames.length;
          img.src = sleepFrames[frame];

          const breathe = 1 + Math.sin(t * 0.002) * 0.05;
          panda.style.transform = `scale(${breathe}) scaleX(${dir.current})`;

          if (Math.random() < 0.01) spawnZ();
        }

        if (state === "drink") {
          img.src = "/panda/drink/drink.png";
          panda.style.transform = `scaleX(${dir.current})`;
        }

        if (state === "angry") {
          img.src = "/panda/angry/angry.png";
          panda.style.transform = `scaleX(${dir.current})`;
        }

        if (state === "play") {
          img.src = "/panda/happy/happy.png";

          const wiggle = Math.sin(t * 0.02) * 8;
          panda.style.transform = `rotate(${wiggle}deg) scaleX(${dir.current})`;

          if (heartCount.current < 3 && Math.random() < 0.1) {
            spawnHeart();
            heartCount.current++;
          }
        }
      } else {
        if (lockedPosition.current !== null) {
          lockedPosition.current = null;
          last.current = t;
        }

        sleepStarted.current = false;

        pos.current += dir.current * velocity.current * d;

        const max = window.innerWidth - 120;

        if (pos.current <= 0) {
          pos.current = 0;
          dir.current = 1;
        }

        if (pos.current >= max) {
          pos.current = max;
          dir.current = -1;
        }

        panda.style.left = pos.current + "px";

        const frame = Math.floor(t * 0.008) % walkFrames.length;
        img.src = walkFrames[frame];

        const bob = Math.sin(t * 0.02) * 4;
        panda.style.transform = `translateY(${bob}px) scaleX(${dir.current})`;
      }

      // FIX: ALWAYS TRACK BUBBLE
      if (bubbleRef.current && pandaRef.current) {
        const inv = document.getElementById("panda-inventory");
if (inv && pandaRef.current) {
  const rect = pandaRef.current.getBoundingClientRect();
  inv.style.left = rect.left + "px";
}
        const rect = pandaRef.current.getBoundingClientRect();

        bubbleRef.current.style.left =
          rect.left + rect.width / 2 - bubbleRef.current.offsetWidth / 2 + "px";

        bubbleRef.current.style.top = rect.top - 50 + "px";
      }

      requestAnimationFrame(animate);
    }

    requestAnimationFrame(animate);
  }, [state]);

  useEffect(() => {
    if (!employeeName) return;

    const hour = new Date().getHours();

    let greeting = "Hello";
    if (hour < 12) greeting = "Good morning";
    else if (hour < 18) greeting = "Good afternoon";
    else greeting = "Good evening";

    const timer = setTimeout(() => {
      speak(`${greeting}, ${employeeName}`);
    }, 800);

    return () => clearTimeout(timer);
  }, [employeeName]);

  function triggerAction(newState: State) {
    heartCount.current = 0;
    setState(newState);

    setTimeout(() => {
      setState("walk");
      velocity.current = 0.045;
      idleTimer.current = 0;
    }, 2000);
  }

  function onDropOnPanda() {
    const item = draggedItem.current;
    if (!item) return;

    if (item === "☕") triggerAction("drink");
    else if (item === "🍪") triggerAction("play");
    else if (item === "🎾") triggerAction("play");

    draggedItem.current = null;
  }

  return (
    <>
    {inventoryOpen && (
<div
  id="panda-inventory"
  style={{
      position: "fixed",
      bottom: 130,
      left: pos.current,
      background: "white",
      padding: "10px",
      borderRadius: "12px",
      boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
      display: "flex",
      gap: "10px",
      zIndex: 10000,
    }}
  >
    {["☕", "🍪", "🎾"].map((item) => (
      <div
        key={item}
        draggable
        onDragStart={() => {
          draggedItem.current = item;
        }}
        style={{
          fontSize: "22px",
          cursor: "grab",
        }}
      >
        {item}
      </div>
    ))}
  </div>
)}

      {speech && (
        <div
          ref={bubbleRef}
          style={{
            position: "fixed",
            background: "white",
            padding: "6px 10px",
            borderRadius: 10,
            fontSize: 12,
            boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
            pointerEvents: "none",
            zIndex: 10000,
            whiteSpace: "nowrap",
            opacity: speech ? 1 : 0,
            transition: "opacity 0.3s ease",
          }}
        >
          {speech}
        </div>
      )}

      <div
        ref={pandaRef}
        onClick={() => setInventoryOpen((v) => !v)}
        onDragOver={(e) => e.preventDefault()}
        onDrop={onDropOnPanda}
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          width: 120,
          height: 120,
          zIndex: 9999,
        }}
      >
        <img ref={imgRef} style={{ width: "100%" }} />
      </div>
    </>
  );
}